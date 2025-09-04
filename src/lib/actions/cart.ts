"use server";

import { and, desc, eq, or, sql } from "drizzle-orm";
import { db } from "../db";
import {
  carts,
  cartItems,
  productVariants,
  products,
  productImages,
  sizes,
  finishes,
} from "../db/schema";
import {
  createGuestSession,
  getCurrentUser,
  getGuestSession,
} from "../auth/actions";
import { revalidatePath } from "next/cache";

// UI cart item for furniture: finish is the primary variant option
export type UICartItem = {
  id: string;
  productVariantId: string;
  productId: string;
  name: string;
  size: string | null;
  finish: string | null;
  finishHex?: string | null;
  price: number;
  imageUrl: string | null;
  quantity: number;
};

export type UICart = {
  id: string | null;
  items: UICartItem[];
  subtotal: number;
  count: number;
};

async function resolveSession() {
  const user = await getCurrentUser();
  if (user?.id) {
    // Ensure the user exists in our DB; after a drop/reseed the auth user may not yet be in the DB
    try {
      const { user: userTable } = await import("../db/schema/user");
      const found = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, user.id as string))
        .limit(1);
      if (found.length) return { userId: user.id as string | null, guestId: null };
      // Else fall through to guest session
    } catch {
      // If any error in checking, fallback to guest
    }
  }
  let guest = await getGuestSession();
  if (!guest) {
    const created = await createGuestSession();
    if (!("sessionToken" in created)) throw new Error("Failed to create guest session");
    guest = await getGuestSession();
  }
  return { userId: null, guestId: guest!.id as string | null };
}

async function getOrCreateCartId() {
  const { userId, guestId } = await resolveSession();
  const where = userId ? eq(carts.userId, userId) : eq(carts.guestId, guestId!);
  const existing = await db.select().from(carts).where(where).limit(1);
  if (existing.length) return existing[0].id as string;
  const inserted = await db
    .insert(carts)
    .values(userId ? { userId } : { guestId: guestId! })
    .returning({ id: carts.id });
  return inserted[0].id as string;
}

function toUICart(items: Array<UICartItem>, cartId: string | null): UICart {
  const subtotal = items.reduce((sum, it) => sum + it.price * it.quantity, 0);
  const count = items.reduce((sum, it) => sum + it.quantity, 0);
  return { id: cartId, items, subtotal, count };
}

export async function getCart(): Promise<UICart> {
  const { userId, guestId } = await resolveSession();
  const where = userId ? eq(carts.userId, userId) : eq(carts.guestId, guestId!);
  const found = await db.select().from(carts).where(where).limit(1);
  if (!found.length) return toUICart([], null);

  const cartId = found[0].id as string;

  // Pick a single image per line item: prefer variant primary, then any variant image, then product primary
  const imageExpr = sql<string | null>`
    coalesce(
      max(case when ${productImages.variantId} = ${productVariants.id} and ${productImages.isPrimary} = true then ${productImages.url} end),
      max(case when ${productImages.variantId} = ${productVariants.id} then ${productImages.url} end),
      max(case when ${productImages.productId} = ${products.id} and ${productImages.isPrimary} = true then ${productImages.url} end),
      max(${productImages.url})
    )
  `;

  const rows = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      productVariantId: productVariants.id,
      productId: products.id,
      name: products.name,
      size: sizes.name,
      finish: finishes.name,
      finishHex: finishes.hexCode,
      price: sql<number>`coalesce(${productVariants.salePrice}, ${productVariants.price})`,
      imageUrl: imageExpr,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.productVariantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .leftJoin(finishes, eq(finishes.id, productVariants.finishId))
    .leftJoin(
      productImages,
      or(
        eq(productImages.variantId, productVariants.id),
        eq(productImages.productId, products.id)
      )
    )
    .where(eq(cartItems.cartId, cartId))
    .groupBy(
      cartItems.id,
      cartItems.quantity,
      productVariants.id,
      products.id,
      products.name,
      sizes.name,
      finishes.name,
      finishes.hexCode
    )
    .orderBy(desc(cartItems.createdAt));

  const items: UICartItem[] = rows.map((r) => ({
    id: r.id,
    productVariantId: r.productVariantId,
    productId: r.productId,
    name: r.name,
    size: r.size ?? null,
    finish: r.finish ?? null,
    finishHex: (r.finishHex as string | null) ?? null,
    price: Number(r.price),
    imageUrl: r.imageUrl ?? null,
    quantity: r.quantity,
  }));

  return toUICart(items, cartId);
}

export async function addCartItem(input: { productVariantId: string; quantity?: number }) {
  const qty = Math.max(1, input.quantity ?? 1);
  const cartId = await getOrCreateCartId();
  // Upsert to avoid duplicate rows on rapid clicks or concurrent calls
  await db
    .insert(cartItems)
    .values({ cartId, productVariantId: input.productVariantId, quantity: qty })
    .onConflictDoUpdate({
      target: [cartItems.cartId, cartItems.productVariantId],
      set: {
        // increment existing quantity atomically
        quantity: sql`${cartItems.quantity} + ${qty}`,
        updatedAt: sql`now()`,
      },
    });

  revalidatePath("/cart");
  return getCart();
}

export async function updateCartItem(input: {
  itemId?: string;
  productVariantId?: string;
  quantity: number;
}) {
  const cart = await getCart();
  if (!cart.id) return cart;

  const nextQty = Math.max(1, input.quantity);

  let target = null as { id: string; quantity: number; productVariantId: string } | null;

  if (input.itemId) {
    const row = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        productVariantId: cartItems.productVariantId,
      })
      .from(cartItems)
      .where(and(eq(cartItems.id, input.itemId), eq(cartItems.cartId, cart.id)))
      .limit(1);
    target = row[0] || null;
  } else if (input.productVariantId) {
    const row = await db
      .select({
        id: cartItems.id,
        quantity: cartItems.quantity,
        productVariantId: cartItems.productVariantId,
      })
      .from(cartItems)
      .where(
        and(eq(cartItems.cartId, cart.id), eq(cartItems.productVariantId, input.productVariantId))
      )
      .limit(1);
    target = row[0] || null;
  }

  if (!target) return cart;

  await db
    .update(cartItems)
    .set({ quantity: nextQty, updatedAt: sql`now()` })
    .where(eq(cartItems.id, target.id));

  revalidatePath("/cart");
  return getCart();
}

export async function removeCartItem(input: { itemId: string }) {
  const cart = await getCart();
  if (!cart.id) return cart;

  await db.delete(cartItems).where(and(eq(cartItems.id, input.itemId), eq(cartItems.cartId, cart.id)));
  revalidatePath("/cart");
  return getCart();
}

export async function clearCart() {
  const cart = await getCart();
  if (!cart.id) return cart;

  await db.delete(cartItems).where(eq(cartItems.cartId, cart.id));
  revalidatePath("/cart");
  return getCart();
}

export async function validateCartStock(): Promise<
  | { ok: true }
  | {
      ok: false;
      items: Array<{
        productVariantId: string;
        requested: number;
        available: number;
        name: string;
        sku?: string | null;
      }>;
    }
> {
  const { userId, guestId } = await resolveSession();
  const where = userId ? eq(carts.userId, userId) : eq(carts.guestId, guestId!);
  const found = await db.select().from(carts).where(where).limit(1);
  if (!found.length) return { ok: true };
  const cartId = found[0].id as string;

  const rows = await db
    .select({
      variantId: productVariants.id,
      sku: productVariants.sku,
      name: products.name,
      requested: cartItems.quantity,
      available: productVariants.inStock,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.productVariantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .where(eq(cartItems.cartId, cartId));

  const insufficient = rows
    .filter((r) => (r.requested ?? 0) > (r.available ?? 0))
    .map((r) => ({
      productVariantId: r.variantId as string,
      requested: r.requested,
      available: r.available ?? 0,
      name: r.name,
      sku: r.sku,
    }));

  if (insufficient.length) return { ok: false, items: insufficient };
  return { ok: true };
}

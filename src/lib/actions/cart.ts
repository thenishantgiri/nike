"use server";

import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "../db";
import {
  carts,
  cartItems,
  productVariants,
  products,
  productImages,
  sizes,
  colors,
  genders,
} from "../db/schema";
import {
  createGuestSession,
  getCurrentUser,
  getGuestSession,
} from "../auth/actions";
import { revalidatePath } from "next/cache";

export type UICartItem = {
  id: string;
  productVariantId: string;
  productId: string;
  name: string;
  gender: string | null;
  size: string | null;
  color: string | null;
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
  if (user) return { userId: user.id as string | null, guestId: null };
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

  const rows = await db
    .select({
      id: cartItems.id,
      quantity: cartItems.quantity,
      productVariantId: productVariants.id,
      productId: products.id,
      name: products.name,
      gender: genders.label,
      size: sizes.name,
      color: colors.name,
      price: productVariants.price,
      imageUrl: productImages.url,
    })
    .from(cartItems)
    .innerJoin(productVariants, eq(productVariants.id, cartItems.productVariantId))
    .innerJoin(products, eq(products.id, productVariants.productId))
    .leftJoin(sizes, eq(sizes.id, productVariants.sizeId))
    .leftJoin(colors, eq(colors.id, productVariants.colorId))
    .leftJoin(genders, eq(genders.id, products.genderId))
    .leftJoin(
      productImages,
      and(eq(productImages.productId, products.id), eq(productImages.isPrimary, true))
    )
    .where(eq(cartItems.cartId, cartId))
    .orderBy(desc(cartItems.createdAt));

  const items: UICartItem[] = rows.map((r) => ({
    id: r.id,
    productVariantId: r.productVariantId,
    productId: r.productId,
    name: r.name,
    gender: r.gender ?? null,
    size: r.size ?? null,
    color: r.color ?? null,
    price: Number(r.price),
    imageUrl: r.imageUrl ?? null,
    quantity: r.quantity,
  }));

  return toUICart(items, cartId);
}

export async function addCartItem(input: { productVariantId: string; quantity?: number }) {
  const qty = Math.max(1, input.quantity ?? 1);
  const cartId = await getOrCreateCartId();

  const existing = await db
    .select()
    .from(cartItems)
    .where(
      and(eq(cartItems.cartId, cartId), eq(cartItems.productVariantId, input.productVariantId))
    )
    .limit(1);

  if (existing.length) {
    await db
      .update(cartItems)
      .set({ quantity: existing[0].quantity + qty, updatedAt: sql`now()` })
      .where(eq(cartItems.id, existing[0].id));
  } else {
    await db
      .insert(cartItems)
      .values({ cartId, productVariantId: input.productVariantId, quantity: qty });
  }

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

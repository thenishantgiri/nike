"use server";

import { getCurrentUser } from "@/lib/auth/actions";
import { db } from "@/lib/db";
import { addresses, NewAddress } from "@/lib/db/schema/addresses";
import { cartItems, carts } from "@/lib/db/schema/carts";
import { colors } from "@/lib/db/schema/filters/colors";
import { sizes } from "@/lib/db/schema/filters/sizes";
import {
  NewOrder,
  NewOrderItem,
  orderItems,
  orders,
} from "@/lib/db/schema/orders";
import { NewPayment, payments } from "@/lib/db/schema/payments";
import { productImages } from "@/lib/db/schema/product-images";
import { products } from "@/lib/db/schema/products";
import { productVariants } from "@/lib/db/schema/variants";
import { getStripe } from "@/lib/stripe/client";
import { eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

function toTwoDecimals(n: number) {
  return Number(Number(n).toFixed(2));
}

export async function createOrder(stripeSessionId: string, userId?: string) {
  const session = (await getStripe().checkout.sessions.retrieve(
    stripeSessionId,
    {
      expand: ["payment_intent"],
    }
  )) as Stripe.Checkout.Session;

  const cartId = (session.metadata?.cartId as string) || null;
  const uid = userId || (session.metadata?.userId as string) || null;
  const transactionId =
    (typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id) || session.id;

  const existingPayment = await db
    .select()
    .from(payments)
    .where(eq(payments.transactionId, transactionId))
    .limit(1);

  if (existingPayment.length) {
    return { ok: true, orderId: existingPayment[0].orderId as string };
  }

  if (!cartId || !uid) {
    throw new Error("Missing cart or user for order creation");
  }

  const cart = (
    await db.select().from(carts).where(eq(carts.id, cartId)).limit(1)
  )[0];
  if (!cart) throw new Error("Cart not found");

  const items = await db
    .select({
      id: cartItems.id,
      productVariantId: cartItems.productVariantId,
      quantity: cartItems.quantity,
      price: productVariants.price,
      salePrice: productVariants.salePrice,
    })
    .from(cartItems)
    .leftJoin(
      productVariants,
      eq(productVariants.id, cartItems.productVariantId)
    )
    .where(eq(cartItems.cartId, cartId));

  if (!items.length) throw new Error("Cart is empty");

  let merchandiseTotal = 0;
  for (const it of items) {
    const unit = Number(it.salePrice ?? it.price ?? 0);
    merchandiseTotal += toTwoDecimals(unit) * it.quantity;
  }

  const shippingCents = (session.shipping_cost?.amount_total ?? 0) as number;
  const taxCents = (session.total_details?.amount_tax ?? 0) as number;
  const discountCents = (session.total_details?.amount_discount ?? 0) as number;
  const sessionTotalCents = (session.amount_total ?? null) as number | null;
  const computedTotalDec =
    merchandiseTotal + (shippingCents + taxCents - discountCents) / 100;
  const totalAmountDec =
    sessionTotalCents != null ? sessionTotalCents / 100 : computedTotalDec;
  const currencyCode = (
    (session.currency as string | null) ||
    process.env.STRIPE_CURRENCY ||
    "usd"
  ).toUpperCase();
  const envShip = Number(process.env.STRIPE_SHIPPING_FIXED_AMOUNT || "0");
  const shippingAmountDec = session.shipping_cost
    ? toTwoDecimals(shippingCents / 100)
    : toTwoDecimals(Number.isFinite(envShip) ? Math.max(0, envShip) : 0);

  let shippingAddressId: string | null = null;
  let billingAddressId: string | null = null;

  const shipping = session.customer_details?.address;
  if (shipping) {
    const ins = await db
      .insert(addresses)
      .values({
        userId: uid as string,
        type: "shipping",
        line1: shipping.line1 || "",
        line2: shipping.line2 || null,
        city: shipping.city || "",
        state: shipping.state || "",
        postalCode: shipping.postal_code || "",
        country: shipping.country || "",
      } as NewAddress)
      .returning({ id: addresses.id });
    shippingAddressId = ins[0].id as string;
  }

  const billing = session.customer_details?.address;
  if (billing) {
    const ins = await db
      .insert(addresses)
      .values({
        userId: uid as string,
        type: "billing",
        line1: billing.line1 || "",
        line2: billing.line2 || null,
        city: billing.city || "",
        state: billing.state || "",
        postalCode: billing.postal_code || "",
        country: billing.country || "",
      } as NewAddress)
      .returning({ id: addresses.id });
    billingAddressId = ins[0].id as string;
  }

  if (!shippingAddressId || !billingAddressId) {
    throw new Error("Missing address information from Stripe session");
  }

  const [createdOrder] = await db
    .insert(orders)
    .values({
      userId: uid as string,
      status: "paid",
      totalAmount: String(toTwoDecimals(totalAmountDec)),
      currency: currencyCode,
      shippingAmount: String(shippingAmountDec),
      shippingAddressId: shippingAddressId as string,
      billingAddressId: billingAddressId as string,
    } as NewOrder)
    .returning();

  for (const it of items) {
    const unit = toTwoDecimals(Number(it.salePrice ?? it.price ?? 0));
    await db.insert(orderItems).values({
      orderId: createdOrder.id as string,
      productVariantId: it.productVariantId as string,
      quantity: it.quantity,
      priceAtPurchase: String(unit),
    } as NewOrderItem);

    // Decrement inventory (prevent negative)
    await db
      .update(productVariants)
      .set({
        inStock: sql`GREATEST(${productVariants.inStock} - ${it.quantity}, 0)`,
      })
      .where(eq(productVariants.id, it.productVariantId as string));
  }

  await db.insert(payments).values({
    orderId: createdOrder.id as string,
    method: "stripe",
    status: "completed",
    currency: currencyCode,
    transactionId,
    paidAt: new Date(),
  } as NewPayment);

  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));
  await db.delete(carts).where(eq(carts.id, cartId));
  revalidatePath("/cart");

  return { ok: true, orderId: createdOrder.id as string };
}

export async function getOrder(orderId: string) {
  const ord = (
    await db.select().from(orders).where(eq(orders.id, orderId)).limit(1)
  )[0];
  if (!ord) return null;

  const items = await db
    .select({
      id: orderItems.id,
      quantity: orderItems.quantity,
      unitPrice: orderItems.priceAtPurchase,
      variantId: productVariants.id,
      sku: productVariants.sku,
      productId: products.id,
      productName: products.name,
      sizeName: sizes.name,
      colorName: colors.name,
      colorHex: colors.hexCode,
      imageUrl: productImages.url,
    })
    .from(orderItems)
    .leftJoin(
      productVariants,
      eq(orderItems.productVariantId, productVariants.id)
    )
    .leftJoin(products, eq(productVariants.productId, products.id))
    .leftJoin(sizes, eq(productVariants.sizeId, sizes.id))
    .leftJoin(colors, eq(productVariants.colorId, colors.id))
    .leftJoin(productImages, eq(productImages.variantId, productVariants.id))
    .where(eq(orderItems.orderId, orderId));

  const payment = (
    await db
      .select({
        method: payments.method,
        status: payments.status,
        transactionId: payments.transactionId,
        paidAt: payments.paidAt,
      })
      .from(payments)
      .where(eq(payments.orderId, orderId))
      .limit(1)
  )[0];

  const shipping = ord.shippingAddressId
    ? (
        await db
          .select()
          .from(addresses)
          .where(eq(addresses.id, ord.shippingAddressId as string))
          .limit(1)
      )[0]
    : null;

  const billing = ord.billingAddressId
    ? (
        await db
          .select()
          .from(addresses)
          .where(eq(addresses.id, ord.billingAddressId as string))
          .limit(1)
      )[0]
    : null;

  return {
    id: ord.id as string,
    status: ord.status as string,
    totalAmount: Number(ord.totalAmount),
    currency: ord.currency as string,
    shippingAmount: Number(ord.shippingAmount ?? 0),
    createdAt:
      (ord.createdAt as unknown as Date)?.toISOString?.() ||
      new Date(ord.createdAt as unknown as string).toISOString(),
    items: items.map((i) => {
      const unit = Number(i.unitPrice);
      return {
        id: i.id as string,
        variantId: i.variantId as string,
        sku: i.sku as string,
        product: { id: i.productId as string, name: i.productName as string },
        size: i.sizeName as string | null,
        color: {
          name: (i.colorName as string) || null,
          hex: (i.colorHex as string) || null,
        },
        imageUrl: (i.imageUrl as string) || null,
        quantity: i.quantity,
        unitPrice: unit,
        lineTotal: unit * i.quantity,
      };
    }),
    addresses: {
      shipping: shipping
        ? {
            line1: shipping.line1,
            line2: shipping.line2,
            city: shipping.city,
            state: shipping.state,
            postalCode: shipping.postalCode,
            country: shipping.country,
          }
        : null,
      billing: billing
        ? {
            line1: billing.line1,
            line2: billing.line2,
            city: billing.city,
            state: billing.state,
            postalCode: billing.postalCode,
            country: billing.country,
          }
        : null,
    },
    payment: payment
      ? {
          method: payment.method as string,
          status: payment.status as string,
          transactionLast8: payment.transactionId
            ? String(payment.transactionId).slice(-8)
            : null,
          paidAt: payment.paidAt
            ? new Date(payment.paidAt as unknown as string).toISOString()
            : null,
        }
      : null,
  };
}

export async function createCodOrder(formData: FormData) {
  const user = await getCurrentUser();
  if (!user?.id) {
    return { error: "You must be signed in to place a COD order." };
  }

  const required = (k: string) => {
    const v = (formData.get(k) as string | null)?.trim();
    if (!v) throw new Error(`Missing field: ${k}`);
    return v;
  };

  try {
    const shipping = {
      line1: required("shipping_line1"),
      line2: (formData.get("shipping_line2") as string | null) || null,
      city: required("shipping_city"),
      state: required("shipping_state"),
      postalCode: required("shipping_postalCode"),
      country:
        (formData.get("shipping_country") as string | null)?.toUpperCase() ||
        "GB",
    };

    const billingSame =
      (formData.get("billing_same") as string | null) === "on";
    const billing = billingSame
      ? shipping
      : {
          line1: required("billing_line1"),
          line2: (formData.get("billing_line2") as string | null) || null,
          city: required("billing_city"),
          state: required("billing_state"),
          postalCode: required("billing_postalCode"),
          country:
            (formData.get("billing_country") as string | null)?.toUpperCase() ||
            "GB",
        };

    // Find user's cart
    const userCart = (
      await db
        .select()
        .from(carts)
        .where(eq(carts.userId, user.id as string))
        .limit(1)
    )[0];
    if (!userCart) return { error: "Your cart is empty." };

    const items = await db
      .select({
        id: cartItems.id,
        productVariantId: cartItems.productVariantId,
        quantity: cartItems.quantity,
        price: productVariants.price,
        salePrice: productVariants.salePrice,
        inStock: productVariants.inStock,
        sku: productVariants.sku,
      })
      .from(cartItems)
      .leftJoin(
        productVariants,
        eq(productVariants.id, cartItems.productVariantId)
      )
      .where(eq(cartItems.cartId, userCart.id));

    if (!items.length) return { error: "Your cart is empty." };

    const insufficient = items.filter((it) => (it.quantity ?? 0) > (it.inStock ?? 0));
    if (insufficient.length) {
      const msg = insufficient
        .map((it) => `${it.sku || it.productVariantId}: ${it.inStock ?? 0} in stock, requested ${it.quantity}`)
        .join("; ");
      return { error: `Insufficient stock for: ${msg}` };
    }

    let merchandiseTotal = 0;
    for (const it of items) {
      const unit = Number(it.salePrice ?? it.price ?? 0);
      merchandiseTotal += toTwoDecimals(unit) * it.quantity;
    }

    const shippingFixed = Number(
      process.env.STRIPE_SHIPPING_FIXED_AMOUNT || "0"
    );
    const shippingAmount = Number.isFinite(shippingFixed)
      ? Math.max(0, shippingFixed)
      : 0;
    const totalAmount = toTwoDecimals(merchandiseTotal + shippingAmount);
    const currencyCode = (
      (process.env.STRIPE_CURRENCY as string | undefined) || "usd"
    ).toUpperCase();

    // Insert addresses
    const [shipAddr] = await db
      .insert(addresses)
      .values({
        userId: user.id as string,
        type: "shipping",
        line1: shipping.line1,
        line2: shipping.line2,
        city: shipping.city,
        state: shipping.state,
        postalCode: shipping.postalCode,
        country: shipping.country,
      } as NewAddress)
      .returning();

    const [billAddr] = await db
      .insert(addresses)
      .values({
        userId: user.id as string,
        type: "billing",
        line1: billing.line1,
        line2: billing.line2,
        city: billing.city,
        state: billing.state,
        postalCode: billing.postalCode,
        country: billing.country,
      } as NewAddress)
      .returning();

    const [createdOrder] = await db
      .insert(orders)
      .values({
        userId: user.id as string,
        status: "pending",
        totalAmount: String(totalAmount),
        currency: currencyCode,
        shippingAmount: String(toTwoDecimals(shippingAmount)),
        shippingAddressId: shipAddr.id as string,
        billingAddressId: billAddr.id as string,
      } as NewOrder)
      .returning();

    for (const it of items) {
      const unit = toTwoDecimals(Number(it.salePrice ?? it.price ?? 0));
      await db.insert(orderItems).values({
        orderId: createdOrder.id as string,
        productVariantId: it.productVariantId as string,
        quantity: it.quantity,
        priceAtPurchase: String(unit),
      } as NewOrderItem);

      // Decrement inventory (prevent negative)
      await db
        .update(productVariants)
        .set({
          inStock: sql`GREATEST(${productVariants.inStock} - ${it.quantity}, 0)`,
        })
        .where(eq(productVariants.id, it.productVariantId as string));
    }

    await db.insert(payments).values({
      orderId: createdOrder.id as string,
      method: "cod",
      status: "initiated",
      currency: currencyCode,
    } as NewPayment);

    await db.delete(cartItems).where(eq(cartItems.cartId, userCart.id));
    await db.delete(carts).where(eq(carts.id, userCart.id));
    revalidatePath("/cart");

    return { ok: true, orderId: createdOrder.id as string };
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    return { error: msg };
  }
}

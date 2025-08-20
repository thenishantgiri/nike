"use server";

import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import { orders, orderItems, NewOrder, NewOrderItem } from "@/lib/db/schema/orders";
import { payments, NewPayment } from "@/lib/db/schema/payments";
import { cartItems, carts } from "@/lib/db/schema/carts";
import { productVariants } from "@/lib/db/schema/variants";
import { addresses, NewAddress } from "@/lib/db/schema/addresses";
import { getStripe } from "@/lib/stripe/client";
import Stripe from "stripe";

function toCents(n: number) {
  return Math.max(0, Math.round(Number(n) * 100));
}

export async function createOrder(stripeSessionId: string, userId?: string) {
  const session = (await getStripe().checkout.sessions.retrieve(stripeSessionId, {
    expand: ["payment_intent"],
  })) as Stripe.Checkout.Session;

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
    })
    .from(cartItems)
    .leftJoin(productVariants, eq(productVariants.id, cartItems.productVariantId))
    .where(eq(cartItems.cartId, cartId));

  if (!items.length) throw new Error("Cart is empty");

  let totalCents = 0;
  for (const it of items) totalCents += toCents(Number(it.price ?? 0)) * it.quantity;

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
      totalAmount: String(totalCents),
      shippingAddressId: shippingAddressId as string,
      billingAddressId: billingAddressId as string,
    } as NewOrder)
    .returning();

  for (const it of items) {
    await db.insert(orderItems).values({
      orderId: createdOrder.id as string,
      productVariantId: it.productVariantId as string,
      quantity: it.quantity,
      priceAtPurchase: String(toCents(Number(it.price ?? 0))),
    } as NewOrderItem);
  }

  await db.insert(payments).values({
    orderId: createdOrder.id as string,
    method: "stripe",
    status: "completed",
    transactionId,
    paidAt: new Date(),
  } as NewPayment);

  await db.delete(cartItems).where(eq(cartItems.cartId, cartId));

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
      productVariantId: orderItems.productVariantId,
      quantity: orderItems.quantity,
      priceAtPurchase: orderItems.priceAtPurchase,
    })
    .from(orderItems)
    .where(eq(orderItems.orderId, orderId));

  return {
    id: ord.id as string,
    status: ord.status as string,
    totalAmount: Number(ord.totalAmount),
    items: items.map((i) => ({
      id: i.id as string,
      productVariantId: i.productVariantId as string,
      quantity: i.quantity,
      priceAtPurchase: Number(i.priceAtPurchase),
    })),
  };
}

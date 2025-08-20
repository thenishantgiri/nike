"use server";

import { revalidatePath } from "next/cache";
import { getStripe } from "@/lib/stripe/client";
import { getCart } from "@/lib/actions/cart";
import { getCurrentUser, mergeGuestCartWithUserCart } from "@/lib/auth/actions";

function toCents(amount: number) {
  return Math.max(0, Math.round(amount * 100));
}

export async function createStripeCheckoutSession(cartId: string) {
  const user = await getCurrentUser();
  if (user) {
    await mergeGuestCartWithUserCart(user.id as string);
  }

  const cart = await getCart();
  if (!cart.id || cart.items.length === 0) {
    throw new Error("Cart is empty");
  }

  if (cart.id !== cartId) {
    throw new Error("Invalid cart");
  }

  const line_items = cart.items.map((it) => ({
    quantity: it.quantity,
    price_data: {
      currency: "usd",
      unit_amount: toCents(it.price),
      product_data: {
        name: it.name,
        images: it.imageUrl ? [it.imageUrl] : [],
        metadata: {
          productVariantId: it.productVariantId,
          productId: it.productId,
          size: it.size ?? "",
          color: it.color ?? "",
          gender: it.gender ?? "",
        },
      },
    },
  }));

  const shippingAmount = cart.count > 0 ? 2 : 0;

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    line_items,
    metadata: {
      cartId: cart.id,
      userId: user?.id ? String(user.id) : "",
    },
    success_url: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.BETTER_AUTH_URL || "http://localhost:3000"}/cart`,
    allow_promotion_codes: true,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Standard",
          type: "fixed_amount",
          fixed_amount: { amount: toCents(shippingAmount), currency: "usd" },
        },
      },
    ],
    shipping_address_collection: { allowed_countries: ["US", "CA"] },
  });

  revalidatePath("/cart");
  return { url: session.url as string };
}

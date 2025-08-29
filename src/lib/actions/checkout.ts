"use server";

import { getCart, validateCartStock } from "@/lib/actions/cart";
import { getCurrentUser, mergeGuestCartWithUserCart } from "@/lib/auth/actions";
import { getStripe } from "@/lib/stripe/client";
import type Stripe from "stripe";
import { revalidatePath } from "next/cache";

function toCents(amount: number) {
  return Math.max(0, Math.round(amount * 100));
}

export async function createStripeCheckoutSession(
  cartId: string
): Promise<{ url?: string; error?: string }> {
  try {
    const CURRENCY = (process.env.STRIPE_CURRENCY || "usd").toLowerCase();
    const SHIP_COUNTRIES = (process.env.STRIPE_SHIP_COUNTRIES || "US,CA")
      .split(",")
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);
    const allowedCountries =
      SHIP_COUNTRIES as Stripe.Checkout.SessionCreateParams.ShippingAddressCollection.AllowedCountry[];

    const paymentMethodTypes = (process.env.STRIPE_PAYMENT_METHOD_TYPES || "card")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean) as Stripe.Checkout.SessionCreateParams.PaymentMethodType[];

    const user = await getCurrentUser();
    if (user) {
      await mergeGuestCartWithUserCart(user.id as string);
    }

    const cart = await getCart();
    if (!cart.id || cart.items.length === 0) {
      return { error: "Cart is empty" };
    }

    if (cart.id !== cartId) {
      return { error: "Invalid cart" };
    }

    const stockCheck = await validateCartStock();
    if (!("ok" in stockCheck) || stockCheck.ok === false) {
      const msg = stockCheck.items
        .map((it) => `${it.name}${it.sku ? ` (${it.sku})` : ""}: ${it.available} in stock, requested ${it.requested}`)
        .join("; ");
      return { error: `Insufficient stock for: ${msg}` };
    }

    const line_items = cart.items.map((it) => {
      const img =
        it.imageUrl && it.imageUrl.startsWith("https://")
          ? it.imageUrl
          : undefined;
      return {
        quantity: it.quantity,
        price_data: {
          currency: CURRENCY,
          unit_amount: toCents(it.price),
          product_data: {
            name: it.name,
            ...(img ? { images: [img] } : {}),
            metadata: {
              productVariantId: String(it.productVariantId),
              productId: String(it.productId),
              size: it.size ?? "",
              color: it.color ?? "",
              gender: it.gender ?? "",
            },
          },
        },
      };
    });

    const configuredShipping = Number(process.env.STRIPE_SHIPPING_FIXED_AMOUNT || "2");
    const shippingAmount = cart.count > 0 && Number.isFinite(configuredShipping)
      ? Math.max(0, configuredShipping)
      : 0;

    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : process.env.BETTER_AUTH_URL || "http://localhost:3000";

    const session = await getStripe().checkout.sessions.create({
      mode: "payment",
      payment_method_types: paymentMethodTypes,
      line_items,
      metadata: {
        cartId: String(cart.id),
        userId: user?.id ? String(user.id) : "",
      },
      success_url: `${baseUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${baseUrl}/cart`,
      allow_promotion_codes: true,
      shipping_options: [
        {
          shipping_rate_data: {
            display_name: "Standard",
            type: "fixed_amount",
            fixed_amount: {
              amount: toCents(shippingAmount),
              currency: CURRENCY,
            },
          },
        },
      ],
      shipping_address_collection: { allowed_countries: allowedCountries },
    });

    revalidatePath("/cart");
    return { url: session.url as string };
  } catch (e: unknown) {
    const msg =
      typeof e === "object" && e !== null && "message" in e
        ? String((e as { message: unknown }).message)
        : "Unknown error";
    console.error("Stripe Checkout session create failed:", e);
    return { error: msg };
  }
}

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getStripe } from "@/lib/stripe/client";
import { createOrder } from "@/lib/actions/orders";
import Stripe from "stripe";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing signature", { status: 400 });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = getStripe().webhooks.constructEvent(
      rawBody,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET as string
    );
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown";
    return new NextResponse(`Webhook Error: ${message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const userId = (session.metadata?.userId as string) || undefined;
        await createOrder(session.id, userId);
        break;
      }
      case "payment_intent.payment_failed": {
        const pi = event.data.object as Stripe.PaymentIntent;
        console.error("Payment failed", pi.id);
        break;
      }
      default:
        break;
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "unknown";
    return new NextResponse(`Handler Error: ${message}`, { status: 500 });
  }

  return NextResponse.json({ received: true });
}

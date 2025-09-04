"use client";

import { createStripeCheckoutSession } from "@/lib/actions/checkout";
import { useCart } from "@/store/cart.store";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { formatCurrency } from "@/lib/utils/currency";
import { getShippingFlatAmountClient } from "@/lib/utils/shipping";

export default function CartSummary({
  isAuthed: _isAuthed,
}: {
  isAuthed: boolean;
}) {
  const cart = useCart((s) => s.cart);
  const [pending, startTransition] = useTransition();
  void _isAuthed;
  const [error, setError] = useState<string | null>(null);

  const router = useRouter();

  const configuredShipping = getShippingFlatAmountClient();
  const shipping = cart.count > 0 ? configuredShipping : 0;
  const total = cart.subtotal + shipping;

  function onCheckout() {
    setError(null);
    if (!cart.id || cart.count === 0) {
      setError("Your cart is empty.");
      return;
    }

    if (!_isAuthed) {
      router.push("/sign-in");
      return;
    }

    startTransition(async () => {
      const res = await createStripeCheckoutSession(cart.id as string);
      if (res?.url) {
        window.location.href = res.url;
        return;
      }
      const msg = res?.error || "Failed to start checkout. Please try again.";
      setError(msg);
      router.push(
        `/checkout/error?code=stripe_session_create&msg=${encodeURIComponent(
          msg
        )}`
      );
    });
  }

  return (
    <aside className="rounded-lg border border-light-300 p-6 bg-light-100 h-fit sticky top-24">
      <h2 className="font-jost text-heading-3 text-dark-900 mb-4">Summary</h2>
      <div className="flex justify-between py-2 text-dark-900 font-jost text-body">
        <span>Subtotal</span>
        <span>{formatCurrency(cart.subtotal)}</span>
      </div>
      <div className="flex justify-between py-2 text-dark-900 font-jost text-body">
        <span>Estimated Delivery &amp; Handling</span>
        <span>{formatCurrency(shipping)}</span>
      </div>
      <hr className="my-3 border-light-300" />
      <div className="flex justify-between py-2 text-dark-900 font-jost text-body font-medium">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>
      {error ? (
        <p className="text-red-600 font-jost text-body mt-2">{error}</p>
      ) : null}
      <div className="flex flex-col gap-3 mt-4">
        <button
          onClick={onCheckout}
          className="w-full bg-dark-900 text-light-100 rounded-full py-3 font-jost text-body hover:bg-dark-700 disabled:opacity-60"
          type="button"
          disabled={pending}
        >
          {pending ? "Redirecting..." : "Pay with Card (Stripe)"}
        </button>
        <button
          onClick={() => {
            if (!cart.id || cart.count === 0) {
              setError("Your cart is empty.");
              return;
            }
            if (!_isAuthed) {
              router.push(`/sign-in?redirect=${encodeURIComponent("/checkout")}`);
              return;
            }
            router.push("/checkout");
          }}
          className="w-full border border-dark-900 text-dark-900 rounded-full py-3 font-jost text-body hover:bg-light-200"
          type="button"
        >
          Cash on Delivery
        </button>
      </div>
    </aside>
  );
}

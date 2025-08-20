"use client";

import { useCart } from "@/store/cart.store";
import { useRouter } from "next/navigation";

export default function CartSummary({ isAuthed }: { isAuthed: boolean }) {
  const cart = useCart((s) => s.cart);
  const router = useRouter();

  const shipping = cart.count > 0 ? 2 : 0;
  const total = cart.subtotal + shipping;

  function onCheckout() {
    if (!isAuthed) router.push("/sign-in");
    else router.push("/checkout");
  }

  return (
    <aside className="rounded-lg border border-light-300 p-6 bg-light-100 h-fit sticky top-24">
      <h2 className="font-jost text-heading-3 text-dark-900 mb-4">Summary</h2>
      <div className="flex justify-between py-2 text-dark-900 font-jost text-body">
        <span>Subtotal</span>
        <span>${cart.subtotal.toFixed(2)}</span>
      </div>
      <div className="flex justify-between py-2 text-dark-900 font-jost text-body">
        <span>Estimated Delivery &amp; Handling</span>
        <span>${shipping.toFixed(2)}</span>
      </div>
      <hr className="my-3 border-light-300" />
      <div className="flex justify-between py-2 text-dark-900 font-jost text-body font-medium">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
      <button
        onClick={onCheckout}
        className="mt-4 w-full bg-dark-900 text-light-100 rounded-full py-3 font-jost text-body hover:bg-dark-700"
        type="button"
      >
        Proceed to Checkout
      </button>
    </aside>
  );
}

import CheckoutCodForm from "@/components/CheckoutCodForm";
import { getCart } from "@/lib/actions/cart";

export default async function CheckoutPage() {
  const cart = await getCart();
  const isEmpty = !cart.id || cart.items.length === 0;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="font-jost text-heading-3 text-dark-900 mb-6">Checkout</h1>
      {isEmpty ? (
        <div className="rounded-lg border border-light-300 p-6 bg-light-100">
          <p className="font-jost text-body text-dark-700">Your cart is empty.</p>
          <div className="mt-4 flex gap-3">
            <a href="/products" className="inline-block rounded-full bg-dark-900 text-light-100 px-6 py-3 font-jost">Browse products</a>
            <a href="/cart" className="inline-block rounded-full border border-dark-900 text-dark-900 px-6 py-3 font-jost hover:bg-light-200">Go to cart</a>
          </div>
        </div>
      ) : (
        <CheckoutCodForm />
      )}
    </div>
  );
}

import CartHydrator from "@/components/cart/CartHydrator";
import CartItemRow from "@/components/cart/CartItemRow";
import CartSummary from "@/components/cart/CartSummary";
import { getCart } from "@/lib/actions/cart";
import { getCurrentUser } from "@/lib/auth/actions";

export default async function CartPage() {
  const cart = await getCart();
  const user = await getCurrentUser();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <CartHydrator initial={cart} />
      <h1 className="font-jost text-heading-3 text-dark-900 mb-6">Cart</h1>
      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div>
          {cart.items.length === 0 ? (
            <div className="text-dark-700 font-jost text-body">Your cart is empty.</div>
          ) : (
            cart.items.map((it) => <CartItemRow key={it.id} item={it} />)
          )}
        </div>
        <CartSummary isAuthed={!!user} />
      </div>
    </div>
  );
}

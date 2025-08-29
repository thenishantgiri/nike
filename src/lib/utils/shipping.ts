export function getShippingFlatAmountClient(): number {
  const raw =
    process.env.NEXT_PUBLIC_SHIPPING_FIXED_AMOUNT ||
    process.env.STRIPE_SHIPPING_FIXED_AMOUNT ||
    "0";
  const n = Number(raw);
  return Number.isFinite(n) ? Math.max(0, n) : 2;
}

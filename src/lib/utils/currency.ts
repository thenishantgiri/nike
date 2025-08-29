const RAW = (process.env.NEXT_PUBLIC_CURRENCY || process.env.STRIPE_CURRENCY || "usd").toUpperCase();

export function getCurrencyCode(): string {
  return RAW;
}

export function formatCurrency(amount: number, overrideCode?: string): string {
  const code = (overrideCode || getCurrencyCode()).toUpperCase();
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: code }).format(amount);
  } catch {
    // Fallback if unsupported code at runtime
    return `${code} ${amount.toFixed(2)}`;
  }
}

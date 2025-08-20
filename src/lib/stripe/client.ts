import Stripe from "stripe";

let stripeSingleton: Stripe | null = null;

export function getStripe() {
  if (!stripeSingleton) {
    const key = process.env.STRIPE_SECRET_KEY as string | undefined;
    if (!key) {
      throw new Error("Missing STRIPE_SECRET_KEY");
    }
    stripeSingleton = new Stripe(key);
  }
  return stripeSingleton;
}

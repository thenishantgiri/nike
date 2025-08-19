"use client";

import { useEffect } from "react";
import type { UICart } from "@/lib/actions/cart";
import { useCart } from "@/store/cart.store";

export default function CartHydrator({ initial }: { initial: UICart }) {
  const hydrate = useCart((s) => s.hydrate);
  useEffect(() => {
    hydrate(initial);
  }, [initial, hydrate]);
  return null;
}

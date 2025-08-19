"use client";

import { useEffect } from "react";
import { useCart } from "@/store/cart.store";

export default function CartBoot() {
  const refresh = useCart((s) => s.refresh);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return null;
}

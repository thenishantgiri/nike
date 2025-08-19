"use client";

import { create } from "zustand";
import type { UICart } from "@/lib/actions/cart";
import { addCartItem, clearCart, getCart, removeCartItem, updateCartItem } from "@/lib/actions/cart";

type State = {
  cart: UICart;
  loading: boolean;
};

type Actions = {
  hydrate: (cart: UICart) => void;
  refresh: () => Promise<void>;
  add: (variantId: string, qty?: number) => Promise<void>;
  updateQty: (itemId: string, qty: number) => Promise<void>;
  remove: (itemId: string) => Promise<void>;
  clear: () => Promise<void>;
};

const empty: UICart = { id: null, items: [], subtotal: 0, count: 0 };

export const useCart = create<State & Actions>((set) => ({
  cart: empty,
  loading: false,
  hydrate: (cart) => set({ cart }),
  refresh: async () => {
    set({ loading: true });
    const next = await getCart();
    set({ cart: next, loading: false });
  },
  add: async (variantId, qty = 1) => {
    set({ loading: true });
    const next = await addCartItem({ productVariantId: variantId, quantity: qty });
    set({ cart: next, loading: false });
  },
  updateQty: async (itemId, qty) => {
    set({ loading: true });
    const next = await updateCartItem({ itemId, quantity: qty });
    set({ cart: next, loading: false });
  },
  remove: async (itemId) => {
    set({ loading: true });
    const next = await removeCartItem({ itemId });
    set({ cart: next, loading: false });
  },
  clear: async () => {
    set({ loading: true });
    const next = await clearCart();
    set({ cart: next, loading: false });
  },
}));

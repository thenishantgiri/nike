"use client";

import { ShoppingBag, Heart } from "lucide-react";
import { useCart } from "@/store/cart.store";

export default function ProductActions({
  variantId,
  onAdded,
  disabledReason,
}: {
  variantId?: string | null;
  onAdded?: () => void;
  disabledReason?: string;
}) {
  const add = useCart((s) => s.add);
  const disabled = !variantId;

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button
        title={disabled ? disabledReason || "Select color and size" : undefined}
        disabled={disabled}
        onClick={async () => {
          if (!variantId) return;
          await add(variantId, 1);
          onAdded?.();
        }}
        className={`flex-1 min-h-12 rounded-full font-jost text-body-medium flex items-center justify-center gap-2 ${
          disabled
            ? "bg-light-300 text-dark-700 cursor-not-allowed"
            : "bg-dark-900 text-light-100 hover:opacity-90"
        }`}
      >
        <ShoppingBag className="h-5 w-5" />
        Add to Bag
      </button>

      <button
        onClick={() => {
        }}
        className="flex-1 min-h-12 rounded-full border border-light-300 bg-light-100 text-dark-900 font-jost text-body-medium flex items-center justify-center gap-2"
      >
        <Heart className="h-5 w-5" />
        Add to Favorites
      </button>
    </div>
  );
}

"use client";

import type { UICartItem } from "@/lib/actions/cart";
import { formatCurrency } from "@/lib/utils/currency";
import { useCart } from "@/store/cart.store";
import { Trash2 } from "lucide-react";
import Image from "next/image";
import Quantity from "./Quantity";

export default function CartItemRow({ item }: { item: UICartItem }) {
  const updateQty = useCart((s) => s.updateQty);
  const remove = useCart((s) => s.remove);

  return (
    <div className="flex justify-between items-start flex-wrap gap-6 py-6 border-b border-light-300">
      <div className="flex flex-wrap gap-6">
        <div className="w-[120px] h-[120px] bg-light-200 rounded">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.name}
              width={120}
              height={120}
              className="object-contain w-full h-full"
            />
          ) : (
            <div className="w-full h-full" />
          )}
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-dark-900 font-jost text-heading-3">
            {item.name}
          </div>
          <div className="text-dark-700 font-jost text-caption">
            {item.gender ? `${item.gender}'s Shoes` : "Shoes"}
          </div>
          <div className="flex items-center flex-wrap gap-3">
            <div className="text-dark-700 font-jost text-body">
              <span className="text-dark-700">Size</span>{" "}
              <span className="text-dark-900 font-medium">
                {item.size || "-"}
              </span>
            </div>
            <Quantity
              value={item.quantity}
              onChange={(v) => updateQty(item.id, v)}
              onRemove={() => remove(item.id)}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="text-dark-900 font-jost text-body font-medium whitespace-nowrap">
          {formatCurrency(item.price)}
        </div>
        {item.quantity > 1 ? (
          <button
            className="text-red hover:text-dark-900"
            aria-label="Remove"
            onClick={() => remove(item.id)}
            type="button"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        ) : null}
      </div>
    </div>
  );
}

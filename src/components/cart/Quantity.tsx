"use client";

import { Minus, Plus, Trash2 } from "lucide-react";

type Props = {
  value: number;
  onChange: (v: number) => void;
  onRemove?: () => void;
};

export default function Quantity({ value, onChange, onRemove }: Props) {
  return (
    <div className="inline-flex items-center gap-4 bg-light-200 rounded-full px-3 py-2">
      <span className="text-dark-700 font-jost text-caption">Quantity</span>
      {value <= 1 ? (
        <button
          className="w-6 h-6 rounded-full flex items-center justify-center text-red hover:bg-red/10"
          onClick={() => onRemove?.()}
          aria-label="Remove item"
          type="button"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ) : (
        <button
          className="w-6 h-6 rounded-full flex items-center justify-center text-dark-900 hover:bg-light-300"
          onClick={() => onChange(Math.max(1, value - 1))}
          aria-label="Decrease"
          type="button"
        >
          <Minus className="w-4 h-4" />
        </button>
      )}
      <span className="w-4 text-center font-jost text-body">{value}</span>
      <button
        className="w-6 h-6 rounded-full flex items-center justify-center text-dark-900 hover:bg-light-300"
        onClick={() => onChange(value + 1)}
        aria-label="Increase"
        type="button"
      >
        <Plus className="w-4 h-4" />
      </button>
    </div>
  );
}

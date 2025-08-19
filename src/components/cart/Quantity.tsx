"use client";

import { Minus, Plus } from "lucide-react";

type Props = {
  value: number;
  onChange: (v: number) => void;
};

export default function Quantity({ value, onChange }: Props) {
  return (
    <div className="inline-flex items-center gap-4 bg-light-200 rounded-full px-3 py-2">
      <span className="text-dark-700 font-jost text-caption">Quantity</span>
      <button
        className="w-6 h-6 rounded-full flex items-center justify-center text-dark-900 hover:bg-light-300"
        onClick={() => onChange(Math.max(1, value - 1))}
        aria-label="Decrease"
        type="button"
      >
        <Minus className="w-4 h-4" />
      </button>
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

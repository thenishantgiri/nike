"use client";

import React, { useState } from "react";

type SizePickerProps = {
  sizes: string[];
  label?: string;
};

export default function SizePicker({ sizes, label = "Select Size" }: SizePickerProps) {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <section aria-label="Size selection" className="w-full">
      <div className="flex items-center justify-between mb-3">
        <p className="font-jost text-caption text-dark-700">{label}</p>
        <a href="#" className="font-jost text-caption text-dark-700 underline">
          Size Guide
        </a>
      </div>
      <div className="grid grid-cols-5 gap-3" role="listbox" aria-label="Sizes">
        {sizes.map((s) => {
          const isSelected = selected === s;
          return (
            <button
              key={s}
              role="option"
              aria-selected={isSelected}
              onClick={() => setSelected(s)}
              className={`h-12 rounded-md border font-jost text-body-medium ${
                isSelected
                  ? "border-dark-900"
                  : "border-light-300 hover:border-dark-700"
              } focus:outline-none focus:ring-2 focus:ring-dark-900`}
            >
              {s}
            </button>
          );
        })}
      </div>
    </section>
  );
}

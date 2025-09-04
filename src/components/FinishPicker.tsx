"use client";

import React, { useState } from "react";

type FinishPickerProps = {
  finishes: string[];
  label?: string;
  value?: string | null;
  onChange?: (finish: string) => void;
};

export default function FinishPicker({
  finishes,
  label = "Select Finish",
  value,
  onChange,
}: FinishPickerProps) {
  const [selected, setSelected] = useState<string | null>(null);
  const isControlled = typeof value !== "undefined";
  const current = isControlled ? value : selected;

  return (
    <section aria-label="Finish selection" className="w-full">
      <div className="flex items-center justify-between mb-3">
        <p className="font-jost text-caption text-dark-700">{label}</p>
      </div>
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Finishes">
        {finishes.map((f) => {
          const isSelected = current === f;
          return (
            <button
              key={f}
              role="option"
              aria-selected={isSelected}
              onClick={() => {
                if (!isControlled) setSelected(f);
                onChange?.(f);
              }}
              className={`px-3 h-9 rounded-full border font-jost text-caption capitalize ${
                isSelected
                  ? "border-dark-900 bg-light-100"
                  : "border-light-300 hover:border-dark-700"
              } focus:outline-none focus:ring-2 focus:ring-dark-900`}
            >
              {f}
            </button>
          );
        })}
      </div>
    </section>
  );
}


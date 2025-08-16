"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

type CollapsibleSectionProps = {
  title: string;
  children?: React.ReactNode;
  defaultOpen?: boolean;
  rightMeta?: React.ReactNode;
};

export default function CollapsibleSection({
  title,
  children,
  defaultOpen = false,
  rightMeta,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="border-t border-light-300">
      <button
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between py-4 focus:outline-none"
        aria-expanded={open}
      >
        <span className="font-jost text-body-medium text-dark-900">{title}</span>
        <span className="flex items-center gap-2 text-dark-700">
          {rightMeta}
          <ChevronDown
            className={`h-5 w-5 transition-transform ${open ? "rotate-180" : ""}`}
          />
        </span>
      </button>
      {open && (
        <div className="pb-6 font-jost text-body text-dark-700 space-y-3">
          {children}
        </div>
      )}
    </div>
  );
}

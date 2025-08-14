"use client";
import React, { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { parseQuery, ProductSort, setParam, stringifyQuery } from "@/lib/utils/query";

const options: { label: string; value: ProductSort }[] = [
  { label: "Featured", value: "featured" },
  { label: "Newest", value: "newest" },
  { label: "Price (Low \u2192 High)", value: "price_asc" },
  { label: "Price (High \u2192 Low)", value: "price_desc" },
];

export default function Sort() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const query = useMemo(() => parseQuery(searchParams.toString()), [searchParams]);
  const current = query.sort || "featured";

  const onChange = (value: ProductSort) => {
    const next = setParam(query, "sort", value);
    next.page = 1;
    router.push(pathname + stringifyQuery(next), { scroll: true });
  };

  return (
    <div className="relative inline-block">
      <label htmlFor="sort" className="sr-only">
        Sort by
      </label>
      <select
        id="sort"
        className="border border-light-300 rounded px-3 py-2 bg-light-100 font-jost text-body"
        value={current}
        onChange={(e) => onChange(e.target.value as ProductSort)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

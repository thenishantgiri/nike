"use client";
import { filterOptions } from "@/lib/data/products";
import {
  parseQuery,
  ProductQuery,
  stringifyQuery,
  toggleMultiValueParam,
} from "@/lib/utils/query";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";

export default function Filters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [open, setOpen] = useState(false);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    gender: true,
    size: true,
    color: false,
    price: true,
  });

  const query = useMemo<ProductQuery>(
    () => parseQuery(searchParams.toString()),
    [searchParams]
  );

  const update = useCallback(
    (next: ProductQuery) => {
      const url = pathname + stringifyQuery(next);
      router.push(url, { scroll: true });
    },
    [pathname, router]
  );

  const onToggle = (
    group: "gender" | "size" | "color" | "price",
    value: string
  ) => {
    const next = toggleMultiValueParam(query, group, value);
    update(next);
  };

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  const Panel = (
    <aside className="w-full sm:w-64 shrink-0 p-4 sm:p-0">
      <div className="space-y-6">
        {(["gender", "size", "color", "price"] as const).map((group) => (
          <div key={group} className="border-b border-light-300 pb-4">
            <button
              className="w-full flex items-center justify-between py-2 focus:outline-none rounded"
              onClick={() => setExpanded((s) => ({ ...s, [group]: !s[group] }))}
              aria-expanded={expanded[group]}
            >
              <span className="font-jost text-body-medium text-dark-900 capitalize">
                {group}
              </span>
              <span className="text-dark-700">
                {expanded[group] ? "−" : "+"}
              </span>
            </button>

            {expanded[group] && (
              <div className="mt-2 grid grid-cols-2 gap-2">
                {filterOptions[group].map(
                  (opt: { label: string; value: string }) => {
                    const checked = (query[group] || []).includes(opt.value);
                    return (
                      <label
                        key={opt.value}
                        className="flex items-center gap-2 cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          className="size-4 accent-dark-900"
                          checked={checked}
                          onChange={() => onToggle(group, String(opt.value))}
                        />
                        <span className="font-jost text-caption text-dark-700">
                          {opt.label}
                        </span>
                      </label>
                    );
                  }
                )}
              </div>
            )}
          </div>
        ))}
        <button
          onClick={() => {
            update({});
            setOpen(false);
          }}
          className="w-full bg-dark-900 text-light-100 py-2 rounded font-jost text-body-medium"
        >
          Clear all
        </button>
      </div>
    </aside>
  );

  return (
    <>
      <div className="sm:hidden mb-4">
        <button
          onClick={() => setOpen(true)}
          className="px-4 py-2 rounded bg-light-200 font-jost text-body-medium"
        >
          Filters
        </button>
      </div>

      <div className="hidden sm:block">{Panel}</div>

      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div className="fixed inset-y-0 left-0 w-80 bg-light-100 z-50 shadow-xl p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-jost text-body-medium font-medium">
                Filters
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="text-dark-700 focus:outline-none focus:ring-2 focus:ring-dark-700 rounded px-2 py-1"
                aria-label="Close filters"
              >
                ✕
              </button>
            </div>
            {Panel}
          </div>
        </>
      )}
    </>
  );
}

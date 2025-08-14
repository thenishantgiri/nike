import qs from "query-string";

export type ProductFilters = {
  gender?: string[]; // ["men","women","unisex"]
  size?: string[];   // ["xs","s","m","l","xl","8","9","10"]
  color?: string[];  // ["red","blue","black",...]
  price?: string[];  // ["0-50","50-100","100-150","150+"]
};

export type ProductSort = "featured" | "newest" | "price_asc" | "price_desc";

export type ProductQuery = ProductFilters & {
  sort?: ProductSort;
  page?: number;
};

export function parseQuery(search: string): ProductQuery {
  const parsed = qs.parse(search, { arrayFormat: "comma" });
  const toArray = (v: unknown): string[] | undefined => {
    if (Array.isArray(v)) return v.map(String);
    if (typeof v === "string") return v.split(",").filter(Boolean);
    return undefined;
  };

  const q: ProductQuery = {
    gender: toArray(parsed.gender),
    size: toArray(parsed.size),
    color: toArray(parsed.color),
    price: toArray(parsed.price),
    sort: (parsed.sort as ProductSort) || undefined,
  };

  const pageNum = parsed.page ? Number(parsed.page) : undefined;
  if (pageNum && !Number.isNaN(pageNum)) q.page = pageNum;

  return q;
}

export function stringifyQuery(values: ProductQuery, base?: string): string {
  const search = qs.stringify(values, {
    arrayFormat: "comma",
    skipNull: true,
    skipEmptyString: true,
  });
  return base ? `${base}?${search}` : `?${search}`;
}

export function toggleMultiValueParam(
  current: ProductQuery,
  key: keyof ProductFilters,
  value: string
): ProductQuery {
  const existing = new Set<string>(current[key] || []);
  if (existing.has(value)) existing.delete(value);
  else existing.add(value);
  const next: ProductQuery = { ...current, [key]: Array.from(existing) };
  delete (next as ProductQuery).page;
  return next;
}

export function setParam<T extends keyof ProductQuery>(
  current: ProductQuery,
  key: T,
  value: ProductQuery[T]
): ProductQuery {
  const next: ProductQuery = { ...current, [key]: value };
  if (key !== "page") delete (next as ProductQuery).page;
  return next;
}

export function removeParam<T extends keyof ProductQuery>(
  current: ProductQuery,
  key: T
): ProductQuery {
  const next: ProductQuery = { ...current };
  delete (next as ProductQuery)[key];
  if (key !== "page") delete (next as ProductQuery).page;
  return next;
}

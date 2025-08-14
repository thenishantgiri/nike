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
export type DbProductFilters = {
  search?: string;
  category?: string;
  brand?: string;
  gender?: string;
  colors?: string[];
  sizes?: string[];
  priceMin?: number;
  priceMax?: number;
  sortBy?: "latest" | "oldest" | "price_asc" | "price_desc";
  page?: number;
  limit?: number;
};

export function parseFilterParams(searchParams: URLSearchParams): DbProductFilters {
  const getArr = (k: string) => {
    const all = searchParams.getAll(k);
    if (all.length) return all.flatMap((v) => v.split(",")).filter(Boolean);
    const single = searchParams.get(k);
    return single ? single.split(",").filter(Boolean) : undefined;
  };
  const num = (k: string) => {
    const v = searchParams.get(k);
    if (!v) return undefined;
    const n = Number(v);
    return Number.isFinite(n) ? n : undefined;
  };
  const sort = (searchParams.get("sortBy") ||
    searchParams.get("sort")) as DbProductFilters["sortBy"] | null;
  const page = num("page");
  const limit = num("limit");
  return {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    gender: searchParams.get("gender") || undefined,
    colors: getArr("colors"),
    sizes: getArr("sizes"),
    priceMin: num("priceMin"),
    priceMax: num("priceMax"),
    sortBy: sort ?? "latest",
    page: page ?? 1,
    limit: limit ?? 12,
  };
}

export function buildProductQueryObject(filters: DbProductFilters) {
  return {
    ...filters,
    page: Math.max(1, filters.page ?? 1),
    limit: Math.max(1, Math.min(60, filters.limit ?? 12)),
  };
}

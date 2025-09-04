import qs from "query-string";

export type ProductFilters = {
  room?: string[];      // ["living-room","bedroom", ...]
  material?: string[];  // ["solid-wood","metal", ...]
  finish?: string[];    // ["walnut","oak", ...]
  collection?: string[]; // ["modern-living","scandinavian", ...]
  price?: string[];     // ["0-200","200-500","500-1000","1000+"]
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
    room: toArray(parsed.room),
    material: toArray(parsed.material),
    finish: toArray(parsed.finish),
    collection: toArray(parsed.collection),
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
  room?: string;
  materials?: string[];
  finishes?: string[];
  collections?: string[];
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

  const materials = getArr("materials") || getArr("material");
  const finishes = getArr("finishes") || getArr("finish");
  const collections = getArr("collections") || getArr("collection");

  const priceRanges = getArr("price");
  let priceMin: number | undefined = num("priceMin");
  let priceMax: number | undefined = num("priceMax");
  if (priceRanges && priceRanges.length) {
    const mins: number[] = [];
    const maxs: number[] = [];
    for (const r of priceRanges) {
      if (r.endsWith("+")) {
        const base = Number(r.slice(0, -1));
        if (Number.isFinite(base)) mins.push(base);
      } else {
        const [lo, hi] = r.split("-").map((x) => Number(x));
        if (Number.isFinite(lo)) mins.push(lo);
        if (Number.isFinite(hi)) maxs.push(hi);
      }
    }
    if (mins.length) priceMin = Math.min(...mins);
    if (maxs.length) priceMax = Math.max(...maxs);
  }

  const sortRaw = (searchParams.get("sortBy") || searchParams.get("sort"))?.toLowerCase();
  const sortBy: DbProductFilters["sortBy"] =
    sortRaw === "price_asc" ? "price_asc" :
    sortRaw === "price_desc" ? "price_desc" :
    sortRaw === "oldest" ? "oldest" :
    sortRaw === "newest" || sortRaw === "latest" || sortRaw === "featured" ? "latest" :
    "latest";

  const page = num("page");
  const limit = num("limit");

  const roomArr = getArr("room");
  const room = roomArr && roomArr.length ? roomArr[0] : (searchParams.get("room") || undefined) || undefined;

  return {
    search: searchParams.get("search") || undefined,
    category: searchParams.get("category") || undefined,
    brand: searchParams.get("brand") || undefined,
    room,
    materials,
    finishes,
    collections,
    priceMin,
    priceMax,
    sortBy,
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

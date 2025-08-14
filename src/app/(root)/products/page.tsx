import { mockProducts, MockProduct, Gender } from "@/lib/data/products";
import Card from "@/components/Card";
import Filters from "@/components/Filters";
import Sort from "@/components/Sort";
import { parseQuery, ProductQuery } from "@/lib/utils/query";
import qs from "query-string";

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function withinPrice(price: number, ranges: string[]) {
  if (!ranges?.length) return true;
  return ranges.some((r) => {
    if (r === "150+") return price >= 150;
    const [min, max] = r.split("-").map(Number);
    return price >= min && price <= max;
  });
}

function matches(product: MockProduct, q: ProductQuery) {
  if (q.gender?.length && !q.gender.some((g) => product.gender.includes(g as Gender))) return false;
  if (q.size?.length && !q.size.some((s) => product.sizes.includes(s))) return false;
  if (q.color?.length && !q.color.some((c) => product.colors.includes(c))) return false;
  if (!withinPrice(product.price, q.price || [])) return false;
  return true;
}

function sortProducts(items: MockProduct[], sort?: ProductQuery["sort"]) {
  const arr = [...items];
  switch (sort) {
    case "newest":
      return arr.sort((a, b) => Number(b.isNew) - Number(a.isNew));
    case "price_asc":
      return arr.sort((a, b) => a.price - b.price);
    case "price_desc":
      return arr.sort((a, b) => b.price - a.price);
    default:
      return arr;
  }
}

export default async function ProductsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const q = parseQuery(qs.stringify(params as Record<string, string | string[] | undefined>));

  const filtered = mockProducts.filter((p) => matches(p, q));
  const sorted = sortProducts(filtered, q.sort);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-jost text-heading-3 text-dark-900">New ({sorted.length})</h1>
        <Sort />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-[16rem_1fr] gap-6">
        <Filters />
        <section>
          {q.gender?.length || q.size?.length || q.color?.length || q.price?.length ? (
            <div className="flex flex-wrap gap-2 mb-4">
              {(["gender","size","color","price"] as const).flatMap((key) =>
                (q[key] as string[] | undefined)?.map((v) => (
                  <span
                    key={`${key}-${v}`}
                    className="px-3 py-1 rounded-full bg-light-200 text-dark-700 font-jost text-caption"
                  >
                    {key}: {v}
                  </span>
                )) || []
              )}
            </div>
          ) : null}

          {sorted.length === 0 ? (
            <div className="py-20 text-center">
              <p className="font-jost text-body text-dark-700">
                No products match your filters. Try resetting or changing your selection.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {sorted.map((p) => (
                <Card
                  key={p.id}
                  title={p.name}
                  category={p.category}
                  price={p.price}
                  image={p.image}
                  colors={p.colors.length}
                  badge={p.badge}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

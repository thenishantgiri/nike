import Card from "@/components/Card";
import { getAllProducts } from "@/lib/actions/product";
import { getCurrentUser } from "@/lib/auth/actions";
import Link from "next/link";

export default async function Home() {
  const user = await getCurrentUser();
  const { products: latestProducts } = await getAllProducts({
    sortBy: "latest",
    limit: 6,
  });

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h2 className="text-heading-3 font-jost font-bold text-dark-900">
        Latest Shoes
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-5">
        {latestProducts.map((p) => (
          <Link href={`/products/${p.id}`} key={p.id}>
            <Card
              title={p.name}
              category={p.category.name}
              price={p.minPrice}
              image={p.imageUrl ?? "shoes/shoe-1.jpg"}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

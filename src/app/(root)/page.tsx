import Card from "@/components/Card";
import { getAllProducts } from "@/lib/actions/product";
import { ShoppingBag } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default async function Home() {
  const { products: latestProducts } = await getAllProducts({
    sortBy: "latest",
    limit: 6,
  });

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 space-y-12">
      <section className="relative w-full min-h-[630px] rounded-lg">
        <div className="absolute inset-0 z-0">
          <Image
            src="/hero-bg.png"
            alt="Hero Background"
            fill
            className="w-full h-full object-cover"
          />
        </div>

        <div className="relative z-10 flex lg:flex-row flex-col items-center min-h-[inherit] h-full justify-between md:gap-2 gap-12 sm:p-10 px-5 py-10">
          <div className="flex-1 flex flex-col justify-center lg:min-h-[inherit] gap-4 size-full">
            <h1 className="sm:text-heading-1 text-heading-2 font-jost font-bold text-dark-900">
              Style that Moves with You
            </h1>

            <p className="text-body font-jost text-dark-900">
              Nike is a global leader in sport, fashion and culture. Find your
              style today.
            </p>

            <Link href="/products">
              <button
                type="submit"
                className="bg-orange hover:bg-orange/90 text-light-100 font-jost font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <ShoppingBag className="size-5" />
                <span>Show Now</span>
              </button>
            </Link>
          </div>

          <div className="flex-[1.15] relative lg:min-h-[inherit] min-h-[350px] w-full flex items-center justify-center">
            <Image
              src="/hero-shoe.png"
              alt="Hero Shoe"
              fill
              className="object-contain"
            />
          </div>
        </div>
      </section>

      <section>
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
    </main>
  );
}

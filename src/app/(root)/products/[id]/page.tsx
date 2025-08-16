import ProductGallery from "@/components/ProductGallery";
import SizePicker from "@/components/SizePicker";
import CollapsibleSection from "@/components/CollapsibleSection";
import Card from "@/components/Card";
import { Heart, ShoppingBag, Star } from "lucide-react";
import Link from "next/link";

type PageProps = {
  params: Promise<{ id: string }>;
};

type MockProduct = {
  id: string;
  name: string;
  gender: string;
  price: number;
  compareAt?: number;
  description: string;
  badges?: string[];
  variants: Array<{
    id: string;
    name: string;
    images: string[];
  }>;
  sizes: string[];
};

const MOCK_PRODUCTS: Record<string, MockProduct> = {
  "1": {
    id: "1",
    name: "Nike Air Max 90 SE",
    gender: "Women's Shoes",
    price: 140,
    compareAt: 160,
    description:
      "The Air Max 90 stays true to its running roots with the iconic Waffle sole. Stitched overlays and textured accents create the '90s look you love.",
    badges: ["Highly Rated"],
    variants: [
      {
        id: "v1",
        name: "Dark Team Red / Platinum Tint",
        images: [
          "/shoes/shoe-1.jpg",
          "/shoes/shoe-2.webp",
          "/shoes/shoe-3.webp",
          "/shoes/shoe-4.webp",
        ],
      },
      {
        id: "v2",
        name: "Pure Platinum / White",
        images: ["/shoes/shoe-5.avif", "/shoes/shoe-6.avif"],
      },
      {
        id: "v3",
        name: "Black / Hyper Blue",
        images: ["/shoes/shoe-7.avif", "/shoes/shoe-8.avif"],
      },
    ],
    sizes: ["5", "5.5", "6", "6.5", "7", "7.5", "8", "8.5", "9", "9.5", "10"],
  },
  "2": {
    id: "2",
    name: "Nike Court Vision Low Next Nature",
    gender: "Men's Shoes",
    price: 98.3,
    description:
      "Retro basketball style meets modern comfort with Court Vision Low.",
    variants: [
      { id: "v1", name: "White/Black", images: ["/shoes/shoe-9.avif", "/shoes/shoe-10.avif"] },
      { id: "v2", name: "Black/Blue", images: ["/shoes/shoe-11.avif"] },
    ],
    sizes: ["7", "8", "8.5", "9", "9.5", "10", "10.5", "11", "12"],
  },
  "3": {
    id: "3",
    name: "Nike Dunk Low Retro",
    gender: "Men's Shoes",
    price: 98.3,
    description: "An '80s basketball icon for everyday wear.",
    variants: [
      { id: "v1", name: "Green/Yellow", images: ["/shoes/shoe-12.avif", "/shoes/shoe-13.avif"] },
      { id: "v2", name: "Red/White", images: ["/shoes/shoe-14.avif", "/shoes/shoe-15.avif"] },
    ],
    sizes: ["6", "7", "8", "9", "10", "11"],
  },
};

function getProductById(id: string): MockProduct {
  return MOCK_PRODUCTS[id] || MOCK_PRODUCTS["1"];
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { id } = await params;
  const product = getProductById(id);

  const discount =
    product.compareAt && product.compareAt > product.price
      ? Math.round(((product.compareAt - product.price) / product.compareAt) * 100)
      : 0;

  const youMightAlsoLike: Array<{
    id: string;
    title: string;
    price: number;
    image: string;
    category: string;
    badge?: string;
  }> = [
    {
      id: "2",
      title: "Nike Court Vision Low Next Nature",
      category: "Men's Shoes",
      price: 98.3,
      image: "/shoes/shoe-10.avif",
      badge: "Extra 20% off",
    },
    {
      id: "3",
      title: "Nike Dunk Low Retro",
      category: "Men's Shoes",
      price: 98.3,
      image: "/shoes/shoe-12.avif",
      badge: "Extra 10% off",
    },
    {
      id: "1",
      title: "Nike Air Max 90 SE",
      category: "Women's Shoes",
      price: 140,
      image: "/shoes/shoe-1.jpg",
      badge: "Best Seller",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <ProductGallery variants={product.variants} initialVariantId={product.variants[0]?.id} />

        <section aria-label="Product information" className="w-full">
          {product.badges?.length ? (
            <div className="mb-4">
              {product.badges.map((b) => (
                <span
                  key={b}
                  className="inline-block bg-light-200 text-dark-900 px-3 py-1 rounded-full font-jost text-caption mr-2"
                >
                  {b}
                </span>
              ))}
            </div>
          ) : null}

          <h1 className="font-jost text-heading-3 text-dark-900">{product.name}</h1>
          <p className="font-jost text-caption text-dark-700 mt-1">{product.gender}</p>

          <div className="mt-4 flex items-center gap-3">
            <p className="font-jost text-lead text-dark-900">${product.price.toFixed(2)}</p>
            {product.compareAt && product.compareAt > product.price && (
              <>
                <p className="font-jost text-body text-dark-700 line-through">
                  ${product.compareAt.toFixed(2)}
                </p>
                <span className="px-2 py-1 rounded bg-green-500 text-light-100 font-jost text-caption">
                  {discount}% off
                </span>
              </>
            )}
          </div>

          <div className="mt-6">
            <SizePicker sizes={product.sizes} />
          </div>

          <div className="mt-6 flex gap-3">
            <button className="flex-1 h-12 rounded-full bg-dark-900 text-light-100 font-jost text-body-medium flex items-center justify-center gap-2">
              <ShoppingBag className="h-5 w-5" />
              Add to Bag
            </button>
            <button
              aria-label="Favorite"
              className="w-12 h-12 rounded-full border border-light-300 flex items-center justify-center hover:border-dark-700 focus:outline-none focus:ring-2 focus:ring-dark-900"
            >
              <Heart className="h-5 w-5" />
            </button>
          </div>

          <div className="mt-8 space-y-6">
            <CollapsibleSection title="Product Details" defaultOpen>
              <p>{product.description}</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Padded collar</li>
                <li>Foam midsole</li>
                <li>Shown: Multiple colors</li>
                <li>Style: HM9451-600</li>
              </ul>
            </CollapsibleSection>

            <CollapsibleSection title="Shipping & Returns" defaultOpen={false}>
              <p>Free standard shipping and 30-day returns for Nike Members.</p>
            </CollapsibleSection>

            <CollapsibleSection
              title="Reviews"
              rightMeta={
                <span className="flex items-center gap-1 text-dark-700">
                  <Star className="h-4 w-4 fill-dark-900" />
                  <Star className="h-4 w-4 fill-dark-900" />
                  <Star className="h-4 w-4 fill-dark-900" />
                  <Star className="h-4 w-4 fill-dark-900" />
                  <Star className="h-4 w-4" />
                </span>
              }
            >
              <p>No reviews yet.</p>
            </CollapsibleSection>
          </div>
        </section>
      </div>

      <section className="mt-16">
        <h2 className="font-jost text-heading-3 text-dark-900 mb-6">
          You Might Also Like
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {youMightAlsoLike.map((p) => (
            <Link key={p.id} href={`/products/${p.id}`} className="block">
              <Card
                title={p.title}
                category={p.category}
                price={p.price}
                image={p.image}
                colors={1}
                badge={p.badge}
              />
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

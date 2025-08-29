import Card from "@/components/Card";
import CollapsibleSection from "@/components/CollapsibleSection";
import ProductPurchaseShell from "@/components/product/ProductPurchaseShell";
import {
  getProduct,
  getProductReviews,
  getRecommendedProducts,
} from "@/lib/actions/product";
import { Star } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { formatCurrency } from "@/lib/utils/currency";

function NotFoundBlock() {
  return (
    <div className="max-w-3xl mx-auto py-24 text-center">
      <h1 className="font-jost text-heading-3 text-dark-900">
        Product Not Found
      </h1>
      <p className="font-jost text-body text-dark-700 mt-2">
        The product you are looking for does not exist.
      </p>
      <Link
        href="/"
        className="inline-block mt-6 underline font-jost text-body"
      >
        Go back home
      </Link>
    </div>
  );
}

async function ReviewsSection({ productId }: { productId: string }) {
  const reviews = await getProductReviews(productId);
  if (!reviews.length) return null;
  const items = reviews.slice(0, 10);
  return (
    <CollapsibleSection
      title="Reviews"
      rightMeta={
        <span className="flex items-center gap-1 text-dark-700">
          {Array.from({ length: 5 }).map((_, i) => (
            <Star
              key={i}
              className={`h-4 w-4 ${i < 4 ? "fill-dark-900" : ""}`}
            />
          ))}
        </span>
      }
      defaultOpen={false}
    >
      <ul className="space-y-4">
        {items.map((r) => (
          <li key={r.id} className="border rounded-md p-3 border-light-300">
            <div className="flex items-center justify-between">
              <p className="font-jost text-body-medium text-dark-900">
                {r.author}
              </p>
              <span className="flex items-center gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star
                    key={i}
                    className={`h-4 w-4 ${i < r.rating ? "fill-dark-900" : ""}`}
                  />
                ))}
              </span>
            </div>
            {r.title && (
              <p className="font-jost text-body-medium mt-1">{r.title}</p>
            )}
            <p className="mt-2 font-jost text-body text-dark-700 whitespace-pre-line">
              {r.content}
            </p>
            <p className="mt-2 font-jost text-caption text-dark-700">
              {new Date(r.createdAt).toLocaleDateString()}
            </p>
          </li>
        ))}
      </ul>
    </CollapsibleSection>
  );
}

async function AlsoLikeSection({ productId }: { productId: string }) {
  const items = await getRecommendedProducts(productId);
  if (!items.length) return null;
  return (
    <section className="mt-16">
      <h2 className="font-jost text-heading-3 text-dark-900 mb-6">
        You Might Also Like
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {items.map((p) => (
          <Link key={p.id} href={`/products/${p.id}`} className="block">
            <Card
              title={p.title}
              category={p.category}
              price={p.price}
              image={p.image || undefined}
              colors={1}
            />
          </Link>
        ))}
      </div>
    </section>
  );
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let product = null as Awaited<ReturnType<typeof getProduct>>;
  try {
    product = await getProduct(id);
  } catch {
    return <NotFoundBlock />;
  }

  if (!product) return <NotFoundBlock />;

  const galleryVariants = product.variants
    .map((v) => ({
      id: v.id,
      name: `${v.color.name} / ${v.size.name}`,
      images: (v.images.length ? v.images : product.images)
        .map((im) => im.url)
        .filter(Boolean),
    }))
    .filter((gv) => gv.images.length > 0);

  const uniqueSizes = Array.from(
    new Set(product.variants.map((v) => v.size.name))
  ).sort((a, b) => {
    const parse = (s: string) => parseFloat(s.replace("-", "."));
    return (parse(a) || 0) - (parse(b) || 0);
  });

  const variantsMeta = product.variants.map((v) => ({
    id: v.id,
    colorName: v.color.name,
    sizeName: v.size.name,
  }));

  const minPrice = product.priceRange.min;
  const maxPrice = product.priceRange.max;
  const samePrice = minPrice === maxPrice;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8">
      <ProductPurchaseShell
        galleryVariants={galleryVariants}
        uniqueSizes={uniqueSizes}
        productVariants={variantsMeta}
        initialVariantId={product.defaultVariantId || galleryVariants[0]?.id}
        RightTop={
          <>
            <h1 className="font-jost text-heading-3 text-dark-900">
              {product.name}
            </h1>
            <p className="font-jost text-caption text-dark-700 mt-1">
              {product.gender.label}&nbsp;•&nbsp;{product.category.name}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <p className="font-jost text-lead text-dark-900">
                {samePrice
                  ? formatCurrency(minPrice)
                  : `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`}
              </p>
            </div>
          </>
        }
        RightBottom={
          <>
            <div className="mt-8 space-y-6">
              <CollapsibleSection title="Product Details" defaultOpen>
                <p>{product.description || "No description provided."}</p>
              </CollapsibleSection>

              <CollapsibleSection title="Shipping" defaultOpen>
                <p>
                  We offer free shipping on all orders over $100. For orders
                  under $100, shipping is a flat rate of $10.
                </p>

                {minPrice >= 100 ? (
                  <p className="mt-2 font-jost text-caption text-dark-700">
                    This product is eligible for{" "}
                    <span className="font-bold text-green-500">
                      free shipping
                    </span>
                    .
                  </p>
                ) : (
                  <p className="mt-2 font-jost text-caption text-dark-700">
                    This product is not eligible for{" "}
                    <span className="font-bold text-red-500">
                      free shipping
                    </span>
                    .
                  </p>
                )}
              </CollapsibleSection>
            </div>

            <Suspense
              fallback={
                <CollapsibleSection title="Reviews">
                  <p className="animate-pulse h-4 bg-light-300 rounded w-1/2 mb-2" />
                  <p className="animate-pulse h-4 bg-light-300 rounded w-2/3" />
                </CollapsibleSection>
              }
            >
              <ReviewsSection productId={product.id} />
            </Suspense>
          </>
        }
      />

      <Suspense
        fallback={
          <section className="mt-16">
            <h2 className="font-jost text-heading-3 text-dark-900 mb-6">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {Array.from({ length: 3 }).map((_, i) => (
                <div
                  key={i}
                  className="h-[450px] bg-light-200 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </section>
        }
      >
        <AlsoLikeSection productId={product.id} />
      </Suspense>
    </div>
  );
}

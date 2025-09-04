"use client";

import CollapsibleSection from "@/components/CollapsibleSection";
import ProductGallery from "@/components/ProductGallery";
import SizePicker from "@/components/SizePicker";
import { useMemo, useState } from "react";
import ProductActions from "./ProductActions";

type GalleryVariant = {
  id: string;
  name: string;
  finishName: string;
  images: string[];
};
type VariantMeta = {
  id: string;
  finishName: string;
  sizeName?: string | null;
  sku?: string;
  weight?: number | null;
  dimensions?: { length: number; width: number; height: number } | null;
};

export default function ProductPurchaseShell({
  galleryVariants,
  uniqueSizes,
  productVariants,
  initialVariantId,
  productInfo,
  RightTop,
  RightBottom,
}: {
  galleryVariants: GalleryVariant[];
  uniqueSizes: string[];
  productVariants: VariantMeta[];
  initialVariantId?: string;
  productInfo?: {
    materialName?: string | null;
    categoryName: string;
    roomName?: string | null;
    description?: string | null;
  };
  RightTop?: React.ReactNode;
  RightBottom?:
    | React.ReactNode
    | ((ctx: {
        activeVariantId?: string;
        activeFinishName: string | null;
        size: string | null;
      }) => React.ReactNode);
}) {
  const [activeVariantId, setActiveVariantId] = useState<string | undefined>(
    () => initialVariantId || galleryVariants[0]?.id
  );
  const [size, setSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState<number>(1);

  // Resolve the name of the selected finish based on the active gallery variant
  // Gallery variant name format: "<finish> / <size?>"; size is optional for furniture
  const activeFinishName = useMemo(() => {
    const v =
      galleryVariants.find((g) => g.id === activeVariantId) ||
      galleryVariants[0];
    return v?.finishName || null;
  }, [galleryVariants, activeVariantId]);

  // Build finish options from galleryVariants (one per finish), with first image as swatch
  const finishOptions = useMemo(
    () =>
      galleryVariants.map((g) => ({
        id: g.id,
        finishName: g.finishName,
        image: g.images[0],
      })),
    [galleryVariants]
  );

  // Decide which concrete variantId to use for actions (Add to Cart, etc.)
  // Priority: explicit active gallery variant -> variant matching selected finish -> first available
  const resolvedVariantId = useMemo(() => {
    // Prefer the actively selected gallery variant
    if (activeVariantId) return activeVariantId;
    // Fallback: match by color (ignore size)
    const color = activeFinishName;
    if (color) {
      const match = productVariants.find((pv) => pv.finishName === color);
      if (match) return match.id;
    }
    // Last resort: first gallery variant
    return galleryVariants[0]?.id || null;
  }, [activeVariantId, productVariants, activeFinishName, galleryVariants]);

  const selectedMeta = useMemo(
    () => productVariants.find((v) => v.id === resolvedVariantId),
    [productVariants, resolvedVariantId]
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {galleryVariants.length ? (
        <ProductGallery
          variants={galleryVariants}
          initialVariantId={initialVariantId}
          activeVariantId={activeVariantId}
          onVariantChange={setActiveVariantId}
        />
      ) : (
        <section aria-label="Product media" className="w-full">
          <div className="relative w-full rounded-xl bg-light-200 flex items-center justify-center aspect-[4/3]">
            <p className="font-jost text-caption text-dark-700">
              No images available
            </p>
          </div>
        </section>
      )}

      <section aria-label="Product information" className="w-full">
        {RightTop}

        {/* Finishes selection */}
        {finishOptions && finishOptions.length > 1 ? (
          <div className="mt-6">
            <p className="font-jost text-caption text-dark-700 mb-2">
              Finishes
            </p>
            <div
              className="flex flex-wrap gap-4"
              role="listbox"
              aria-label="Finishes"
            >
              {finishOptions.map((opt) => {
                const isActive = opt.finishName === activeFinishName;
                return (
                  <button
                    key={opt.finishName}
                    role="option"
                    aria-selected={isActive}
                    onClick={() => {
                      const byFinishSize = productVariants.find(
                        (pv) =>
                          pv.finishName === opt.finishName &&
                          (!!size ? pv.sizeName === size : true)
                      );
                      setActiveVariantId(byFinishSize?.id || opt.id);
                    }}
                    className={`group focus:outline-none focus:ring-2 focus:ring-dark-900 rounded-md border ${
                      isActive
                        ? "border-dark-900"
                        : "border-light-300 hover:border-dark-700"
                    } p-2`}
                    title={opt.finishName}
                  >
                    <div className="relative rounded-md overflow-hidden bg-light-200 w-24 h-24 sm:w-28 sm:h-28">
                      {opt.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={opt.image}
                          alt={opt.finishName}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full" />
                      )}
                    </div>
                    <p className="mt-1 text-center font-jost text-caption text-dark-900">
                      {opt.finishName}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        {uniqueSizes && uniqueSizes.length > 0 ? (
          <div className="mt-6">
            <SizePicker
              sizes={uniqueSizes}
              value={size}
              onChange={(next) => {
                setSize(next);
                // Lock to variant matching currently selected finish (from gallery) and new size
                const currentFinish = activeFinishName;
                if (currentFinish) {
                  const match = productVariants.find(
                    (pv) =>
                      pv.finishName === currentFinish && pv.sizeName === next
                  );
                  if (match) setActiveVariantId(match.id);
                }
              }}
            />
          </div>
        ) : null}

        {/* Product details (dynamic) */}
        <div className="mt-6">
          <CollapsibleSection title="Product Details" defaultOpen>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="rounded-lg border border-light-300 p-3 bg-light-100">
                <p className="font-jost text-caption text-dark-700">Material</p>
                <p className="font-jost text-body-medium text-dark-900">
                  {productInfo?.materialName || "—"}
                </p>
              </div>
              <div className="rounded-lg border border-light-300 p-3 bg-light-100">
                <p className="font-jost text-caption text-dark-700">Finish</p>
                <p className="font-jost text-body-medium text-dark-900">
                  {activeFinishName || "—"}
                </p>
              </div>
              <div className="rounded-lg border border-light-300 p-3 bg-light-100">
                <p className="font-jost text-caption text-dark-700">Category</p>
                <p className="font-jost text-body-medium text-dark-900">
                  {productInfo?.categoryName}
                </p>
              </div>
              {productInfo?.roomName ? (
                <div className="rounded-lg border border-light-300 p-3 bg-light-100">
                  <p className="font-jost text-caption text-dark-700">Room</p>
                  <p className="font-jost text-body-medium text-dark-900">
                    {productInfo.roomName}
                  </p>
                </div>
              ) : null}
              {selectedMeta ? (
                <>
                  <div className="rounded-lg border border-light-300 p-3 bg-light-100">
                    <p className="font-jost text-caption text-dark-700">
                      Dimensions
                    </p>
                    <p className="font-jost text-body-medium text-dark-900">
                      {selectedMeta.dimensions
                        ? `${Number(selectedMeta.dimensions.length).toFixed(
                            0
                          )} × ${Number(selectedMeta.dimensions.width).toFixed(
                            0
                          )} × ${Number(selectedMeta.dimensions.height).toFixed(
                            0
                          )} cm`
                        : "—"}
                    </p>
                  </div>
                </>
              ) : null}
            </div>
          </CollapsibleSection>
        </div>

        {/* Quantity + Add to Bag */}
        <div className="mt-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="text-dark-700 font-jost text-caption">Qty</span>
            <div className="inline-flex items-center rounded-full border border-light-300 bg-light-100">
              <button
                type="button"
                className="px-3 py-2 text-dark-900 hover:bg-light-200 rounded-l-full"
                aria-label="Decrease quantity"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <span className="px-3 py-2 min-w-6 text-center font-jost text-body">
                {quantity}
              </span>
              <button
                type="button"
                className="px-3 py-2 text-dark-900 hover:bg-light-200 rounded-r-full"
                aria-label="Increase quantity"
                onClick={() => setQuantity((q) => Math.min(99, q + 1))}
              >
                +
              </button>
            </div>
          </div>
          <ProductActions
            variantId={resolvedVariantId || undefined}
            quantity={quantity}
          />
        </div>

        {typeof RightBottom === "function"
          ? RightBottom({
              activeVariantId: resolvedVariantId || undefined,
              activeFinishName,
              size: size,
            })
          : RightBottom}
      </section>
    </div>
  );
}

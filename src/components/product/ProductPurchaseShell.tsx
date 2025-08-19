"use client";

import { useMemo, useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import SizePicker from "@/components/SizePicker";
import ProductActions from "./ProductActions";

type GalleryVariant = { id: string; name: string; images: string[] };
type VariantMeta = { id: string; colorName: string; sizeName: string };

export default function ProductPurchaseShell({
  galleryVariants,
  uniqueSizes,
  productVariants,
  initialVariantId,
  RightTop,
  RightBottom,
}: {
  galleryVariants: GalleryVariant[];
  uniqueSizes: string[];
  productVariants: VariantMeta[];
  initialVariantId?: string;
  RightTop?: React.ReactNode;
  RightBottom?: React.ReactNode;
}) {
  const [activeVariantId, setActiveVariantId] = useState<string | undefined>(
    () => initialVariantId || galleryVariants[0]?.id
  );
  const [size, setSize] = useState<string | null>(null);

  const activeColorName = useMemo(() => {
    const v =
      galleryVariants.find((g) => g.id === activeVariantId) || galleryVariants[0];
    if (!v) return null;
    const [color] = v.name.split(" / ");
    return color || null;
  }, [galleryVariants, activeVariantId]);

  const resolvedVariantId = useMemo(() => {
    if (!activeColorName || !size) return null;
    const match = productVariants.find(
      (pv) => pv.colorName === activeColorName && pv.sizeName === size
    );
    return match?.id || null;
  }, [productVariants, activeColorName, size]);

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

        <div className="mt-6">
          <SizePicker sizes={uniqueSizes} value={size} onChange={setSize} />
        </div>

        <div className="mt-6">
          <ProductActions
            variantId={resolvedVariantId || undefined}
            disabledReason={
              !activeColorName ? "Select a color" : !size ? "Select a size" : undefined
            }
          />
        </div>

        {RightBottom}
      </section>
    </div>
  );
}

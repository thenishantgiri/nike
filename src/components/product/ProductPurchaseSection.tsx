"use client";

import { useMemo, useState } from "react";
import ProductGallery from "@/components/ProductGallery";
import SizePicker from "@/components/SizePicker";
import ProductActions from "./ProductActions";

type GalleryVariant = { id: string; name: string; images: string[] };
type VariantMeta = { id: string; colorName: string; sizeName: string };

export default function ProductPurchaseSection({
  galleryVariants,
  uniqueSizes,
  productVariants,
  initialVariantId,
}: {
  galleryVariants: GalleryVariant[];
  uniqueSizes: string[];
  productVariants: VariantMeta[];
  initialVariantId?: string;
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
    <section aria-label="Product purchase" className="w-full">
      <ProductGallery
        variants={galleryVariants}
        initialVariantId={initialVariantId}
        activeVariantId={activeVariantId}
        onVariantChange={setActiveVariantId}
      />

      <div className="mt-6">
        <SizePicker sizes={uniqueSizes} value={size} onChange={setSize} />
      </div>

      <ProductActions
        variantId={resolvedVariantId || undefined}
        disabledReason={
          !activeColorName ? "Select a color" : !size ? "Select a size" : undefined
        }
      />
    </section>
  );
}

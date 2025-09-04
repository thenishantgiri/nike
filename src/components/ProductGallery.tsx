"use client";

import { ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import SmartImage from "@/components/SmartImage";
import React, { useEffect, useMemo, useState } from "react";

type Variant = {
  id: string;
  name: string;
  images: string[];
};

type ProductGalleryProps = {
  variants: Variant[];
  initialVariantId?: string;
  activeVariantId?: string;
  onVariantChange?: (variantId: string) => void;
};

function isValidSrc(src: string | undefined) {
  if (!src) return false;
  return typeof src === "string" && src.trim().length > 0;
}

export default function ProductGallery({
  variants,
  initialVariantId,
  activeVariantId,
  onVariantChange: _onVariantChange,
}: ProductGalleryProps) {
  const validVariants = useMemo(
    () =>
      variants
        .map((v) => ({
          ...v,
          images: (v.images || []).filter((src) => isValidSrc(src)),
        }))
        .filter((v) => v.images.length > 0),
    [variants]
  );

  const [uncontrolledActiveVariantId, _setUncontrolledActiveVariantId] =
    useState<string | undefined>(
      () => initialVariantId || validVariants[0]?.id
    );
  const controlled = typeof activeVariantId !== "undefined";
  const currentActiveVariantId = controlled
    ? activeVariantId
    : uncontrolledActiveVariantId;
  // No-op helper removed (was unused after swatch removal). Consumers should
  // call `onVariantChange` directly if needed; internally we manage local state
  // when the component is uncontrolled.
  const activeVariant =
    validVariants.find((v) => v.id === currentActiveVariantId) ||
    validVariants[0];

  const [activeIndex, setActiveIndex] = useState(0);
  const mainImgs = activeVariant?.images || [];
  const hasImages = mainImgs.length > 0;
  const safeIndex = Math.min(Math.max(0, activeIndex), Math.max(0, mainImgs.length - 1));
  const mainImg = hasImages ? mainImgs[safeIndex] : undefined;

  useEffect(() => {
    setActiveIndex(0);
  }, [currentActiveVariantId]);

  const onKeyDownMain = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (!mainImgs.length) return;
    if (e.key === "ArrowRight") {
      setActiveIndex((i) => Math.min(mainImgs.length - 1, i + 1));
    } else if (e.key === "ArrowLeft") {
      setActiveIndex((i) => Math.max(0, i - 1));
    }
  };

  // Clamp index when image set changes to avoid empty src flashes
  useEffect(() => {
    if (activeIndex > mainImgs.length - 1) {
      setActiveIndex(Math.max(0, mainImgs.length - 1));
    }
  }, [mainImgs.length, activeIndex]);

  return (
    <section aria-label="Product media" className="w-full">
      <div
        tabIndex={0}
        onKeyDown={onKeyDownMain}
        className="relative w-full rounded-xl bg-light-200 flex items-center justify-center aspect-[4/3] outline-none focus:ring-2 focus:ring-dark-900"
      >
        {hasImages && mainImg ? (
          <SmartImage
            src={mainImg}
            alt={`${activeVariant?.name} - image ${safeIndex + 1}`}
            fill
            className="object-contain"
            sizes="(max-width: 768px) 100vw, (max-width:1200px) 60vw, 720px"
            priority
          />
        ) : (
          <div className="flex flex-col items-center justify-center gap-2 text-dark-700">
            <ImageOff className="h-10 w-10" />
            <p className="font-jost text-caption">No images available</p>
          </div>
        )}

        {hasImages && (
          <>
            <button
              aria-label="Previous image"
              className="absolute bottom-3 right-14 h-10 w-10 rounded-full bg-light-100 shadow flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-dark-900"
              onClick={() => setActiveIndex((i) => Math.max(0, i - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              aria-label="Next image"
              className="absolute bottom-3 right-3 h-10 w-10 rounded-full bg-light-100 shadow flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-dark-900"
              onClick={() =>
                setActiveIndex((i) => Math.min(mainImgs.length - 1, i + 1))
              }
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </>
        )}
      </div>

      {/* Thumbnails: horizontal on mobile per requirements */}
      <div
        className="mt-4 flex gap-3 overflow-x-auto scrollbar-none"
        role="listbox"
        aria-label="Product images"
      >
        {mainImgs.map((src, idx) => (
          <button
            key={src + idx}
            role="option"
            aria-selected={idx === activeIndex}
            tabIndex={0}
            onClick={() => setActiveIndex(idx)}
            className={`relative h-20 w-20 min-w-20 rounded-lg overflow-hidden border ${
              idx === activeIndex
                ? "border-dark-900"
                : "border-light-300 hover:border-dark-700"
            } focus:outline-none focus:ring-2 focus:ring-dark-900`}
          >
            <SmartImage src={src} alt={`Thumbnail ${idx + 1}`} fill className="object-cover" sizes="80px" />
          </button>
        ))}
      </div>
    </section>
  );
}

"use client";

import { Check, ChevronLeft, ChevronRight, ImageOff } from "lucide-react";
import Image from "next/image";
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
  onVariantChange,
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

  const [uncontrolledActiveVariantId, setUncontrolledActiveVariantId] = useState<string | undefined>(
    () => initialVariantId || validVariants[0]?.id
  );
  const controlled = typeof activeVariantId !== "undefined";
  const currentActiveVariantId = controlled ? activeVariantId : uncontrolledActiveVariantId;
  const setActiveVariantIdAll = (id: string) => {
    if (!controlled) setUncontrolledActiveVariantId(id);
    onVariantChange?.(id);
  };
  const activeVariant =
    validVariants.find((v) => v.id === currentActiveVariantId) || validVariants[0];

  const [activeIndex, setActiveIndex] = useState(0);
  const mainImgs = activeVariant?.images || [];
  const mainImg = mainImgs[activeIndex] || "";

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

  const hasImages = mainImgs.length > 0;

  return (
    <section aria-label="Product media" className="w-full">
      <div
        tabIndex={0}
        onKeyDown={onKeyDownMain}
        className="relative w-full rounded-xl bg-light-200 flex items-center justify-center aspect-[4/3] outline-none focus:ring-2 focus:ring-dark-900"
      >
        {hasImages ? (
          <Image
            src={mainImg}
            alt={`${activeVariant?.name} - image ${activeIndex + 1}`}
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
            <Image
              src={src}
              alt={`Thumbnail ${idx + 1}`}
              fill
              className="object-cover"
              sizes="80px"
            />
          </button>
        ))}
      </div>

      {/* Variant swatches: use first image of each variant as a circular swatch */}
      {validVariants.length > 1 && (
        <div className="mt-6">
          <p className="font-jost text-caption text-dark-700 mb-2">Colors</p>
          <div className="flex items-center gap-3">
            {validVariants.map((v) => (
              <button
                key={v.id}
                aria-pressed={v.id === currentActiveVariantId}
                onClick={() => setActiveVariantIdAll(v.id)}
                className={`relative h-10 w-10 rounded-full border overflow-hidden ${
                  v.id === currentActiveVariantId
                    ? "border-dark-900"
                    : "border-light-300 hover:border-dark-700"
                } focus:outline-none focus:ring-2 focus:ring-dark-900`}
                title={v.name}
              >
                <Image
                  src={v.images[0]}
                  alt={v.name}
                  fill
                  className="object-cover"
                  sizes="40px"
                />

                <p className="sr-only">{v.name}</p>

                {v.id === currentActiveVariantId && (
                  <span className="absolute inset-0 flex items-center justify-center text-light-100">
                    <Check className="h-5 w-5 drop-shadow" />
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}

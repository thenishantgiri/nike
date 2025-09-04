"use client";

import Image from "next/image";
import React from "react";
import { ImageOff } from "lucide-react";

type SmartImageProps = {
  src?: string | null;
  alt: string;
  fill?: boolean;
  width?: number;
  height?: number;
  className?: string;
  sizes?: string;
  priority?: boolean;
  quality?: number;
  style?: React.CSSProperties;
};

// SmartImage: consistent image rendering for local and remote URLs using
// next/image. If src is empty/missing, renders a subtle placeholder instead
// of an empty box.
export default function SmartImage({
  src,
  alt,
  fill,
  width,
  height,
  className,
  sizes,
  priority,
  quality,
  style,
}: SmartImageProps) {
  const url = typeof src === "string" && src.trim().length > 0 ? src : undefined;
  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-light-200 ${className || ""}`} aria-hidden>
        <ImageOff className="w-6 h-6 text-dark-700" />
      </div>
    );
  }

  if (fill) {
    return (
      <Image
        src={url}
        alt={alt}
        fill
        sizes={sizes}
        priority={priority}
        quality={quality}
        className={className}
        style={style}
      />
    );
  }

  // Provide a sensible default size if none supplied to avoid layout shifts
  const w = width || 120;
  const h = height || 120;
  return (
    <Image
      src={url}
      alt={alt}
      width={w}
      height={h}
      priority={priority}
      quality={quality}
      className={className}
      style={style}
    />
  );
}

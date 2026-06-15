"use client";

import Image from "next/image";
import { useInView } from "@/shared/hooks/useInView";

interface ProductCardImagesProps {
  primarySrc: string;
  hoverSrc?: string;
  title: string;
  isHovered: boolean;
  sizes: string;
  primaryClassName?: string;
  hoverClassName?: string;
}

export function ProductCardImages({
  primarySrc,
  hoverSrc,
  title,
  isHovered,
  sizes,
  primaryClassName,
  hoverClassName,
}: ProductCardImagesProps) {
  const { ref, inView } = useInView({ rootMargin: "300px 0px", once: true });
  const alternateSrc =
    hoverSrc && hoverSrc !== primarySrc ? hoverSrc : undefined;
  const showHoverImage = Boolean(alternateSrc && inView && isHovered);

  return (
    <div ref={ref} className="absolute inset-0">
      <div className="absolute inset-0">
        {inView && primarySrc ? (
          <Image
            src={primarySrc}
            alt={title}
            fill
            sizes={sizes}
            className={primaryClassName}
          />
        ) : (
          <div className="absolute inset-0 bg-store-surface" aria-hidden />
        )}
      </div>
      <div className="absolute inset-0">
        {showHoverImage && alternateSrc ? (
          <Image
            src={alternateSrc}
            alt={`${title} alternate`}
            fill
            sizes={sizes}
            className={hoverClassName}
          />
        ) : null}
      </div>
    </div>
  );
}

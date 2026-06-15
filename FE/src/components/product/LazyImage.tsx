"use client";

import Image, { type ImageProps } from "next/image";
import { useInView } from "@/shared/hooks/useInView";
import { cn } from "@/lib/utils";

type LazyImageProps = ImageProps & {
  rootMargin?: string;
  /** Load immediately (hero / first visible image). */
  eager?: boolean;
  placeholderClassName?: string;
};

export function LazyImage({
  eager = false,
  rootMargin = "300px 0px",
  placeholderClassName,
  className,
  fill,
  priority,
  ...props
}: LazyImageProps) {
  const { ref, inView } = useInView({ rootMargin, once: true });
  const shouldLoad = eager || inView;

  if (fill) {
    return (
      <div ref={ref} className="absolute inset-0">
        {shouldLoad ? (
          <Image
            fill
            className={className}
            priority={Boolean(eager && priority)}
            {...props}
          />
        ) : (
          <div
            className={cn(
              "absolute inset-0 bg-store-surface",
              placeholderClassName,
            )}
            aria-hidden
          />
        )}
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      {shouldLoad ? (
        <Image
          className={className}
          priority={Boolean(eager && priority)}
          {...props}
        />
      ) : (
        <div
          className={cn("bg-store-surface", placeholderClassName)}
          style={{ width: props.width, height: props.height }}
          aria-hidden
        />
      )}
    </div>
  );
}

"use client";

import Image, { type ImageProps } from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

type ResilientImageProps = Omit<ImageProps, "src" | "alt"> & {
  src: string;
  alt: string;
  fallbackLabel?: string;
  containerClassName?: string;
};

export function ResilientImage({
  src,
  alt,
  fallbackLabel,
  className,
  containerClassName,
  onError,
  ...props
}: ResilientImageProps) {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={cn(
          "absolute inset-0 grid place-items-center bg-[linear-gradient(135deg,#f2e5d0,#dce8e8)] text-center text-[var(--ocean-deep)]",
          containerClassName,
        )}
        role="img"
        aria-label={alt}
      >
        <div className="max-w-[18rem] px-6">
          <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-white/80 text-[var(--terracotta)] shadow-sm">
            <ImageOff className="h-5 w-5" />
          </span>
          <p className="mt-4 text-sm font-black">
            {fallbackLabel ?? "Image coming soon"}
          </p>
          <p className="mt-1 text-xs leading-5 text-[var(--muted)]">{alt}</p>
        </div>
      </div>
    );
  }

  return (
    <Image
      {...props}
      src={src}
      alt={alt}
      className={className}
      onError={(event) => {
        setFailed(true);
        onError?.(event);
      }}
    />
  );
}

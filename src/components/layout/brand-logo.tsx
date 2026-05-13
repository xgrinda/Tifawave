"use client";

import Link from "next/link";
import { ResilientImage } from "@/components/ui/resilient-image";
import type { SiteContent } from "@/content/types";
import { cn } from "@/lib/utils";

type BrandLogoProps = {
  site: Pick<SiteContent, "name" | "shortName" | "logoImage">;
  variant?: "light" | "dark";
  compact?: boolean;
  className?: string;
};

export function BrandLogo({
  site,
  variant = "light",
  compact = false,
  className,
}: BrandLogoProps) {
  const dark = variant === "dark";

  return (
    <Link
      href="/"
      className={cn("group inline-flex items-center gap-3", className)}
      aria-label={`${site.name} home`}
    >
      <BrandMark variant={variant} image={site.logoImage} />
      {!compact ? (
        <span className="leading-none">
          <span
            className={cn(
              "block text-base font-black tracking-tight",
              dark ? "text-white" : "text-[var(--ocean-deep)]",
            )}
          >
            {site.shortName}
          </span>
          <span
            className={cn(
              "mt-1 block text-[11px] font-bold uppercase tracking-[0.2em]",
              dark ? "text-[var(--sand)]" : "text-[var(--terracotta)]",
            )}
          >
            Surf Stay
          </span>
        </span>
      ) : null}
    </Link>
  );
}

function BrandMark({
  variant,
  image,
}: {
  variant: "light" | "dark";
  image: SiteContent["logoImage"];
}) {
  const dark = variant === "dark";

  return (
    <span
      className={cn(
        "relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full shadow-lg transition group-hover:-translate-y-0.5",
        dark
          ? "bg-white text-[var(--ocean-deep)] shadow-black/10"
          : "bg-[var(--ocean-deep)] text-white shadow-[rgba(18,55,67,0.18)]",
      )}
    >
      {image.src ? (
        <ResilientImage
          src={image.src}
          alt={image.alt}
          fill
          sizes="44px"
          className="object-cover"
          containerClassName="rounded-full"
          fallbackLabel="Logo"
        />
      ) : (
        <FallbackBrandMark dark={dark} />
      )}
    </span>
  );
}

function FallbackBrandMark({ dark }: { dark: boolean }) {
  return (
    <svg
      viewBox="0 0 48 48"
      className="h-8 w-8"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="24"
        cy="24"
        r="19"
        fill="none"
        stroke="currentColor"
        strokeOpacity={dark ? "0.18" : "0.22"}
        strokeWidth="2"
      />
      <text
        x="24"
        y="23"
        fill="currentColor"
        fontFamily="Inter, Arial, sans-serif"
        fontSize="13"
        fontWeight="900"
        letterSpacing="0.6"
        textAnchor="middle"
      >
        TI
      </text>
      <path
        d="M13 31c4.6-4.6 9.2-4.6 13.8 0 3.4 3.4 6.1 3.4 8.2 0"
        fill="none"
        stroke="currentColor"
        strokeLinecap="round"
        strokeWidth="3"
      />
      <path
        d="M34 14c2.4 1.2 4.3 3.1 5.6 5.5"
        fill="none"
        stroke="var(--sunset)"
        strokeLinecap="round"
        strokeWidth="3"
      />
    </svg>
  );
}

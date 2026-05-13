import Link from "next/link";
import { Clock, Waves } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { ResilientImage } from "@/components/ui/resilient-image";
import type { SurfPackage } from "@/content/types";
import { bookingHref } from "@/lib/utils";

type PackageCardProps = {
  item: SurfPackage;
  priority?: boolean;
};

export function PackageCard({ item, priority = false }: PackageCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white premium-shadow transition duration-300 hover:-translate-y-1">
      <Link
        href={`/surf-packages/${item.slug}`}
        className="relative block aspect-[16/11] overflow-hidden bg-[var(--sand)]"
        aria-label={`View details for ${item.name}`}
      >
        <ResilientImage
          src={item.featuredImage.src}
          alt={item.featuredImage.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          fallbackLabel={`${item.name} photo coming soon`}
        />
        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-3 bg-gradient-to-t from-black/78 via-black/24 to-transparent p-5 pt-16 text-white">
          <span className="inline-flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.18em]">
            <Waves className="h-4 w-4" />
            {item.idealFor[0] ?? "Surf stay"}
          </span>
          <span className="rounded-full bg-white/16 px-3 py-1 text-sm font-black backdrop-blur">
            {item.price}
          </span>
        </div>
      </Link>
      <div className="p-5 sm:p-6">
        <p className="mb-2 flex items-center gap-2 text-sm font-semibold text-[var(--terracotta)]">
          <Clock className="h-4 w-4" />
          {item.duration}
        </p>
        <h3 className="text-xl font-bold text-[var(--ocean-deep)]">
          <Link
            href={`/surf-packages/${item.slug}`}
            className="transition hover:text-[var(--terracotta)]"
          >
            {item.name}
          </Link>
        </h3>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          {item.shortDescription}
        </p>
        <ul className="mt-5 grid gap-2 text-sm text-[var(--ocean-deep)]">
          {item.includes.map((include) => (
            <li key={include} className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[var(--sunset)]" />
              {include}
            </li>
          ))}
        </ul>
        <ButtonLink
          href={bookingHref({ packageType: item.name })}
          variant="secondary"
          className="mt-6 w-full"
        >
          {item.bookingCtaText}
        </ButtonLink>
      </div>
    </article>
  );
}

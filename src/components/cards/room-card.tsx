import Link from "next/link";
import { CheckCircle2, Users } from "lucide-react";
import { ButtonLink } from "@/components/ui/button-link";
import { ResilientImage } from "@/components/ui/resilient-image";
import { formatRoomPrice } from "@/content/rooms";
import type { Room } from "@/content/types";
import { bookingHref } from "@/lib/utils";

type RoomCardProps = {
  room: Room;
  priority?: boolean;
};

export function RoomCard({ room, priority = false }: RoomCardProps) {
  return (
    <article className="group overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white premium-shadow transition duration-300 hover:-translate-y-1">
      <Link
        href={`/rooms/${room.slug}`}
        className="relative block aspect-[4/3] overflow-hidden bg-[var(--sand)]"
        aria-label={`View details for ${room.name}`}
      >
        <ResilientImage
          src={room.featuredImage.src}
          alt={room.featuredImage.alt}
          fill
          priority={priority}
          sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          className="object-cover transition duration-700 group-hover:scale-105"
          fallbackLabel={`${room.name} photo coming soon`}
        />
        <div className="absolute left-4 top-4 rounded-full bg-white/[0.92] px-3 py-1 text-[11px] font-black uppercase tracking-[0.18em] text-[var(--terracotta)] shadow-sm backdrop-blur">
          {room.bedType}
        </div>
      </Link>
      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h3 className="text-xl font-bold text-[var(--ocean-deep)]">
              <Link href={`/rooms/${room.slug}`} className="transition hover:text-[var(--terracotta)]">
                {room.name}
              </Link>
            </h3>
            <p className="mt-2 flex items-center gap-2 text-sm font-semibold text-[var(--muted)]">
              <Users className="h-4 w-4 text-[var(--sunset)]" />
              {room.capacity} guests
            </p>
          </div>
          <p className="inline-flex self-start rounded-full bg-[var(--foam)] px-3 py-1.5 text-sm font-black text-[var(--ocean)] sm:max-w-32 sm:text-right">
            {formatRoomPrice(room)}
          </p>
        </div>
        <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
          {room.shortDescription}
        </p>
        <div className="mt-5 flex flex-wrap gap-2">
          {room.amenities.slice(0, 4).map((feature) => (
            <span
              key={feature}
              className="inline-flex items-center gap-1.5 rounded-full bg-[var(--foam)] px-3 py-1 text-xs font-semibold text-[var(--ocean-deep)]"
            >
              <CheckCircle2 className="h-3.5 w-3.5 text-[var(--sunset)]" />
              {feature}
            </span>
          ))}
        </div>
        <ButtonLink
          href={bookingHref({ room: room.name })}
          variant="outline"
          className="mt-6 w-full"
        >
          {room.bookingCtaText}
        </ButtonLink>
      </div>
    </article>
  );
}

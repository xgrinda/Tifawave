import type { Metadata } from "next";
import { CheckCircle2 } from "lucide-react";
import { RoomCard } from "@/components/cards/room-card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ButtonLink } from "@/components/ui/button-link";
import { ResilientImage } from "@/components/ui/resilient-image";
import { SectionHeader } from "@/components/ui/section-header";
import { rooms as fallbackRooms } from "@/content/rooms";
import { getRooms } from "@/lib/content-store";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Rooms for a Surf Hostel Stay in Tamraght",
  description:
    "Compare shared dorm, private double, twin, and family rooms at a premium hostel in Tamraght, with a comfortable base for Taghazout surf accommodation.",
  path: "/rooms",
  image: fallbackRooms[0].featuredImage.src,
  imageAlt: fallbackRooms[0].featuredImage.alt,
  keywords: ["hostel Tamraght", "Taghazout surf accommodation"],
});

export const dynamic = "force-dynamic";

export default async function RoomsPage() {
  const allRooms = await getRooms();
  const rooms = allRooms.filter((room) => room.available);
  const heroRoom = rooms[0] ?? allRooms[0] ?? fallbackRooms[0];

  return (
    <>
      <section className="bg-[var(--foam)] py-16 sm:py-24">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--terracotta)]">
              Rooms
            </p>
            <h1 className="text-balance text-4xl font-black leading-tight text-[var(--ocean-deep)] sm:text-6xl">
              Boutique comfort for surf travelers.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              Choose a shared dorm room, a private double, a twin room, or a
              family and group option. Every stay keeps the essentials clear:
              clean bedding, practical storage, straightforward room choices,
              and warm surf-hostel hosting.
            </p>
            <ButtonLink href="/booking" variant="secondary" className="mt-8">
              Reserve a room
            </ButtonLink>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-lg bg-[var(--sand)] shadow-[0_28px_90px_rgba(18,55,67,0.14)]">
            <ResilientImage
              src={heroRoom.featuredImage.src}
              alt={heroRoom.featuredImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
              fallbackLabel="Room photo coming soon"
            />
          </div>
        </div>
      </section>

      <AnimatedSection className="section-pad">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Room types"
            title="Simple choices, premium details."
            description="Prices are example starting rates. Final availability and rates are confirmed after your inquiry."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {rooms.map((room, index) => (
              <RoomCard key={room.id} room={room} priority={index < 2} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-pad bg-[var(--foam)]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
          <SectionHeader
            eyebrow="Included"
            title="The house basics are handled."
            description="The goal is to make arrival easy and sleep properly restorative after surf sessions."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              "Fresh linens and towels",
              "Daily light housekeeping",
              "Board and wetsuit storage",
              "Breakfast add-on",
              "Airport transfer support",
              "Reliable Wi-Fi",
              "Rooftop sunset space",
              "Local dinner recommendations",
            ].map((item) => (
              <p
                key={item}
                className="flex items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-white p-4 text-sm font-semibold text-[var(--ocean-deep)]"
              >
                <CheckCircle2 className="h-5 w-5 text-[var(--sunset)]" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}

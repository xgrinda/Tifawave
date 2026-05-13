import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BedDouble, CheckCircle2, Users } from "lucide-react";
import { FaqList } from "@/components/content/faq-list";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ButtonLink } from "@/components/ui/button-link";
import { GalleryGrid } from "@/components/ui/gallery-grid";
import { ResilientImage } from "@/components/ui/resilient-image";
import { SectionHeader } from "@/components/ui/section-header";
import { formatRoomPrice, rooms as fallbackRooms } from "@/content/rooms";
import {
  getFaqs,
  getRoomBySlug,
  getSiteContent,
} from "@/lib/content-store";
import { buildPageMetadata } from "@/lib/seo";
import { bookingHref } from "@/lib/utils";

type RoomDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return fallbackRooms.map((room) => ({ slug: room.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: RoomDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const room = await getRoomBySlug(slug);

  if (!room) {
    return {};
  }

  return buildPageMetadata({
    title: `${room.name} in Tamraght`,
    description: room.shortDescription,
    path: `/rooms/${room.slug}`,
    image: room.featuredImage.src,
    imageAlt: room.featuredImage.alt,
    keywords: ["hostel Tamraght", "Taghazout surf accommodation"],
  });
}

export default async function RoomDetailPage({
  params,
}: RoomDetailPageProps) {
  const { slug } = await params;
  const [room, editableSiteContent, faqs] = await Promise.all([
    getRoomBySlug(slug),
    getSiteContent(),
    getFaqs(),
  ]);

  if (!room) {
    notFound();
  }

  const roomFaqs = faqs.filter((faq) => faq.categories.includes("rooms"));

  return (
    <>
      <section className="section-pad bg-[var(--foam)]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.94fr_1.06fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--terracotta)]">
              Room detail
            </p>
            <h1 className="text-balance text-4xl font-black leading-tight text-[var(--ocean-deep)] sm:text-6xl">
              {room.name}
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
              {room.shortDescription}
            </p>
            <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold text-[var(--ocean-deep)]">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2">
                <Users className="h-4 w-4 text-[var(--sunset)]" />
                {room.capacity} guests
              </span>
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2">
                <BedDouble className="h-4 w-4 text-[var(--sunset)]" />
                {room.bedType}
              </span>
              <span className="inline-flex items-center rounded-full bg-white px-4 py-2 text-[var(--ocean)]">
                {formatRoomPrice(room)}
              </span>
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href={bookingHref({ room: room.name })} variant="secondary">
                {room.bookingCtaText}
              </ButtonLink>
              <ButtonLink href="/rooms" variant="outline">
                Back to rooms
              </ButtonLink>
            </div>
          </div>
          <div className="relative min-h-[420px] overflow-hidden rounded-lg bg-[var(--sand)] shadow-[0_28px_90px_rgba(18,55,67,0.14)]">
            <ResilientImage
              src={room.featuredImage.src}
              alt={room.featuredImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 48vw, 100vw"
              className="object-cover"
              fallbackLabel={`${room.name} photo coming soon`}
            />
          </div>
        </div>
      </section>

      <AnimatedSection className="section-pad">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <SectionHeader
            eyebrow="Room overview"
            title="What this stay feels like."
            description={room.fullDescription}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {room.amenities.map((amenity) => (
              <p
                key={amenity}
                className="flex items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-white p-4 text-sm font-semibold text-[var(--ocean-deep)]"
              >
                <CheckCircle2 className="h-5 w-5 text-[var(--sunset)]" />
                {amenity}
              </p>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-pad bg-[var(--foam)]">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Gallery"
            title="A closer look at the room."
            description="Replace these image URLs in the room content file whenever original property photography is ready."
          />
          <div className="mt-10">
            <GalleryGrid images={room.images} />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-pad">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader
            eyebrow="Room FAQ"
            title="The practical questions before a stay."
            description={`Check-in is from ${editableSiteContent.checkInTime}; check-out is by ${editableSiteContent.checkOutTime}. Booking remains inquiry-first so the team can confirm exact availability.`}
          />
          <FaqList items={roomFaqs} />
        </div>
      </AnimatedSection>
    </>
  );
}

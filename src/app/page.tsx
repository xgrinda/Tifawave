import type { Metadata } from "next";
import {
  CalendarDays,
  CheckCircle2,
  Mail,
  MapPin,
  MessageCircle,
  Quote,
  Star,
} from "lucide-react";
import { PackageCard } from "@/components/cards/package-card";
import { RoomCard } from "@/components/cards/room-card";
import { FaqList } from "@/components/content/faq-list";
import { AnimatedDiv, AnimatedSection } from "@/components/ui/animated-section";
import { ButtonLink } from "@/components/ui/button-link";
import { GalleryGrid } from "@/components/ui/gallery-grid";
import { ResilientImage } from "@/components/ui/resilient-image";
import { SectionHeader } from "@/components/ui/section-header";
import { experiences, siteContent, trustItems, valueProps } from "@/content/site";
import type {
  Faq,
  GalleryItem,
  Room,
  SiteContent,
  SurfPackage,
  Testimonial,
} from "@/content/types";
import {
  getFaqs,
  getGalleryItems,
  getRooms,
  getSiteContent,
  getSurfPackages,
  getTestimonials,
} from "@/lib/content-store";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: `${siteContent.name} | Surf Hostel Tamraght & Surf Camp Morocco`,
  description:
    "Explore Tifawave Surf Stay Tamraght for premium hostel rooms, surf camp packages, and inquiry-first booking near Taghazout for a surf stay in Morocco.",
  path: "/",
  keywords: [
    "surf hostel Tamraght",
    "surf camp Tamraght Morocco",
    "surf stay Morocco",
    "Taghazout surf accommodation",
  ],
});

export const dynamic = "force-dynamic";

export default async function Home() {
  const [
    editableSiteContent,
    editableRooms,
    editablePackages,
    editableFaqs,
    editableGalleryItems,
    editableTestimonials,
  ] = await Promise.all([
    getSiteContent(),
    getRooms(),
    getSurfPackages(),
    getFaqs(),
    getGalleryItems(),
    getTestimonials(),
  ]);
  const publishedRooms = editableRooms.filter((room) => room.available);
  const publishedPackages = editablePackages.filter((item) => item.available);

  return (
    <>
      <Hero site={editableSiteContent} />
      <TrustBar />
      <SurfLifestyle galleryItems={editableGalleryItems} />
      <RoomPreview rooms={publishedRooms} />
      <PackagePreview surfPackages={publishedPackages} />
      <Testimonials testimonials={editableTestimonials} />
      <ExperienceSection />
      <GalleryPreview galleryItems={editableGalleryItems} />
      <FAQSection faqs={editableFaqs} />
      <FinalCTA galleryItems={editableGalleryItems} />
    </>
  );
}

function Hero({ site }: { site: SiteContent }) {
  return (
    <section className="relative min-h-[calc(92svh-80px)] overflow-hidden bg-[var(--ocean-deep)] text-white">
      <ResilientImage
        src={site.heroImage.src}
        alt={site.heroImage.alt}
        fill
        priority
        sizes="100vw"
        className="scale-105 object-cover"
        fallbackLabel="Hero photo coming soon"
      />
      <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,55,67,0.9),rgba(18,55,67,0.56)_48%,rgba(18,55,67,0.24)),linear-gradient(0deg,rgba(18,55,67,0.3),rgba(18,55,67,0))]" />
      <div className="absolute inset-0 noise-overlay" />
      <div className="container-shell relative flex min-h-[calc(92svh-80px)] items-center py-14 sm:py-20">
        <div className="max-w-4xl">
          <AnimatedDiv>
            <p className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/12 px-4 py-2 text-xs font-bold uppercase tracking-[0.22em] text-[var(--sand)] backdrop-blur">
              <MapPin className="h-4 w-4" />
              {site.location}
            </p>
            <h1 className="text-balance text-5xl font-black leading-[0.96] tracking-tight text-white sm:text-6xl lg:text-7xl">
              {site.name}
            </h1>
            <p className="mt-6 max-w-2xl text-pretty text-lg leading-8 text-white/82 sm:text-xl">
              {site.tagline} A warm Moroccan base for travelers who want
              design, clear booking, and clean waves.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/booking" variant="secondary">
                Request availability
              </ButtonLink>
              <ButtonLink href="/surf-packages" variant="outline">
                Explore surf packages
              </ButtonLink>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              {valueProps.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 text-sm font-semibold text-white/88 backdrop-blur"
                >
                  <item.icon className="h-4 w-4 text-[var(--sand)]" />
                  {item.label}
                </span>
              ))}
            </div>
            <p className="mt-5 max-w-xl text-sm leading-6 text-white/68">
              Inquiry-first booking: no online payment, no pressure, and a
              human reply with room availability, surf conditions, and deposit
              details.
            </p>
          </AnimatedDiv>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="bg-[var(--background)]">
      <div className="container-shell relative z-10 -mt-8 grid gap-2 rounded-lg border border-[var(--border-soft)] bg-white p-2 premium-shadow sm:grid-cols-2 lg:grid-cols-4">
        {trustItems.map((item) => (
          <div key={item.label} className="flex items-center gap-4 rounded-md p-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full bg-[var(--foam)] text-[var(--ocean)]">
              <item.icon className="h-5 w-5" />
            </span>
            <div>
              <p className="text-sm font-black text-[var(--ocean-deep)]">
                {item.value}
              </p>
              <p className="text-sm text-[var(--muted)]">{item.label}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

function SurfLifestyle({ galleryItems }: { galleryItems: GalleryItem[] }) {
  const shorelineImage =
    galleryItems.find((item) => item.id === "evening-shoreline") ??
    galleryItems[0];
  const architectureImage =
    galleryItems.find((item) => item.id === "moroccan-texture") ??
    galleryItems[1];

  return (
    <AnimatedSection className="section-pad">
      <div className="container-shell grid gap-12 lg:grid-cols-[0.95fr_1.05fr] lg:items-center">
        <div>
          <SectionHeader
            eyebrow="Surf lifestyle"
            title="A polished Tamraght base built around tide, terrace, and sleep."
            description="Tifawave blends the social ease of a surf house with the comfort cues international guests look for: clean rooms, thoughtful hosting, local guidance, and clear booking communication."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-3">
            {[
              ["5+", "nearby surf breaks"],
              ["24h", "reply target"],
              ["AGA", "airport support"],
            ].map(([value, label]) => (
              <div key={label} className="border-l-2 border-[var(--sunset)] pl-4">
                <p className="text-3xl font-black text-[var(--ocean-deep)]">
                  {value}
                </p>
                <p className="mt-1 text-sm font-semibold text-[var(--muted)]">
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="relative min-h-[520px]">
          <div className="absolute left-0 top-0 h-[74%] w-[72%] overflow-hidden rounded-lg bg-[var(--sand)] shadow-[0_30px_90px_rgba(18,55,67,0.14)]">
            <ResilientImage
              src={shorelineImage.src}
              alt={shorelineImage.alt}
              fill
              sizes="(min-width: 1024px) 42vw, 90vw"
              className="object-cover"
              fallbackLabel="Lifestyle photo coming soon"
            />
          </div>
          <div className="absolute bottom-0 right-0 h-[62%] w-[58%] overflow-hidden rounded-lg border-[10px] border-[var(--background)] bg-[var(--sand)] shadow-[0_30px_90px_rgba(18,55,67,0.16)]">
            <ResilientImage
              src={architectureImage.src}
              alt={architectureImage.alt}
              fill
              sizes="(min-width: 1024px) 28vw, 65vw"
              className="object-cover"
              fallbackLabel="Tamraght photo coming soon"
            />
          </div>
        </div>
      </div>
    </AnimatedSection>
  );
}

function RoomPreview({ rooms }: { rooms: Room[] }) {
  return (
    <AnimatedSection className="section-pad bg-[var(--foam)]">
      <div className="container-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Rooms"
            title="Rooms that feel calm after saltwater days."
            description="Choose a social shared dorm, a private double, a flexible twin room, or a practical family and group option."
          />
          <ButtonLink href="/rooms" variant="outline" className="md:mb-2">
            View all rooms
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-3">
          {rooms.slice(0, 3).map((room, index) => (
            <RoomCard key={room.id} room={room} priority={index === 0} />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function PackagePreview({ surfPackages }: { surfPackages: SurfPackage[] }) {
  return (
    <AnimatedSection className="section-pad">
      <div className="container-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Surf packages"
            title="Structured surf weeks without the generic camp feel."
            description="Small groups, spot selection, progression coaching, and the kind of local rhythm that makes Tamraght easy to love."
          />
          <ButtonLink href="/surf-packages" variant="outline" className="md:mb-2">
            See packages
          </ButtonLink>
        </div>
        <div className="mt-10 grid gap-6 lg:grid-cols-4">
          {surfPackages.map((item, index) => (
            <PackageCard key={item.id} item={item} priority={index === 0} />
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function Testimonials({ testimonials }: { testimonials: Testimonial[] }) {
  return (
    <AnimatedSection className="section-pad bg-[var(--ocean-deep)] text-white">
      <div className="container-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Guest notes"
            title="The trust signals that matter before a trip."
            description="Clear communication, clean spaces, proper surf guidance, and a house atmosphere that works for solo travelers, couples, and friends."
            className="[&_h2]:text-white [&_p:not(:first-child)]:text-white/70"
          />
          <div className="flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-bold text-[var(--sand)]">
            <Star className="h-4 w-4 fill-[var(--sand)]" />
            Sample testimonial layout
          </div>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {testimonials.map((item) => (
            <article
              key={item.name}
              className="rounded-lg border border-white/10 bg-white/[0.08] p-6"
            >
              <div className="flex items-center justify-between gap-4">
                <Quote className="h-7 w-7 text-[var(--sunset)]" />
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-[var(--sand)]">
                  Example quote
                </span>
              </div>
              <p className="mt-5 text-sm leading-7 text-white/78">
                &quot;{item.quote}&quot;
              </p>
              <div className="mt-6 flex items-center gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-[var(--sand)] text-sm font-black text-[var(--ocean-deep)]">
                  {item.name.slice(0, 1)}
                </span>
                <span>
                  <p className="font-bold text-white">{item.name}</p>
                  <p className="mt-1 text-sm text-white/54">{item.detail}</p>
                </span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function ExperienceSection() {
  return (
    <AnimatedSection className="section-pad">
      <div className="container-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
        <SectionHeader
          eyebrow="Experience"
          title="A day here moves with the Atlantic."
          description="Every stay is simple to understand before arrival and flexible enough to follow the actual conditions once you are here."
        />
        <div className="grid gap-4 sm:grid-cols-2">
          {experiences.map((item) => (
            <article
              key={item.title}
              className="rounded-lg border border-[var(--border-soft)] bg-white p-6 shadow-[0_18px_60px_rgba(18,55,67,0.06)]"
            >
              <span className="grid h-12 w-12 place-items-center rounded-full bg-[var(--sand)] text-[var(--ocean-deep)]">
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 text-lg font-bold text-[var(--ocean-deep)]">
                {item.title}
              </h3>
              <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                {item.description}
              </p>
            </article>
          ))}
        </div>
      </div>
    </AnimatedSection>
  );
}

function GalleryPreview({ galleryItems }: { galleryItems: GalleryItem[] }) {
  return (
    <AnimatedSection className="section-pad bg-[var(--foam)]">
      <div className="container-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeader
            eyebrow="Gallery"
            title="Salt, plaster, morning light, and roof terrace evenings."
            description="A visual sense of the stay: Atlantic surf days, warm interiors, and the relaxed texture of Tamraght."
          />
          <ButtonLink href="/gallery" variant="outline" className="md:mb-2">
            Open gallery
          </ButtonLink>
        </div>
        <div className="mt-10">
          <GalleryGrid images={galleryItems} limit={6} />
        </div>
      </div>
    </AnimatedSection>
  );
}

function FAQSection({ faqs }: { faqs: Faq[] }) {
  return (
    <AnimatedSection className="section-pad">
      <div className="container-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
        <SectionHeader
          eyebrow="FAQ"
          title="Everything guests ask before booking."
          description="The inquiry flow is intentionally clear: share dates, guest count, room preference, and surf goals. Tifawave confirms availability before any deposit."
        />
        <FaqList items={faqs} />
      </div>
    </AnimatedSection>
  );
}

function FinalCTA({ galleryItems }: { galleryItems: GalleryItem[] }) {
  const ctaImage =
    galleryItems.find((item) => item.id === "board-and-break") ??
    galleryItems[0];
  const bookingSteps = [
    { title: "Share dates", detail: "Room, package, guests", icon: CalendarDays },
    { title: "Get a human reply", detail: "Email and WhatsApp", icon: Mail },
    { title: "Confirm direct", detail: "No online payment", icon: MessageCircle },
  ];

  return (
    <section className="bg-[var(--background)] pb-20">
      <div className="container-shell overflow-hidden rounded-lg bg-[var(--ocean)] text-white shadow-[0_24px_90px_rgba(18,55,67,0.18)]">
        <div className="grid gap-0 lg:grid-cols-[1fr_0.85fr]">
          <div className="p-8 sm:p-12">
            <p className="text-xs font-bold uppercase tracking-[0.22em] text-[var(--sand)]">
              Start with availability
            </p>
            <h2 className="mt-4 max-w-2xl text-3xl font-black leading-tight sm:text-5xl">
              Reserve your room, surf package, or full stay by inquiry.
            </h2>
            <div className="mt-7 grid gap-3 text-sm text-white/82 sm:grid-cols-3">
              {bookingSteps.map((item) => (
                <div key={item.title} className="rounded-lg bg-white/10 p-4">
                  <item.icon className="h-5 w-5 text-[var(--sand)]" />
                  <p className="mt-3 font-bold text-white">{item.title}</p>
                  <p className="mt-1 text-white/68">{item.detail}</p>
                </div>
              ))}
            </div>
            <p className="mt-6 flex items-center gap-2 text-sm font-semibold text-white/72">
              <CheckCircle2 className="h-4 w-4 text-[var(--sand)]" />
              Built for inquiry, WhatsApp, and email only until payments are
              added later.
            </p>
            <ButtonLink href="/booking" variant="secondary" className="mt-8">
              Send booking inquiry
            </ButtonLink>
          </div>
          <div className="relative min-h-[320px]">
            <ResilientImage
              src={ctaImage.src}
              alt={ctaImage.alt}
              fill
              sizes="(min-width: 1024px) 42vw, 100vw"
              className="object-cover"
              fallbackLabel="Surf photo coming soon"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

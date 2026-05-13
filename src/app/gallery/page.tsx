import type { Metadata } from "next";
import { AnimatedSection } from "@/components/ui/animated-section";
import { GalleryGrid } from "@/components/ui/gallery-grid";
import { SectionHeader } from "@/components/ui/section-header";
import { galleryItems as fallbackGalleryItems } from "@/content/gallery";
import { getGalleryItems } from "@/lib/content-store";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Gallery for Our Tamraght Surf Hostel Stay",
  description:
    "Browse surf, room, rooftop, and Morocco lifestyle imagery for Tifawave Surf Stay Tamraght and its Taghazout-area accommodation atmosphere.",
  path: "/gallery",
  image: fallbackGalleryItems[0].src,
  imageAlt: fallbackGalleryItems[0].alt,
  keywords: ["surf hostel Tamraght", "Taghazout surf accommodation"],
});

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const galleryItems = await getGalleryItems();

  return (
    <>
      <section className="bg-[var(--foam)] py-16 sm:py-24">
        <div className="container-shell">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--terracotta)]">
            Gallery
          </p>
          <h1 className="max-w-4xl text-balance text-4xl font-black leading-tight text-[var(--ocean-deep)] sm:text-6xl">
            A visual feel for the stay.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--muted)]">
            Surf mornings, clean rooms, warm Moroccan textures, and easy
            evenings above Tamraght.
          </p>
        </div>
      </section>
      <AnimatedSection className="section-pad">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Moments"
            title="Atlantic light from breakfast to sunset."
            description="These placeholder visuals establish the art direction and can be replaced with original property photography before launch."
          />
          <div className="mt-10">
            <GalleryGrid images={galleryItems} />
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}

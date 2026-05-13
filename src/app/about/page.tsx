import type { Metadata } from "next";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ButtonLink } from "@/components/ui/button-link";
import { ResilientImage } from "@/components/ui/resilient-image";
import { SectionHeader } from "@/components/ui/section-header";
import { experiences } from "@/content/site";
import { getGalleryItems, getSiteContent } from "@/lib/content-store";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "About Our Surf Stay in Tamraght, Morocco",
  description:
    "Meet Tifawave Surf Stay Tamraght, a premium surf hostel in Tamraght shaped around trusted hosting, local surf knowledge, and clear trip planning.",
  path: "/about",
  keywords: ["surf hostel Tamraght", "surf stay Morocco"],
});

export const dynamic = "force-dynamic";

export default async function AboutPage() {
  const [editableSiteContent, galleryItems] = await Promise.all([
    getSiteContent(),
    getGalleryItems(),
  ]);
  const tamraghtImage =
    galleryItems.find((item) => item.id === "moroccan-texture") ??
    galleryItems[0];

  return (
    <>
      <section className="section-pad">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.92fr_1.08fr] lg:items-center">
          <div>
            <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--terracotta)]">
              About Tifawave
            </p>
            <h1 className="text-balance text-4xl font-black leading-tight text-[var(--ocean-deep)] sm:text-6xl">
              Surf house energy, retreat-level care.
            </h1>
            <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
              Tifawave was shaped for travelers who want the ease of a hostel,
              the polish of a boutique stay, and local surf support they can
              trust before flying to Morocco.
            </p>
            <ButtonLink href="/booking" variant="secondary" className="mt-8">
              Plan your stay
            </ButtonLink>
          </div>
          <div className="relative min-h-[520px] overflow-hidden rounded-lg bg-[var(--sand)] shadow-[0_30px_90px_rgba(18,55,67,0.12)]">
            <ResilientImage
              src={editableSiteContent.heroImage.src}
              alt={editableSiteContent.heroImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              fallbackLabel="Hostel hero photo coming soon"
            />
          </div>
        </div>
      </section>

      <AnimatedSection className="section-pad bg-[var(--foam)]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader
            eyebrow="Our approach"
            title="Premium is not about being formal. It is about being clear."
            description="Guests should know what they are booking, how the surf plan works, who to message, and what happens next. The site and the stay are both designed around that trust."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {experiences.map((item) => (
              <article
                key={item.title}
                className="rounded-lg border border-[var(--border-soft)] bg-white p-6"
              >
                <item.icon className="h-6 w-6 text-[var(--sunset)]" />
                <h2 className="mt-5 text-lg font-bold text-[var(--ocean-deep)]">
                  {item.title}
                </h2>
                <p className="mt-3 text-sm leading-7 text-[var(--muted)]">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-pad">
        <div className="container-shell grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="relative min-h-[420px] overflow-hidden rounded-lg bg-[var(--sand)]">
            <ResilientImage
              src={tamraghtImage.src}
              alt={tamraghtImage.alt}
              fill
              sizes="(min-width: 1024px) 50vw, 100vw"
              className="object-cover"
              fallbackLabel="About photo coming soon"
            />
          </div>
          <div>
            <SectionHeader
              eyebrow="Tamraght"
              title="Between Taghazout energy and village calm."
              description="Tamraght is a strong base for Morocco surf travel: close to famous breaks, quieter than the busiest surf towns, and connected to Agadir airport for simple arrivals."
            />
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}

import type { Metadata } from "next";
import { PackageCard } from "@/components/cards/package-card";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ButtonLink } from "@/components/ui/button-link";
import { ResilientImage } from "@/components/ui/resilient-image";
import { SectionHeader } from "@/components/ui/section-header";
import { surfPackages as fallbackPackages } from "@/content/packages";
import { getSurfPackages } from "@/lib/content-store";
import { buildPageMetadata } from "@/lib/seo";

const fallbackHeroPackage =
  fallbackPackages.find((item) => item.slug === "surf-camp-package") ??
  fallbackPackages[0];

export const metadata: Metadata = buildPageMetadata({
  title: "Surf Camp Packages in Tamraght, Morocco",
  description:
    "Explore stay-only, beginner surf lessons, surf camp, surf and yoga, and group surf packages for guests planning a surf stay in Morocco.",
  path: "/surf-packages",
  image: fallbackHeroPackage.featuredImage.src,
  imageAlt: fallbackHeroPackage.featuredImage.alt,
  keywords: ["surf camp Tamraght Morocco", "surf stay Morocco"],
});

export const dynamic = "force-dynamic";

export default async function SurfPackagesPage() {
  const allPackages = await getSurfPackages();
  const surfPackages = allPackages.filter((item) => item.available);
  const heroPackage =
    surfPackages.find((item) => item.slug === "surf-camp-package") ??
    surfPackages[0] ??
    allPackages[0] ??
    fallbackHeroPackage;

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--ocean-deep)] py-20 text-white sm:py-28">
        <ResilientImage
          src={heroPackage.featuredImage.src}
          alt={heroPackage.featuredImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.42]"
          fallbackLabel="Surf package hero photo coming soon"
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,55,67,0.9),rgba(18,55,67,0.54))]" />
        <div className="container-shell relative">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--sand)]">
            Surf packages
          </p>
          <h1 className="max-w-4xl text-balance text-4xl font-black leading-tight sm:text-6xl">
            Better coaching, better spot calls, better surf weeks.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/78">
            Start with a clear package, then let the local team adjust to swell,
            tide, wind, and your actual progression in the water.
          </p>
          <ButtonLink href="/booking" variant="secondary" className="mt-8">
            Reserve a package
          </ButtonLink>
        </div>
      </section>

      <AnimatedSection className="section-pad">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Packages"
            title="Choose the surf rhythm that fits your trip."
            description="Every package can be paired with a room inquiry. No payment is taken online while availability is confirmed."
          />
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            {surfPackages.map((item, index) => (
              <PackageCard key={item.id} item={item} priority={index < 2} />
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-pad bg-[var(--foam)]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader
            eyebrow="Surf day flow"
            title="Condition-led, not clock-led."
            description="Tamraght rewards flexibility. The daily plan follows what the Atlantic is doing, so guests get the right waves instead of a rigid schedule."
          />
          <div className="grid gap-4">
            {[
              ["07:30", "Breakfast and condition check"],
              ["09:00", "Transfer to the best available spot"],
              ["10:00", "Coached surf session or guided free surf"],
              ["13:00", "Lunch break, reset, and village time"],
              ["16:30", "Optional second session, mobility, or sunset roof"],
            ].map(([time, text]) => (
              <div
                key={time}
                className="grid gap-4 rounded-lg border border-[var(--border-soft)] bg-white p-5 sm:grid-cols-[90px_1fr]"
              >
                <p className="text-lg font-black text-[var(--terracotta)]">
                  {time}
                </p>
                <p className="text-base font-semibold text-[var(--ocean-deep)]">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </AnimatedSection>
    </>
  );
}

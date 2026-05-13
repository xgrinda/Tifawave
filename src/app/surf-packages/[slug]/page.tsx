import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CheckCircle2, Clock3, Sparkles } from "lucide-react";
import { FaqList } from "@/components/content/faq-list";
import { AnimatedSection } from "@/components/ui/animated-section";
import { ButtonLink } from "@/components/ui/button-link";
import { GalleryGrid } from "@/components/ui/gallery-grid";
import { ResilientImage } from "@/components/ui/resilient-image";
import { SectionHeader } from "@/components/ui/section-header";
import { surfPackages as fallbackPackages } from "@/content/packages";
import { getFaqs, getPackageBySlug } from "@/lib/content-store";
import { buildPageMetadata } from "@/lib/seo";
import { bookingHref } from "@/lib/utils";

type PackageDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return fallbackPackages.map((surfPackage) => ({ slug: surfPackage.slug }));
}

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: PackageDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const surfPackage = await getPackageBySlug(slug);

  if (!surfPackage) {
    return {};
  }

  return buildPageMetadata({
    title: `${surfPackage.name} in Tamraght`,
    description: surfPackage.shortDescription,
    path: `/surf-packages/${surfPackage.slug}`,
    image: surfPackage.featuredImage.src,
    imageAlt: surfPackage.featuredImage.alt,
    keywords: ["surf camp Tamraght Morocco", "surf stay Morocco"],
  });
}

export default async function PackageDetailPage({
  params,
}: PackageDetailPageProps) {
  const { slug } = await params;
  const [surfPackage, faqs] = await Promise.all([
    getPackageBySlug(slug),
    getFaqs(),
  ]);

  if (!surfPackage) {
    notFound();
  }

  const packageFaqs = faqs.filter((faq) => faq.categories.includes("packages"));

  return (
    <>
      <section className="relative overflow-hidden bg-[var(--ocean-deep)] py-20 text-white sm:py-24">
        <ResilientImage
          src={surfPackage.featuredImage.src}
          alt={surfPackage.featuredImage.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-[0.4]"
          fallbackLabel={`${surfPackage.name} photo coming soon`}
        />
        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,55,67,0.92),rgba(18,55,67,0.56))]" />
        <div className="container-shell relative">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--sand)]">
            Surf package
          </p>
          <h1 className="max-w-4xl text-balance text-4xl font-black leading-tight sm:text-6xl">
            {surfPackage.name}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/80">
            {surfPackage.shortDescription}
          </p>
          <div className="mt-7 flex flex-wrap gap-3 text-sm font-bold">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 backdrop-blur">
              <Clock3 className="h-4 w-4 text-[var(--sand)]" />
              {surfPackage.duration}
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/12 px-4 py-2 backdrop-blur">
              <Sparkles className="h-4 w-4 text-[var(--sand)]" />
              {surfPackage.price}
            </span>
          </div>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <ButtonLink
              href={bookingHref({ packageType: surfPackage.name })}
              variant="secondary"
            >
              {surfPackage.bookingCtaText}
            </ButtonLink>
            <ButtonLink href="/surf-packages" variant="outline">
              Back to packages
            </ButtonLink>
          </div>
        </div>
      </section>

      <AnimatedSection className="section-pad">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.84fr_1.16fr]">
          <SectionHeader
            eyebrow="Package overview"
            title="What the stay includes."
            description={surfPackage.fullDescription}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {surfPackage.includes.map((include) => (
              <p
                key={include}
                className="flex items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-white p-4 text-sm font-semibold text-[var(--ocean-deep)]"
              >
                <CheckCircle2 className="h-5 w-5 text-[var(--sunset)]" />
                {include}
              </p>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-pad bg-[var(--foam)]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader
            eyebrow="Ideal for"
            title="Who this package suits best."
            description="Edit these bullets in the package content file whenever you refine your guest positioning."
          />
          <div className="grid gap-4">
            {surfPackage.idealFor.map((guestType) => (
              <p
                key={guestType}
                className="rounded-lg border border-[var(--border-soft)] bg-white p-5 text-base font-semibold text-[var(--ocean-deep)]"
              >
                {guestType}
              </p>
            ))}
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-pad">
        <div className="container-shell">
          <SectionHeader
            eyebrow="Gallery"
            title="A visual feel for the package."
            description="Use these image entries as the editable visual set for this package page."
          />
          <div className="mt-10">
            <GalleryGrid images={surfPackage.images} />
          </div>
        </div>
      </AnimatedSection>

      <AnimatedSection className="section-pad bg-[var(--foam)]">
        <div className="container-shell grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeader
            eyebrow="Package FAQ"
            title="Surf planning, clearly answered."
            description="Availability is confirmed after inquiry, with WhatsApp and email used for direct trip coordination."
          />
          <FaqList items={packageFaqs} />
        </div>
      </AnimatedSection>
    </>
  );
}

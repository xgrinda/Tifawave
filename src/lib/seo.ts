import type { Metadata } from "next";
import { siteContent } from "@/content/site";

type PageMetadataInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  imageAlt?: string;
  keywords?: readonly string[];
};

function normalizeSiteUrl(value: string) {
  try {
    return new URL(value).origin;
  } catch {
    return siteContent.url;
  }
}

export const siteUrl = normalizeSiteUrl(
  process.env.NEXT_PUBLIC_SITE_URL?.trim() || siteContent.url,
);

export function absoluteUrl(path = "/") {
  return new URL(path, `${siteUrl}/`).toString();
}

function fullPageTitle(title: string) {
  return title.includes(siteContent.name)
    ? title
    : `${title} | ${siteContent.name}`;
}

function uniqueKeywords(extraKeywords: readonly string[] = []) {
  return [...new Set([...siteContent.seoKeywords, ...extraKeywords])];
}

export function buildPageMetadata({
  title,
  description,
  path,
  image = siteContent.heroImage.src,
  imageAlt = siteContent.heroImage.alt,
  keywords = [],
}: PageMetadataInput): Metadata {
  const canonical = absoluteUrl(path);
  const imageUrl = absoluteUrl(image);
  const socialTitle = fullPageTitle(title);

  return {
    title,
    description,
    keywords: uniqueKeywords(keywords),
    alternates: {
      canonical,
    },
    openGraph: {
      title: socialTitle,
      description,
      url: canonical,
      siteName: siteContent.name,
      locale: "en_US",
      type: "website",
      images: [
        {
          url: imageUrl,
          width: 1600,
          height: 1000,
          alt: imageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: socialTitle,
      description,
      images: [imageUrl],
    },
  };
}

export function buildAccommodationStructuredData(content = siteContent) {
  return {
    "@context": "https://schema.org",
    "@graph": [
    {
      "@type": "WebSite",
      "@id": `${siteUrl}/#website`,
      url: siteUrl,
      name: content.name,
      alternateName: content.shortName,
      inLanguage: "en",
    },
    {
      "@type": "LodgingBusiness",
      "@id": `${siteUrl}/#lodging-business`,
      name: content.name,
      alternateName: content.shortName,
      description: content.description,
      url: siteUrl,
      telephone: content.whatsapp.e164,
      email: content.email,
      image: [absoluteUrl(content.heroImage.src)],
      sameAs: [content.instagram],
      priceRange: content.priceRange,
      address: {
        "@type": "PostalAddress",
        streetAddress: content.address.line1,
        addressLocality: content.address.locality,
        addressRegion: content.address.region,
        addressCountry: content.address.countryCode,
      },
      geo: {
        "@type": "GeoCoordinates",
        latitude: content.coordinates.latitude,
        longitude: content.coordinates.longitude,
      },
      amenityFeature: [
        {
          "@type": "LocationFeatureSpecification",
          name: "Surf coaching",
          value: true,
        },
        {
          "@type": "LocationFeatureSpecification",
          name: "Airport transfers",
          value: true,
        },
        {
          "@type": "LocationFeatureSpecification",
          name: "Breakfast terrace",
          value: true,
        },
        {
          "@type": "LocationFeatureSpecification",
          name: "Coworking Wi-Fi",
          value: true,
        },
      ],
    },
  ],
  };
}

export function serializeJsonLd(data: unknown) {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloating } from "@/components/layout/whatsapp-floating";
import type { SiteContent } from "@/content/types";
import {
  getRooms,
  getSiteContent,
  getSurfPackages,
} from "@/lib/content-store";
import {
  absoluteUrl,
  buildAccommodationStructuredData,
  serializeJsonLd,
  siteUrl,
} from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  const editableSiteContent = await getSiteContent();
  const favicon = editableSiteContent.faviconImage;

  return {
    metadataBase: new URL(siteUrl),
    applicationName: editableSiteContent.name,
    creator: editableSiteContent.name,
    publisher: editableSiteContent.name,
    title: {
      default: `${editableSiteContent.name} | Surf Hostel Tamraght & Surf Camp Morocco`,
      template: `%s | ${editableSiteContent.name}`,
    },
    description: editableSiteContent.description,
    keywords: [...editableSiteContent.seoKeywords],
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-image-preview": "large",
        "max-snippet": -1,
        "max-video-preview": -1,
      },
    },
    openGraph: {
      title: `${editableSiteContent.name} | Surf Hostel Tamraght & Surf Camp Morocco`,
      description: editableSiteContent.description,
      url: siteUrl,
      siteName: editableSiteContent.name,
      images: [
        {
          url: absoluteUrl(editableSiteContent.heroImage.src),
          width: 1600,
          height: 1000,
          alt: editableSiteContent.heroImage.alt,
        },
      ],
      locale: "en_US",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: `${editableSiteContent.name} | Surf Hostel Tamraght & Surf Camp Morocco`,
      description: editableSiteContent.description,
      images: [absoluteUrl(editableSiteContent.heroImage.src)],
    },
    alternates: {
      canonical: siteUrl,
    },
    icons: {
      icon: [
        {
          url: favicon.src,
          type: getIconContentType(favicon.src),
        },
      ],
      shortcut: [{ url: favicon.src }],
    },
  };
}

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [editableSiteContent, rooms, surfPackages] = await Promise.all([
    getSiteContent(),
    getRooms(),
    getSurfPackages(),
  ]);
  const publishedRooms = rooms.filter((room) => room.available);
  const publishedPackages = surfPackages.filter((item) => item.available);

  return (
    <html
      lang="en"
      data-scroll-behavior="smooth"
      className="h-full antialiased"
      style={buildThemeStyle(editableSiteContent.theme)}
    >
      <body className="min-h-full bg-[var(--background)]">
        <SiteHeader site={editableSiteContent} />
        <main>{children}</main>
        <SiteFooter
          site={editableSiteContent}
          rooms={publishedRooms}
          surfPackages={publishedPackages}
        />
        <WhatsAppFloating site={editableSiteContent} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: serializeJsonLd(
              buildAccommodationStructuredData(editableSiteContent),
            ),
          }}
        />
      </body>
    </html>
  );
}

function buildThemeStyle(theme: SiteContent["theme"]) {
  return {
    "--background": theme.background,
    "--foreground": theme.foreground,
    "--ocean": theme.ocean,
    "--ocean-deep": theme.oceanDeep,
    "--sand": theme.sand,
    "--sunset": theme.sunset,
    "--terracotta": theme.terracotta,
    "--foam": theme.foam,
    "--muted": theme.muted,
    "--border-soft": theme.borderSoft,
  } as CSSProperties;
}

function getIconContentType(src: string) {
  const cleanSrc = src.split("?")[0]?.toLowerCase() ?? "";

  if (cleanSrc.endsWith(".svg")) {
    return "image/svg+xml";
  }

  if (cleanSrc.endsWith(".png")) {
    return "image/png";
  }

  if (cleanSrc.endsWith(".jpg") || cleanSrc.endsWith(".jpeg")) {
    return "image/jpeg";
  }

  if (cleanSrc.endsWith(".webp")) {
    return "image/webp";
  }

  if (cleanSrc.endsWith(".ico")) {
    return "image/x-icon";
  }

  return "image/png";
}

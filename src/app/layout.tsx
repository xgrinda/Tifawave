import type { Metadata } from "next";
import type { CSSProperties } from "react";
import "./globals.css";
import { SiteFooter } from "@/components/layout/site-footer";
import { SiteHeader } from "@/components/layout/site-header";
import { WhatsAppFloating } from "@/components/layout/whatsapp-floating";
import { siteContent } from "@/content/site";
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

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  applicationName: siteContent.name,
  creator: siteContent.name,
  publisher: siteContent.name,
  title: {
    default: `${siteContent.name} | Surf Hostel Tamraght & Surf Camp Morocco`,
    template: `%s | ${siteContent.name}`,
  },
  description: siteContent.description,
  keywords: [...siteContent.seoKeywords],
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
    title: `${siteContent.name} | Surf Hostel Tamraght & Surf Camp Morocco`,
    description: siteContent.description,
    url: siteUrl,
    siteName: siteContent.name,
    images: [
      {
        url: absoluteUrl(siteContent.heroImage.src),
        width: 1600,
        height: 1000,
        alt: siteContent.heroImage.alt,
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: `${siteContent.name} | Surf Hostel Tamraght & Surf Camp Morocco`,
    description: siteContent.description,
    images: [absoluteUrl(siteContent.heroImage.src)],
  },
  alternates: {
    canonical: siteUrl,
  },
  icons: {
    icon: [{ url: "/icon.svg", type: "image/svg+xml" }],
  },
};

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

function buildThemeStyle(theme: Awaited<ReturnType<typeof getSiteContent>>["theme"]) {
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

import { z } from "zod";
import type { SiteContent } from "@/content/types";

export const contentSections = [
  "settings",
  "rooms",
  "packages",
  "gallery",
  "faqs",
  "testimonials",
] as const;

export const contentSectionSchema = z.enum(contentSections);
export type ContentSection = z.infer<typeof contentSectionSchema>;

const slugSchema = z
  .string()
  .trim()
  .min(2)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "Use lowercase letters, numbers, and hyphens only.",
  });

const hexColorSchema = z
  .string()
  .trim()
  .regex(/^#[0-9a-fA-F]{6}$/, {
    message: "Use a six-digit hex color such as #123743.",
  });

export const contentImageSchema = z.object({
  src: z.string().trim().min(1),
  alt: z.string().trim().min(3),
  caption: z.string().trim().optional(),
});

export const roomContentSchema = z.object({
  id: slugSchema,
  name: z.string().trim().min(2),
  slug: slugSchema,
  shortDescription: z.string().trim().min(20),
  fullDescription: z.string().trim().min(40),
  pricePerNight: z.coerce.number().int().positive(),
  currency: z.string().trim().min(2).max(6),
  capacity: z.coerce.number().int().positive().max(32),
  bedType: z.string().trim().min(2),
  amenities: z.array(z.string().trim().min(1)).min(1),
  images: z.array(contentImageSchema).min(1),
  featuredImage: contentImageSchema,
  available: z.boolean(),
  bookingCtaText: z.string().trim().min(2),
});

export const surfPackageContentSchema = z.object({
  id: slugSchema,
  name: z.string().trim().min(2),
  slug: slugSchema,
  shortDescription: z.string().trim().min(20),
  fullDescription: z.string().trim().min(40),
  price: z.string().trim().min(2),
  duration: z.string().trim().min(2),
  includes: z.array(z.string().trim().min(1)).min(1),
  idealFor: z.array(z.string().trim().min(1)).min(1),
  images: z.array(contentImageSchema).min(1),
  featuredImage: contentImageSchema,
  available: z.boolean(),
  bookingCtaText: z.string().trim().min(2),
});

export const faqContentSchema = z.object({
  id: slugSchema,
  question: z.string().trim().min(8),
  answer: z.string().trim().min(12),
  categories: z
    .array(z.enum(["general", "rooms", "packages", "booking"]))
    .min(1),
});

export const testimonialContentSchema = z.object({
  id: slugSchema,
  quote: z.string().trim().min(20),
  name: z.string().trim().min(2),
  detail: z.string().trim().min(2),
});

export const galleryContentSchema = contentImageSchema.extend({
  id: slugSchema,
  category: z.enum(["surf", "rooms", "hostel", "wellness", "tamraght"]),
});

export const editableSiteContentSchema = z.object({
  name: z.string().trim().min(2),
  shortName: z.string().trim().min(2),
  tagline: z.string().trim().min(10),
  location: z.string().trim().min(2),
  url: z.string().trim().url(),
  description: z.string().trim().min(30),
  email: z.string().trim().email(),
  instagram: z.string().trim().url(),
  whatsapp: z.object({
    display: z.string().trim().min(6),
    e164: z.string().trim().min(6),
    defaultMessage: z.string().trim().min(10),
  }),
  googleMapsEmbedUrl: z.string().trim().url(),
  checkInTime: z.string().trim().min(3),
  checkOutTime: z.string().trim().min(3),
  priceRange: z.string().trim().min(2),
  address: z.object({
    line1: z.string().trim().min(2),
    locality: z.string().trim().min(2),
    region: z.string().trim().min(2),
    country: z.string().trim().min(2),
    countryCode: z.string().trim().min(2).max(3),
  }),
  coordinates: z.object({
    latitude: z.coerce.number(),
    longitude: z.coerce.number(),
  }),
  theme: z
    .object({
      background: hexColorSchema,
      foreground: hexColorSchema,
      ocean: hexColorSchema,
      oceanDeep: hexColorSchema,
      sand: hexColorSchema,
      sunset: hexColorSchema,
      terracotta: hexColorSchema,
      foam: hexColorSchema,
      muted: hexColorSchema,
      borderSoft: hexColorSchema,
    })
    .optional()
    .default({
      background: "#f8f3ea",
      foreground: "#17313b",
      ocean: "#0f5f7a",
      oceanDeep: "#123743",
      sand: "#e8d8bd",
      sunset: "#f47a45",
      terracotta: "#b95535",
      foam: "#f5fbf8",
      muted: "#6e7d7b",
      borderSoft: "#dfe7e4",
    }),
  uiText: z
    .object({
      bookingButton: z.string().trim().min(2),
      whatsappButton: z.string().trim().min(2),
      footerDescription: z.string().trim().min(20),
      footerNote: z.string().trim().min(8),
    })
    .optional()
    .default({
      bookingButton: "Book stay",
      whatsappButton: "WhatsApp",
      footerDescription:
        "A premium surf hostel and curated surf stay for travelers who want Atlantic waves, warm Moroccan hosting, and a calmer kind of surf camp.",
      footerNote: "Made for Atlantic mornings in Tamraght.",
    }),
  logoImage: contentImageSchema.optional().default({
    src: "/images/brand/tifawave-logo.svg",
    alt: "Tifawave Surf Stay logo",
  }),
  faviconImage: contentImageSchema.optional().default({
    src: "/images/brand/tifawave-logo.svg",
    alt: "Tifawave browser tab icon",
  }),
  heroImage: contentImageSchema,
  policies: z
    .array(
      z.object({
        title: z.string().trim().min(2),
        detail: z.string().trim().min(10),
      }),
    )
    .min(1),
  seoKeywords: z.array(z.string().trim().min(2)).min(1),
});

export type EditableSiteContent = z.infer<typeof editableSiteContentSchema>;
export type ManagedSiteContent = SiteContent;

export function validateContentPayload(
  section: ContentSection,
  payload: unknown,
) {
  switch (section) {
    case "settings":
      return editableSiteContentSchema.parse(payload);
    case "rooms":
      return roomContentSchema.parse(payload);
    case "packages":
      return surfPackageContentSchema.parse(payload);
    case "gallery":
      return galleryContentSchema.parse(payload);
    case "faqs":
      return faqContentSchema.parse(payload);
    case "testimonials":
      return testimonialContentSchema.parse(payload);
  }
}

export type ContentImage = {
  src: string;
  alt: string;
  caption?: string;
};

export type Room = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  pricePerNight: number;
  currency: string;
  capacity: number;
  bedType: string;
  amenities: string[];
  images: ContentImage[];
  featuredImage: ContentImage;
  available: boolean;
  bookingCtaText: string;
};

export type SurfPackage = {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  duration: string;
  includes: string[];
  idealFor: string[];
  images: ContentImage[];
  featuredImage: ContentImage;
  available: boolean;
  bookingCtaText: string;
};

export type FaqCategory = "general" | "rooms" | "packages" | "booking";

export type Faq = {
  id: string;
  question: string;
  answer: string;
  categories: FaqCategory[];
};

export type Testimonial = {
  id: string;
  quote: string;
  name: string;
  detail: string;
};

export type GalleryItem = ContentImage & {
  id: string;
  category: "surf" | "rooms" | "hostel" | "wellness" | "tamraght";
};

export type SiteContent = {
  name: string;
  shortName: string;
  tagline: string;
  location: string;
  url: string;
  description: string;
  email: string;
  instagram: string;
  whatsapp: {
    display: string;
    e164: string;
    defaultMessage: string;
  };
  googleMapsEmbedUrl: string;
  checkInTime: string;
  checkOutTime: string;
  priceRange: string;
  address: {
    line1: string;
    locality: string;
    region: string;
    country: string;
    countryCode: string;
  };
  coordinates: {
    latitude: number;
    longitude: number;
  };
  heroImage: ContentImage;
  policies: {
    title: string;
    detail: string;
  }[];
  seoKeywords: string[];
};

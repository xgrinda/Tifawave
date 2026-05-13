import {
  BadgeCheck,
  BedDouble,
  Coffee,
  MapPin,
  ShieldCheck,
  Sparkles,
  Sunrise,
  Waves,
  Wifi,
} from "lucide-react";
import type { SiteContent } from "@/content/types";

export const siteContent = {
  name: "Tifawave Surf Stay Tamraght",
  shortName: "Tifawave",
  tagline:
    "Surf hostel stays, flexible room options, and Atlantic-ready surf packages in Tamraght.",
  location: "Tamraght, Morocco",
  url: "https://tifawave.com",
  description:
    "Tifawave Surf Stay Tamraght is a modern surf hostel in Tamraght, Morocco, with shared dorms, private rooms, surf camp packages, and direct booking support for travelers planning a surf stay in Morocco near Taghazout.",
  email: "stay@tifawave.com",
  instagram: "https://www.instagram.com/tifawave.example",
  whatsapp: {
    display: "+212 600 123 456",
    e164: "+212600123456",
    defaultMessage:
      "Hi Tifawave, I would like to check availability for rooms or surf packages in Tamraght.",
  },
  googleMapsEmbedUrl:
    "https://www.google.com/maps?q=Tamraght%2C%20Morocco&output=embed",
  checkInTime: "14:00",
  checkOutTime: "11:00",
  priceRange: "EUR 24 - EUR 495",
  address: {
    line1: "Placeholder riad address, Hay Tissaliouine",
    locality: "Tamraght",
    region: "Souss-Massa",
    country: "Morocco",
    countryCode: "MA",
  },
  coordinates: {
    latitude: 30.511,
    longitude: -9.681,
  },
  theme: {
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
  },
  uiText: {
    bookingButton: "Book stay",
    whatsappButton: "WhatsApp",
    footerDescription:
      "A premium surf hostel and curated surf stay for travelers who want Atlantic waves, warm Moroccan hosting, and a calmer kind of surf camp.",
    footerNote: "Made for Atlantic mornings in Tamraght.",
  },
  logoImage: {
    src: "/images/brand/tifawave-logo.svg",
    alt: "Tifawave Surf Stay logo",
  },
  heroImage: {
    src: "/images/hero/hero-atlantic-surf-morocco.jpg",
    alt: "Surfers walking toward Atlantic waves near Tamraght",
  },
  policies: [
    {
      title: "Inquiry-first reservation",
      detail:
        "No online payment is taken on the website. Each request is checked manually, then availability, current pricing, and deposit instructions can be confirmed by email or WhatsApp.",
    },
    {
      title: "Check-in and arrival",
      detail:
        "Standard check-in begins at 14:00 and check-out is by 11:00. Guests can mention early arrival, late transfer needs, or airport pickup requests in the booking note.",
    },
    {
      title: "Surf package flexibility",
      detail:
        "Surf schedules follow swell, tide, wind, and guest level. Lesson times or spot choices may shift so the team can prioritize safer and better-fit conditions.",
    },
    {
      title: "Group stays",
      detail:
        "Families, friend groups, and small retreat bookings can request room combinations and surf support through the same inquiry form.",
    },
  ],
  seoKeywords: [
    "surf hostel Tamraght",
    "surf camp Tamraght Morocco",
    "hostel Tamraght",
    "surf stay Morocco",
    "Taghazout surf accommodation",
    "Morocco surf camp",
    "Taghazout surf stay",
    "surf packages Morocco",
    "Tamraght surf package",
    "Morocco beginner surf lessons",
  ],
} satisfies SiteContent;

export const navItems = [
  { label: "Rooms", href: "/rooms" },
  { label: "Surf Packages", href: "/surf-packages" },
  { label: "About", href: "/about" },
  { label: "Gallery", href: "/gallery" },
  { label: "Contact", href: "/contact" },
] as const;

export const trustItems = [
  { label: "Beach access", value: "8 min", icon: MapPin },
  { label: "Room choices", value: "4 stay styles", icon: BedDouble },
  { label: "Airport transfers", value: "Agadir AGA", icon: ShieldCheck },
  { label: "Hostel Wi-Fi", value: "Work friendly", icon: Wifi },
] as const;

export const experiences = [
  {
    title: "Wake with the swell",
    description:
      "Morning conditions shape the plan, from gentle beginner beaches to point-break options when the Atlantic lines up.",
    icon: Waves,
  },
  {
    title: "Return to quiet design",
    description:
      "Shared and private rooms are described clearly, with straightforward amenities and no mystery around what guests are booking.",
    icon: Sparkles,
  },
  {
    title: "Eat like you belong",
    description:
      "Starter content leaves room for breakfast service, dinner add-ons, and local recommendations as the hostel offer evolves.",
    icon: Coffee,
  },
  {
    title: "Sunset on the roof",
    description:
      "The social tone stays warm and international: surf mornings, terrace evenings, and easy post-session downtime.",
    icon: Sunrise,
  },
] as const;

export const valueProps = [
  { label: "No online payment", icon: ShieldCheck },
  { label: "Verified surf coaches", icon: BadgeCheck },
  { label: "Local Tamraght hosts", icon: MapPin },
] as const;

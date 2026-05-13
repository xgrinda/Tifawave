import type { SurfPackage } from "@/content/types";

export const surfPackages = [
  {
    id: "stay-only",
    name: "Stay Only",
    slug: "stay-only",
    shortDescription:
      "Room-first booking for guests who want the hostel atmosphere without bundling surf sessions into the reservation.",
    fullDescription:
      "Stay Only is the cleanest entry point for guests comparing dates, room types, and Tamraght bases before deciding whether to add surf. It keeps the booking flow simple: choose a room, share dates, and mention any airport transfer, breakfast, or surf add-on questions in the inquiry message.",
    price: "rooms from EUR 24 / night",
    duration: "Flexible stay",
    includes: [
      "Room inquiry support",
      "Access to hostel common areas",
      "Local arrival guidance",
      "Optional surf add-ons by request",
      "WhatsApp and email follow-up",
      "Easy upgrade to a package later",
    ],
    idealFor: [
      "Independent travelers",
      "Remote workers and short stays",
      "Guests still deciding on surf plans",
    ],
    images: [
      {
        src: "/images/packages/stay-only.svg",
        alt: "Warm hostel interior prepared for a relaxed Tamraght stay",
      },
      {
        src: "/images/packages/stay-only.svg",
        alt: "Moroccan architecture and travel atmosphere in Tamraght",
      },
      {
        src: "/images/packages/stay-only.svg",
        alt: "Atlantic shoreline near Tamraght in soft evening light",
      },
    ],
    featuredImage: {
      src: "/images/packages/stay-only.svg",
      alt: "Warm hostel interior prepared for a relaxed Tamraght stay",
    },
    available: true,
    bookingCtaText: "Request stay only",
  },
  {
    id: "beginner-surf-lesson-package",
    name: "Beginner Surf Lesson Package",
    slug: "beginner-surf-lesson-package",
    shortDescription:
      "A confidence-building first-surf package with beginner-friendly coaching, equipment guidance, and simple daily planning.",
    fullDescription:
      "The Beginner Surf Lesson Package is written for first-time and early-stage surfers who want a clear reason to book beyond just accommodation. It focuses on ocean safety, board basics, pop-up work, wave etiquette, and lesson pacing that fits a travel holiday rather than a sports bootcamp.",
    price: "from EUR 145",
    duration: "3 lesson days",
    includes: [
      "Three beginner surf lessons",
      "Board and wetsuit during sessions",
      "Beginner-friendly spot selection",
      "Ocean safety briefing",
      "Small-group coaching format",
      "Optional room pairing through booking inquiry",
    ],
    idealFor: [
      "First-time surfers",
      "Short-stay travelers",
      "Guests testing surf before a longer camp",
    ],
    images: [
      {
        src: "/images/packages/beginner-surf-lesson-package.svg",
        alt: "Soft Atlantic beach conditions suited to beginner surf lessons",
      },
      {
        src: "/images/packages/beginner-surf-lesson-package.svg",
        alt: "Surf travelers walking toward the water with boards",
      },
      {
        src: "/images/packages/beginner-surf-lesson-package.svg",
        alt: "Beginner surf preparation on the beach before a session",
      },
    ],
    featuredImage: {
      src: "/images/packages/beginner-surf-lesson-package.svg",
      alt: "Soft Atlantic beach conditions suited to beginner surf lessons",
    },
    available: true,
    bookingCtaText: "Request beginner lessons",
  },
  {
    id: "surf-camp-package",
    name: "Surf Camp Package",
    slug: "surf-camp-package",
    shortDescription:
      "A classic multi-day Tamraght surf stay with daily surf rhythm, room pairing, and a stronger camp-style itinerary.",
    fullDescription:
      "The Surf Camp Package is the fuller hosted experience for guests who want a memorable surf week with more structure. It combines room inquiry support, guided surf days, session equipment, and a clear daily rhythm while still leaving space for conditions, village time, and a relaxed holiday pace.",
    price: "from EUR 430",
    duration: "6 nights / 5 surf days",
    includes: [
      "Five coached surf days",
      "Board and wetsuit during sessions",
      "Daily spot planning around conditions",
      "Shared transfer coordination for surf outings",
      "Room selection through the inquiry form",
      "Host follow-up by WhatsApp or email",
    ],
    idealFor: [
      "Travelers wanting a full surf holiday",
      "Solo guests who like hosted structure",
      "Friends booking a memorable Atlantic week",
    ],
    images: [
      {
        src: "/images/packages/surf-camp-package.svg",
        alt: "Surf camp guests walking toward the Atlantic in Tamraght",
      },
      {
        src: "/images/packages/surf-camp-package.svg",
        alt: "Evening Atlantic coast after a surf camp day",
      },
      {
        src: "/images/packages/surf-camp-package.svg",
        alt: "Surfer moving along a clean wave during coached surf travel",
      },
    ],
    featuredImage: {
      src: "/images/packages/surf-camp-package.svg",
      alt: "Surf camp guests walking toward the Atlantic in Tamraght",
    },
    available: true,
    bookingCtaText: "Request surf camp",
  },
  {
    id: "surf-yoga-package",
    name: "Surf & Yoga Package",
    slug: "surf-yoga-package",
    shortDescription:
      "A slower retreat-style option combining beginner-friendly surf time, mobility, and restorative travel pacing.",
    fullDescription:
      "The Surf & Yoga Package gives the site a softer wellness-facing offer while staying grounded in surf camp reality. It is positioned for guests who value movement, atmosphere, and intentional downtime alongside surf progression, especially couples or travelers taking a more retreat-like trip.",
    price: "from EUR 495",
    duration: "6 nights",
    includes: [
      "Four coached surf sessions",
      "Three guided yoga or mobility sessions",
      "Board and wetsuit during surf sessions",
      "Condition-led surf planning",
      "Optional breakfast or excursion add-ons",
      "Room pairing through booking inquiry",
    ],
    idealFor: [
      "Guests seeking surf plus recovery",
      "Couples or friends on a slower trip",
      "Wellness-minded beginners and mixed-level travelers",
    ],
    images: [
      {
        src: "/images/packages/surf-yoga-package.svg",
        alt: "Calm yoga setup for a surf and wellness stay",
      },
      {
        src: "/images/packages/surf-yoga-package.svg",
        alt: "Gentle yoga practice during a travel retreat",
      },
      {
        src: "/images/packages/surf-yoga-package.svg",
        alt: "Ocean shoreline that frames a surf and yoga holiday",
      },
    ],
    featuredImage: {
      src: "/images/packages/surf-yoga-package.svg",
      alt: "Calm yoga setup for a surf and wellness stay",
    },
    available: true,
    bookingCtaText: "Request surf and yoga",
  },
  {
    id: "group-surf-package",
    name: "Group Surf Package",
    slug: "group-surf-package",
    shortDescription:
      "A flexible quote-ready package for friends, families, school groups, or small teams planning surf time together.",
    fullDescription:
      "The Group Surf Package is designed for larger inquiries that need a little tailoring before confirmation. Friends, families, school groups, and compact retreat crews can ask for room combinations, lesson pacing, arrival coordination, and a custom quote through one clean booking path.",
    price: "custom group quote",
    duration: "Flexible group dates",
    includes: [
      "Custom surf session planning",
      "Room mix support for groups",
      "Shared booking coordination",
      "Equipment planning by guest count",
      "Arrival and transfer discussion",
      "Tailored final quote by inquiry",
    ],
    idealFor: [
      "Friend groups",
      "Families and celebration trips",
      "Small retreats, clubs, or team travel",
    ],
    images: [
      {
        src: "/images/packages/group-surf-package.svg",
        alt: "Surf travelers gathering by the water before a group session",
      },
      {
        src: "/images/packages/group-surf-package.svg",
        alt: "Coastal view suited to group surf travel in Morocco",
      },
      {
        src: "/images/packages/group-surf-package.svg",
        alt: "Comfortable accommodation mood for a group stay",
      },
    ],
    featuredImage: {
      src: "/images/packages/group-surf-package.svg",
      alt: "Surf travelers gathering by the water before a group session",
    },
    available: true,
    bookingCtaText: "Request group quote",
  },
] satisfies SurfPackage[];

export const packageBookingOptions = [
  ...surfPackages
    .filter((surfPackage) => surfPackage.available)
    .map((surfPackage) => surfPackage.name),
  "Not sure yet",
];

export function getPackageBySlug(slug: string) {
  return surfPackages.find((surfPackage) => surfPackage.slug === slug);
}

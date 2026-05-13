import type { Room } from "@/content/types";

export const rooms = [
  {
    id: "shared-dorm-room",
    name: "Shared Dorm Room",
    slug: "shared-dorm-room",
    shortDescription:
      "A bright social dorm for surf travelers who want value, clean design, and easy access to the house atmosphere.",
    fullDescription:
      "The Shared Dorm Room is a flexible stay for solo guests and friends traveling light. It is designed around practical comfort: secure storage, tidy sleeping zones, convenient access to shared bathrooms, and a relaxed surf-hostel feel that still reads clean, organized, and welcoming.",
    pricePerNight: 24,
    currency: "EUR",
    capacity: 6,
    bedType: "Dorm beds",
    amenities: [
      "Individual sleeping spaces",
      "Secure guest lockers",
      "Shared bathroom access",
      "Fresh linens included",
      "Reading light per bed",
      "Near lounge and board storage",
    ],
    images: [
      {
        src: "/images/rooms/shared-dorm-room.svg",
        alt: "Clean hostel dorm room with bunk beds and warm natural light",
      },
      {
        src: "/images/rooms/shared-dorm-room.svg",
        alt: "Shared guest room styled with soft bedding and calm lighting",
      },
      {
        src: "/images/rooms/shared-dorm-room.svg",
        alt: "Organized guest room storage and shared travel essentials",
      },
    ],
    featuredImage: {
      src: "/images/rooms/shared-dorm-room.svg",
      alt: "Clean hostel dorm room with bunk beds and warm natural light",
    },
    available: true,
    bookingCtaText: "Request a dorm bed",
  },
  {
    id: "private-double-room",
    name: "Private Double Room",
    slug: "private-double-room",
    shortDescription:
      "A comfortable private base for couples or solo guests who want more quiet after a full surf day.",
    fullDescription:
      "The Private Double Room gives couples and solo guests a calmer place to reset between beach mornings and village evenings. It keeps the essentials easy to understand: a private sleeping setup, useful storage, fresh linens, and simple access to the social spaces of the house.",
    pricePerNight: 62,
    currency: "EUR",
    capacity: 2,
    bedType: "Double bed",
    amenities: [
      "Private room layout",
      "Double bed",
      "Wardrobe and luggage space",
      "Fresh linens and towels",
      "Work-friendly Wi-Fi",
      "Access to shared house areas",
    ],
    images: [
      {
        src: "/images/rooms/private-double-room.svg",
        alt: "Private double room with soft white linens and natural textures",
      },
      {
        src: "/images/rooms/private-double-room.svg",
        alt: "Warm guest bedroom arranged for a relaxed surf stay",
      },
      {
        src: "/images/rooms/private-double-room.svg",
        alt: "Clean bathroom detail in a modern guest stay",
      },
    ],
    featuredImage: {
      src: "/images/rooms/private-double-room.svg",
      alt: "Private double room with soft white linens and natural textures",
    },
    available: true,
    bookingCtaText: "Request private double",
  },
  {
    id: "twin-room",
    name: "Twin Room",
    slug: "twin-room",
    shortDescription:
      "A flexible twin setup for friends, siblings, or surf travelers who want separate beds and easy logistics.",
    fullDescription:
      "The Twin Room is built for friends, siblings, and surf travelers who want separate beds without losing the convenience of booking together. It is a straightforward, comfortable option for short breaks, package stays, and guests who value flexibility over formality.",
    pricePerNight: 68,
    currency: "EUR",
    capacity: 2,
    bedType: "Two single beds",
    amenities: [
      "Two separate beds",
      "Storage for bags and wetsuits",
      "Fresh linens and towels",
      "Shared or nearby bathroom access",
      "Wi-Fi for trip planning",
      "Ideal for friends booking together",
    ],
    images: [
      {
        src: "/images/rooms/twin-room.svg",
        alt: "Twin guest room with two beds and a neutral palette",
      },
      {
        src: "/images/rooms/twin-room.svg",
        alt: "Relaxed bedroom seating corner for traveling guests",
      },
      {
        src: "/images/rooms/twin-room.svg",
        alt: "Prepared guest beds with fresh linens",
      },
    ],
    featuredImage: {
      src: "/images/rooms/twin-room.svg",
      alt: "Twin guest room with two beds and a neutral palette",
    },
    available: true,
    bookingCtaText: "Request twin room",
  },
  {
    id: "family-group-room",
    name: "Family / Group Room",
    slug: "family-group-room",
    shortDescription:
      "A practical larger room for families, friend groups, or small surf crews coordinating one shared stay.",
    fullDescription:
      "The Family / Group Room gives the site a realistic option for multi-guest inquiries without forcing every group into separate rooms. It is written for flexibility: families, close friends, and compact surf groups can use the booking form to ask for occupancy details, preferred layout, and package combinations before confirming.",
    pricePerNight: 118,
    currency: "EUR",
    capacity: 4,
    bedType: "Mixed bed layout",
    amenities: [
      "Sleeps up to four guests",
      "Flexible group layout",
      "Luggage and board space",
      "Fresh linens and towels",
      "Suitable for family inquiries",
      "Easy add-on with surf packages",
    ],
    images: [
      {
        src: "/images/rooms/family-group-room.svg",
        alt: "Spacious multi-bed room suited to families or travel groups",
      },
      {
        src: "/images/rooms/family-group-room.svg",
        alt: "Warm modern interior with room to spread out",
      },
      {
        src: "/images/rooms/family-group-room.svg",
        alt: "Comfortable guest area for small travel groups",
      },
    ],
    featuredImage: {
      src: "/images/rooms/family-group-room.svg",
      alt: "Spacious multi-bed room suited to families or travel groups",
    },
    available: true,
    bookingCtaText: "Request group room",
  },
] satisfies Room[];

export const roomBookingOptions = [
  "Not sure yet",
  ...rooms.filter((room) => room.available).map((room) => room.name),
];

export function getRoomBySlug(slug: string) {
  return rooms.find((room) => room.slug === slug);
}

export function formatRoomPrice(room: Room) {
  return `${room.currency} ${room.pricePerNight} / night`;
}

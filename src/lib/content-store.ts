import { faqs as fallbackFaqs } from "@/content/faqs";
import { galleryItems as fallbackGalleryItems } from "@/content/gallery";
import { surfPackages as fallbackPackages } from "@/content/packages";
import { rooms as fallbackRooms } from "@/content/rooms";
import { siteContent as fallbackSiteContent } from "@/content/site";
import { testimonials as fallbackTestimonials } from "@/content/testimonials";
import type {
  Faq,
  GalleryItem,
  Room,
  SurfPackage,
  Testimonial,
} from "@/content/types";
import {
  contentSectionSchema,
  type ContentSection,
  type EditableSiteContent,
  validateContentPayload,
} from "@/lib/content-schema";
import {
  getSupabaseAdminClient,
  type Json,
  type WebsiteContentRow,
} from "@/lib/supabase-admin";

export type AdminContentItem<T = unknown> = {
  id: string;
  contentType: ContentSection;
  itemKey: string;
  position: number;
  payload: T;
  updatedAt: string;
  source: "database" | "starter";
};

export type AdminContentSectionData = {
  section: ContentSection;
  isSeeded: boolean;
  items: AdminContentItem[];
};

type PublicContentMap = {
  settings: EditableSiteContent;
  rooms: Room;
  packages: SurfPackage;
  gallery: GalleryItem;
  faqs: Faq;
  testimonials: Testimonial;
};

export async function getSiteContent() {
  const item = await getPublicItems("settings");
  const editable = item[0] as EditableSiteContent | undefined;

  if (!editable) {
    return fallbackSiteContent;
  }

  return {
    ...fallbackSiteContent,
    ...editable,
    whatsapp: {
      ...fallbackSiteContent.whatsapp,
      ...editable.whatsapp,
    },
    address: {
      ...fallbackSiteContent.address,
      ...editable.address,
    },
    coordinates: {
      ...fallbackSiteContent.coordinates,
      ...editable.coordinates,
    },
    logoImage: {
      ...fallbackSiteContent.logoImage,
      ...editable.logoImage,
    },
    heroImage: {
      ...fallbackSiteContent.heroImage,
      ...editable.heroImage,
    },
  };
}

export async function getRooms() {
  return getPublicItems("rooms") as Promise<Room[]>;
}

export async function getSurfPackages() {
  return getPublicItems("packages") as Promise<SurfPackage[]>;
}

export async function getFaqs() {
  return getPublicItems("faqs") as Promise<Faq[]>;
}

export async function getGalleryItems() {
  return getPublicItems("gallery") as Promise<GalleryItem[]>;
}

export async function getTestimonials() {
  return getPublicItems("testimonials") as Promise<Testimonial[]>;
}

export async function getRoomBySlug(slug: string) {
  const rooms = await getRooms();
  return rooms.find((room) => room.slug === slug && room.available);
}

export async function getPackageBySlug(slug: string) {
  const packages = await getSurfPackages();
  return packages.find(
    (surfPackage) => surfPackage.slug === slug && surfPackage.available,
  );
}

export async function listRecentContentUpdates(limit = 6) {
  try {
    const supabase = getSupabaseAdminClient();
    const { data, error } = await supabase
      .from("website_content")
      .select("*")
      .order("updated_at", { ascending: false })
      .limit(limit);

    if (error) {
      throw new Error(error.message);
    }

    return data.map(rowToAdminItem);
  } catch {
    return [];
  }
}

export async function listAdminContentItems(
  sectionInput: string,
): Promise<AdminContentSectionData> {
  const section = contentSectionSchema.parse(sectionInput);
  const rows = await selectContentRows(section);

  if (rows.length === 0) {
    return {
      section,
      isSeeded: false,
      items: getStarterItems(section),
    };
  }

  return {
    section,
    isSeeded: true,
    items: rows.map(rowToAdminItem),
  };
}

export async function seedContentSection(sectionInput: string) {
  const section = contentSectionSchema.parse(sectionInput);
  const starterItems = getStarterItems(section);

  const savedItems = await Promise.all(
    starterItems.map((item) =>
      upsertContentItem({
        section,
        payload: item.payload,
        position: item.position,
      }),
    ),
  );

  return {
    section,
    isSeeded: true,
    items: savedItems,
  } satisfies AdminContentSectionData;
}

export async function upsertContentItem({
  section: sectionInput,
  payload,
  position = 0,
  previousId,
}: {
  section: string;
  payload: unknown;
  position?: number;
  previousId?: string;
}) {
  const section = contentSectionSchema.parse(sectionInput);
  const parsedPayload = validateContentPayload(section, payload);
  const itemKey = getPayloadItemKey(section, parsedPayload);
  const id = createContentId(section, itemKey);
  const supabase = getSupabaseAdminClient();

  const row = {
    id,
    content_type: section,
    item_key: itemKey,
    position,
    payload: toJsonRecord(parsedPayload),
  };

  const { data, error } = await supabase
    .from("website_content")
    .upsert(row, { onConflict: "id" })
    .select()
    .single();

  if (error) {
    throw new Error(`Supabase content upsert failed: ${error.message}`);
  }

  if (previousId && previousId !== id) {
    await deleteContentItem(previousId);
  }

  return rowToAdminItem(data);
}

export async function deleteContentItem(id: string) {
  const supabase = getSupabaseAdminClient();
  const { error } = await supabase.from("website_content").delete().eq("id", id);

  if (error) {
    throw new Error(`Supabase content delete failed: ${error.message}`);
  }
}

export function roomBookingOptionsFromRooms(rooms: Room[]) {
  return [
    "Not sure yet",
    ...rooms.filter((room) => room.available).map((room) => room.name),
  ];
}

export function packageBookingOptionsFromPackages(packages: SurfPackage[]) {
  return [
    ...packages
      .filter((surfPackage) => surfPackage.available)
      .map((surfPackage) => surfPackage.name),
    "Not sure yet",
  ];
}

async function getPublicItems(section: ContentSection) {
  try {
    const rows = await selectContentRows(section);

    if (rows.length === 0) {
      return getStarterPayloads(section);
    }

    return rows
      .map((row) => validateContentPayload(section, row.payload))
      .filter(Boolean) as PublicContentMap[typeof section][];
  } catch {
    return getStarterPayloads(section);
  }
}

async function selectContentRows(section: ContentSection) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("website_content")
    .select("*")
    .eq("content_type", section)
    .order("position", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw new Error(`Supabase content select failed: ${error.message}`);
  }

  return data;
}

function rowToAdminItem(row: WebsiteContentRow): AdminContentItem {
  const section = contentSectionSchema.parse(row.content_type);

  return {
    id: row.id,
    contentType: section,
    itemKey: row.item_key,
    position: row.position,
    payload: validateContentPayload(section, row.payload),
    updatedAt: row.updated_at,
    source: "database",
  };
}

function getStarterItems(section: ContentSection): AdminContentItem[] {
  return getStarterPayloads(section).map((payload, index) => {
    const itemKey = getPayloadItemKey(section, payload);

    return {
      id: createContentId(section, itemKey),
      contentType: section,
      itemKey,
      position: index,
      payload,
      updatedAt: new Date().toISOString(),
      source: "starter",
    };
  });
}

function getStarterPayloads(section: ContentSection) {
  switch (section) {
    case "settings":
      return [fallbackSiteContent];
    case "rooms":
      return fallbackRooms;
    case "packages":
      return fallbackPackages;
    case "gallery":
      return fallbackGalleryItems;
    case "faqs":
      return fallbackFaqs;
    case "testimonials":
      return fallbackTestimonials;
  }
}

function getPayloadItemKey(section: ContentSection, payload: unknown) {
  if (section === "settings") {
    return "site";
  }

  if (
    payload &&
    typeof payload === "object" &&
    "id" in payload &&
    typeof payload.id === "string"
  ) {
    return payload.id;
  }

  throw new Error("Content payload is missing an id.");
}

function createContentId(section: ContentSection, itemKey: string) {
  return `${section}:${itemKey}`;
}

function toJsonRecord(value: unknown) {
  return JSON.parse(JSON.stringify(value)) as Json;
}

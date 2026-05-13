"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  BedDouble,
  Camera,
  CheckCircle2,
  Copy,
  Database,
  Eye,
  EyeOff,
  GripVertical,
  HelpCircle,
  Image as ImageIcon,
  Loader2,
  Package,
  Plus,
  Quote,
  Save,
  Settings,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { ResilientImage } from "@/components/ui/resilient-image";
import type {
  ContentImage,
  Faq,
  FaqCategory,
  GalleryItem,
  Room,
  SurfPackage,
  Testimonial,
} from "@/content/types";
import type { ContentSection, EditableSiteContent } from "@/lib/content-schema";
import type { AdminContentItem } from "@/lib/content-store";
import { cn } from "@/lib/utils";

type ContentAdminProps = {
  adminEmail: string;
  section: ContentSection;
  initialItems: AdminContentItem[];
  isSeeded: boolean;
};

type Notice = {
  type: "success" | "error";
  message: string;
};

type UploadResult = {
  ok: boolean;
  url?: string;
  message?: string;
};

const sections = [
  { key: "settings", label: "Settings", icon: Settings },
  { key: "rooms", label: "Rooms", icon: BedDouble },
  { key: "packages", label: "Packages", icon: Package },
  { key: "gallery", label: "Gallery", icon: ImageIcon },
  { key: "faqs", label: "FAQs", icon: HelpCircle },
  { key: "testimonials", label: "Testimonials", icon: Quote },
] satisfies { key: ContentSection; label: string; icon: typeof Settings }[];

const faqCategories: FaqCategory[] = ["general", "rooms", "packages", "booking"];
const galleryCategories: GalleryItem["category"][] = [
  "surf",
  "rooms",
  "hostel",
  "wellness",
  "tamraght",
];
const uploadableTypes = ["image/jpeg", "image/png", "image/webp", "image/avif"];
const maxUploadBytes = 8 * 1024 * 1024;

export function ContentAdmin({
  adminEmail,
  section,
  initialItems,
  isSeeded,
}: ContentAdminProps) {
  const [items, setItems] = useState(initialItems);
  const [savedSnapshot, setSavedSnapshot] = useState(serializeItems(initialItems));
  const [seeded, setSeeded] = useState(isSeeded);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [openIds, setOpenIds] = useState<string[]>(initialItems.slice(0, 1).map((item) => item.id));

  const title = useMemo(
    () => sections.find((item) => item.key === section)?.label ?? "Content",
    [section],
  );
  const unsaved = savedSnapshot !== serializeItems(items);

  useEffect(() => {
    const beforeUnload = (event: BeforeUnloadEvent) => {
      if (!unsaved) {
        return;
      }

      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("beforeunload", beforeUnload);
    return () => window.removeEventListener("beforeunload", beforeUnload);
  }, [unsaved]);

  useEffect(() => {
    if (!notice) {
      return;
    }

    const timeout = window.setTimeout(() => setNotice(null), 4200);
    return () => window.clearTimeout(timeout);
  }, [notice]);

  function replaceItems(nextItems: AdminContentItem[]) {
    setItems(nextItems.map((item, index) => ({ ...item, position: index })));
  }

  function updateItem(id: string, payload: unknown) {
    replaceItems(
      items.map((item) => (item.id === id ? { ...item, payload } : item)),
    );
  }

  function addItem() {
    const payload = createBlankPayload(section, items.length + 1);
    const itemKey = section === "settings" ? "site" : getPayloadId(payload);
    const id = `${section}:${itemKey}`;
    const item: AdminContentItem = {
      id,
      contentType: section,
      itemKey,
      position: items.length,
      payload,
      updatedAt: new Date().toISOString(),
      source: seeded ? "database" : "starter",
    };

    replaceItems([...items, item]);
    setOpenIds((current) => [...current, item.id]);
    setNotice({ type: "success", message: "New draft item added." });
  }

  function duplicateItem(item: AdminContentItem) {
    const payload = clonePayload(section, item.payload);
    const itemKey = getPayloadId(payload);
    const duplicate: AdminContentItem = {
      ...item,
      id: `${section}:${itemKey}`,
      itemKey,
      payload,
      position: items.length,
      updatedAt: new Date().toISOString(),
      source: seeded ? "database" : "starter",
    };

    replaceItems([...items, duplicate]);
    setOpenIds((current) => [...current, duplicate.id]);
    setNotice({ type: "success", message: "Duplicated as a new draft." });
  }

  function moveItem(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;

    if (nextIndex < 0 || nextIndex >= items.length) {
      return;
    }

    const next = [...items];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    replaceItems(next);
  }

  async function saveAll() {
    const duplicateMessage = getDuplicateIdentityMessage(section, items);

    if (duplicateMessage) {
      setNotice({ type: "error", message: duplicateMessage });
      return;
    }

    setBusyId("save-all");
    setNotice(null);

    try {
      const savedItems = await Promise.all(
        items.map((item, index) => saveItemRequest(item, index)),
      );
      replaceItems(savedItems);
      setSeeded(true);
      setSavedSnapshot(serializeItems(savedItems));
      setNotice({
        type: "success",
        message: seeded
          ? "All content changes saved."
          : "Starter content is now published to Supabase.",
      });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Could not save content.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function saveItem(item: AdminContentItem, index: number) {
    const duplicateMessage = getDuplicateIdentityMessage(section, items);

    if (duplicateMessage) {
      setNotice({ type: "error", message: duplicateMessage });
      return;
    }

    if (!seeded) {
      setNotice({
        type: "error",
        message: "Publish this section first, then save single items.",
      });
      return;
    }

    setBusyId(item.id);
    setNotice(null);

    try {
      const savedItem = await saveItemRequest(item, index);
      const nextItems = items.map((currentItem) =>
        currentItem.id === item.id ? savedItem : currentItem,
      );
      replaceItems(nextItems);
      setSavedSnapshot(serializeItems(nextItems));
      setNotice({ type: "success", message: "Content saved." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Could not save content.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function deleteItem(item: AdminContentItem) {
    if (!seeded) {
      replaceItems(items.filter((currentItem) => currentItem.id !== item.id));
      return;
    }

    const confirmed = window.confirm("Delete this content item?");

    if (!confirmed) {
      return;
    }

    setBusyId(item.id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/content/${encodeURIComponent(item.id)}`, {
        method: "DELETE",
      });
      const data = await response.json() as { ok: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Could not delete content.");
      }

      const nextItems = items.filter((currentItem) => currentItem.id !== item.id);
      replaceItems(nextItems);
      setSavedSnapshot(serializeItems(nextItems));
      setNotice({ type: "success", message: "Content deleted." });
    } catch (error) {
      setNotice({
        type: "error",
        message: error instanceof Error ? error.message : "Could not delete content.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function saveItemRequest(item: AdminContentItem, index: number) {
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        section,
        payload: item.payload,
        position: index,
        previousId: item.id,
      }),
    });
    const data = await response.json() as {
      ok: boolean;
      item?: AdminContentItem;
      message?: string;
    };

    if (!response.ok || !data.ok || !data.item) {
      throw new Error(data.message ?? "Could not save content.");
    }

    return data.item;
  }

  return (
    <div className="grid gap-6">
      {notice ? <AdminToast notice={notice} onClose={() => setNotice(null)} /> : null}

      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--terracotta)]">
            Hospitality CMS
          </p>
          <h1 className="mt-3 text-3xl font-black text-[var(--ocean-deep)] sm:text-5xl">
            Website content
          </h1>
          <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
            Signed in as {adminEmail}. Manage rooms, packages, media, FAQs, SEO,
            and guest-facing details.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link className={pillClass} href="/admin">
            Dashboard
          </Link>
          <Link className={pillClass} href="/admin/bookings">
            Bookings
          </Link>
          <form action="/api/admin/logout" method="post">
            <button type="submit" className={pillClass}>
              Sign out
            </button>
          </form>
        </div>
      </div>

      <nav
        aria-label="Content sections"
        className="flex gap-2 overflow-x-auto rounded-lg border border-[var(--border-soft)] bg-white p-2"
      >
        {sections.map((item) => {
          const Icon = item.icon;
          const active = item.key === section;

          return (
            <Link
              key={item.key}
              href={`/admin/content/${item.key}`}
              className={cn(
                "inline-flex min-h-10 shrink-0 items-center justify-center gap-2 rounded-full px-4 text-sm font-bold transition",
                active
                  ? "bg-[var(--ocean-deep)] text-white"
                  : "text-[var(--ocean-deep)] hover:bg-[var(--foam)]",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="sticky top-20 z-30 rounded-lg border border-[var(--border-soft)] bg-white/95 p-3 shadow-[0_18px_60px_rgba(18,55,67,0.1)] backdrop-blur">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-black text-[var(--ocean-deep)]">{title}</p>
            <p className="text-xs font-semibold text-[var(--muted)]">
              {seeded ? "Editing live CMS content" : "Starter content preview"}
              {unsaved ? " - unsaved changes" : " - all changes saved"}
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            {section !== "settings" ? (
              <button type="button" onClick={addItem} className={secondaryButtonClass}>
                <Plus className="h-4 w-4" />
                Add
              </button>
            ) : null}
            <button
              type="button"
              onClick={saveAll}
              disabled={busyId === "save-all"}
              className={primaryButtonClass}
            >
              {busyId === "save-all" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              {seeded ? "Save all" : `Publish ${title}`}
            </button>
          </div>
        </div>
      </div>

      {!seeded ? (
        <div className="rounded-lg border border-[rgba(230,125,78,0.35)] bg-[rgba(230,125,78,0.08)] p-5">
          <p className="flex items-center gap-2 font-bold text-[var(--ocean-deep)]">
            <Database className="h-5 w-5 text-[var(--terracotta)]" />
            This section is still using starter content from code.
          </p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Publish it once to Supabase. After that, every save updates the live
            website content for this section.
          </p>
        </div>
      ) : null}

      {section === "gallery" ? (
        <GalleryGridEditor
          items={items}
          busyId={busyId}
          openIds={openIds}
          setOpenIds={setOpenIds}
          updateItem={updateItem}
          moveItem={moveItem}
          moveToTop={(index) => {
            const next = [...items];
            const [selected] = next.splice(index, 1);

            if (selected) {
              next.unshift(selected);
              replaceItems(next);
            }
          }}
          deleteItem={deleteItem}
          saveItem={saveItem}
        />
      ) : (
        <div className="grid gap-5">
          {items.map((item, index) => (
            <ContentCard
              key={item.id}
              item={item}
              section={section}
              busyId={busyId}
              canDuplicate={section === "rooms" || section === "packages"}
              isOpen={openIds.includes(item.id)}
              isFirst={index === 0}
              isLast={index === items.length - 1}
              onToggle={() =>
                setOpenIds((current) =>
                  current.includes(item.id)
                    ? current.filter((id) => id !== item.id)
                    : [...current, item.id],
                )
              }
              onUpdate={(payload) => updateItem(item.id, payload)}
              onMove={(direction) => moveItem(index, direction)}
              onDuplicate={() => duplicateItem(item)}
              onDelete={() => deleteItem(item)}
              onSave={() => saveItem(item, index)}
              seeded={seeded}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function GalleryGridEditor({
  items,
  busyId,
  openIds,
  setOpenIds,
  updateItem,
  moveItem,
  moveToTop,
  deleteItem,
  saveItem,
}: {
  items: AdminContentItem[];
  busyId: string | null;
  openIds: string[];
  setOpenIds: React.Dispatch<React.SetStateAction<string[]>>;
  updateItem: (id: string, payload: unknown) => void;
  moveItem: (index: number, direction: -1 | 1) => void;
  moveToTop: (index: number) => void;
  deleteItem: (item: AdminContentItem) => void;
  saveItem: (item: AdminContentItem, index: number) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const value = item.payload as GalleryItem;
        const isOpen = openIds.includes(item.id);

        return (
          <article
            key={item.id}
            className="overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white premium-shadow"
          >
            <div className="relative aspect-[4/3] bg-[var(--sand)]">
              <ResilientImage
                src={value.src}
                alt={value.alt}
                fill
                sizes="(min-width: 1280px) 33vw, (min-width: 640px) 50vw, 100vw"
                className="object-cover"
                fallbackLabel="Gallery image"
              />
              {index === 0 ? (
                <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-black text-[var(--terracotta)] shadow-sm">
                  Featured
                </span>
              ) : null}
            </div>
            <div className="grid gap-4 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-[var(--ocean-deep)]">
                    {value.alt}
                  </p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-[var(--terracotta)]">
                    {value.category}
                  </p>
                </div>
                <button
                  type="button"
                  className={iconButtonClass}
                  onClick={() =>
                    setOpenIds((current) =>
                      current.includes(item.id)
                        ? current.filter((id) => id !== item.id)
                        : [...current, item.id],
                    )
                  }
                  aria-label="Toggle gallery editor"
                >
                  {isOpen ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {isOpen ? (
                <GalleryEditor
                  value={value}
                  onChange={(payload) => updateItem(item.id, payload)}
                />
              ) : null}

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  disabled={index === 0}
                  className={secondaryButtonClass}
                  onClick={() => moveItem(index, -1)}
                >
                  <ArrowUp className="h-4 w-4" />
                  Up
                </button>
                <button
                  type="button"
                  disabled={index === items.length - 1}
                  className={secondaryButtonClass}
                  onClick={() => moveItem(index, 1)}
                >
                  <ArrowDown className="h-4 w-4" />
                  Down
                </button>
                <button
                  type="button"
                  disabled={index === 0}
                  className={secondaryButtonClass}
                  onClick={() => moveToTop(index)}
                >
                  <Camera className="h-4 w-4" />
                  Feature
                </button>
                <button
                  type="button"
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 px-3 text-sm font-bold text-red-700 hover:bg-red-50"
                  onClick={() => deleteItem(item)}
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </button>
              </div>
              <button
                type="button"
                onClick={() => saveItem(item, index)}
                disabled={busyId === item.id}
                className={primaryButtonClass}
              >
                {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save image
              </button>
            </div>
          </article>
        );
      })}
    </div>
  );
}

function ContentCard({
  item,
  section,
  busyId,
  canDuplicate,
  isOpen,
  isFirst,
  isLast,
  seeded,
  onToggle,
  onUpdate,
  onMove,
  onDuplicate,
  onDelete,
  onSave,
}: {
  item: AdminContentItem;
  section: ContentSection;
  busyId: string | null;
  canDuplicate: boolean;
  isOpen: boolean;
  isFirst: boolean;
  isLast: boolean;
  seeded: boolean;
  onToggle: () => void;
  onUpdate: (payload: unknown) => void;
  onMove: (direction: -1 | 1) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  onSave: () => void;
}) {
  const title = getItemTitle(section, item.payload);
  const subtitle = getItemSubtitle(section, item.payload);
  const published = isPublishable(section, item.payload)
    ? Boolean((item.payload as Room | SurfPackage).available)
    : true;

  return (
    <article className="rounded-lg border border-[var(--border-soft)] bg-white premium-shadow">
      <div className="flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onToggle}
          className="flex min-w-0 flex-1 items-center gap-4 text-left"
        >
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-[var(--foam)] text-[var(--ocean)]">
            <GripVertical className="h-5 w-5" />
          </span>
          <span className="min-w-0">
            <span className="block truncate text-lg font-black text-[var(--ocean-deep)]">
              {title}
            </span>
            <span className="mt-1 block truncate text-sm text-[var(--muted)]">
              {subtitle}
            </span>
          </span>
        </button>
        <div className="flex flex-wrap gap-2">
          {isPublishable(section, item.payload) ? (
            <span
              className={cn(
                "inline-flex min-h-9 items-center gap-2 rounded-full px-3 text-xs font-black uppercase tracking-[0.12em]",
                published
                  ? "bg-emerald-50 text-emerald-800"
                  : "bg-slate-100 text-slate-600",
              )}
            >
              {published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
              {published ? "Published" : "Hidden"}
            </span>
          ) : null}
          <button type="button" className={iconButtonClass} disabled={isFirst} onClick={() => onMove(-1)} aria-label="Move up">
            <ArrowUp className="h-4 w-4" />
          </button>
          <button type="button" className={iconButtonClass} disabled={isLast} onClick={() => onMove(1)} aria-label="Move down">
            <ArrowDown className="h-4 w-4" />
          </button>
        </div>
      </div>

      {isOpen ? (
        <div className="grid gap-5 border-t border-[var(--border-soft)] p-4 sm:p-5">
          {renderEditor({ section, item, updatePayload: onUpdate })}
          <div className="sticky bottom-3 z-20 flex flex-col gap-2 rounded-lg border border-[var(--border-soft)] bg-white/95 p-3 shadow-[0_18px_60px_rgba(18,55,67,0.12)] backdrop-blur sm:flex-row sm:justify-end">
            {canDuplicate ? (
              <button type="button" onClick={onDuplicate} className={secondaryButtonClass}>
                <Copy className="h-4 w-4" />
                Duplicate
              </button>
            ) : null}
            {section !== "settings" ? (
              <button type="button" onClick={onDelete} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-red-200 px-5 text-sm font-bold text-red-700 hover:bg-red-50">
                <Trash2 className="h-4 w-4" />
                Delete
              </button>
            ) : null}
            <button
              type="button"
              onClick={onSave}
              disabled={!seeded || busyId === item.id}
              className={primaryButtonClass}
            >
              {busyId === item.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              Save item
            </button>
          </div>
        </div>
      ) : null}
    </article>
  );
}

function renderEditor({
  section,
  item,
  updatePayload,
}: {
  section: ContentSection;
  item: AdminContentItem;
  updatePayload: (payload: unknown) => void;
}) {
  switch (section) {
    case "settings":
      return (
        <SettingsEditor
          value={item.payload as EditableSiteContent}
          onChange={updatePayload}
        />
      );
    case "rooms":
      return <RoomEditor value={item.payload as Room} onChange={updatePayload} />;
    case "packages":
      return <PackageEditor value={item.payload as SurfPackage} onChange={updatePayload} />;
    case "gallery":
      return <GalleryEditor value={item.payload as GalleryItem} onChange={updatePayload} />;
    case "faqs":
      return <FaqEditor value={item.payload as Faq} onChange={updatePayload} />;
    case "testimonials":
      return <TestimonialEditor value={item.payload as Testimonial} onChange={updatePayload} />;
  }
}

function SettingsEditor({
  value,
  onChange,
}: {
  value: EditableSiteContent;
  onChange: (value: EditableSiteContent) => void;
}) {
  return (
    <div className="grid gap-4">
      <EditorPanel title="Branding" description="Core brand details shown across the site.">
        <Input label="Hostel name" value={value.name} onChange={(name) => onChange({ ...value, name })} />
        <Input label="Short name" value={value.shortName} onChange={(shortName) => onChange({ ...value, shortName })} />
        <Input label="Location" value={value.location} onChange={(location) => onChange({ ...value, location })} />
        <Textarea label="Tagline" value={value.tagline} onChange={(tagline) => onChange({ ...value, tagline })} />
        <div className="md:col-span-2">
          <ImageManager
            title="Logo circle mark"
            image={value.logoImage}
            section="branding"
            onChange={(logoImage) => onChange({ ...value, logoImage })}
          />
        </div>
      </EditorPanel>

      <EditorPanel title="Theme colors" description="Site-wide brand, surface, and text colors used across public pages and admin.">
        <ColorInput label="Page background" value={value.theme.background} onChange={(background) => onChange({ ...value, theme: { ...value.theme, background } })} />
        <ColorInput label="Main text" value={value.theme.foreground} onChange={(foreground) => onChange({ ...value, theme: { ...value.theme, foreground } })} />
        <ColorInput label="Ocean accent" value={value.theme.ocean} onChange={(ocean) => onChange({ ...value, theme: { ...value.theme, ocean } })} />
        <ColorInput label="Deep ocean" value={value.theme.oceanDeep} onChange={(oceanDeep) => onChange({ ...value, theme: { ...value.theme, oceanDeep } })} />
        <ColorInput label="Sand" value={value.theme.sand} onChange={(sand) => onChange({ ...value, theme: { ...value.theme, sand } })} />
        <ColorInput label="Sunset CTA" value={value.theme.sunset} onChange={(sunset) => onChange({ ...value, theme: { ...value.theme, sunset } })} />
        <ColorInput label="Terracotta accent" value={value.theme.terracotta} onChange={(terracotta) => onChange({ ...value, theme: { ...value.theme, terracotta } })} />
        <ColorInput label="Soft surface" value={value.theme.foam} onChange={(foam) => onChange({ ...value, theme: { ...value.theme, foam } })} />
        <ColorInput label="Muted text" value={value.theme.muted} onChange={(muted) => onChange({ ...value, theme: { ...value.theme, muted } })} />
        <ColorInput label="Soft borders" value={value.theme.borderSoft} onChange={(borderSoft) => onChange({ ...value, theme: { ...value.theme, borderSoft } })} />
      </EditorPanel>

      <EditorPanel title="Contact" description="Guest-facing email, WhatsApp, address, and maps.">
        <Input label="Email" value={value.email} onChange={(email) => onChange({ ...value, email })} />
        <Input label="WhatsApp display" value={value.whatsapp.display} onChange={(display) => onChange({ ...value, whatsapp: { ...value.whatsapp, display } })} />
        <Input label="WhatsApp E.164" value={value.whatsapp.e164} onChange={(e164) => onChange({ ...value, whatsapp: { ...value.whatsapp, e164 } })} />
        <Textarea label="WhatsApp default message" value={value.whatsapp.defaultMessage} onChange={(defaultMessage) => onChange({ ...value, whatsapp: { ...value.whatsapp, defaultMessage } })} />
        <Input label="Address line" value={value.address.line1} onChange={(line1) => onChange({ ...value, address: { ...value.address, line1 } })} />
        <Input label="Locality" value={value.address.locality} onChange={(locality) => onChange({ ...value, address: { ...value.address, locality } })} />
        <Input label="Region" value={value.address.region} onChange={(region) => onChange({ ...value, address: { ...value.address, region } })} />
        <Input label="Country" value={value.address.country} onChange={(country) => onChange({ ...value, address: { ...value.address, country } })} />
        <Input label="Country code" value={value.address.countryCode} onChange={(countryCode) => onChange({ ...value, address: { ...value.address, countryCode } })} />
        <Input label="Google Maps embed URL" value={value.googleMapsEmbedUrl} onChange={(googleMapsEmbedUrl) => onChange({ ...value, googleMapsEmbedUrl })} />
      </EditorPanel>

      <EditorPanel title="Homepage" description="Hero image, pricing signal, and stay logistics.">
        <Input label="Check-in time" value={value.checkInTime} onChange={(checkInTime) => onChange({ ...value, checkInTime })} />
        <Input label="Check-out time" value={value.checkOutTime} onChange={(checkOutTime) => onChange({ ...value, checkOutTime })} />
        <Input label="Price range" value={value.priceRange} onChange={(priceRange) => onChange({ ...value, priceRange })} />
        <Input label="Latitude" value={String(value.coordinates.latitude)} onChange={(latitude) => onChange({ ...value, coordinates: { ...value.coordinates, latitude: Number(latitude) } })} />
        <Input label="Longitude" value={String(value.coordinates.longitude)} onChange={(longitude) => onChange({ ...value, coordinates: { ...value.coordinates, longitude: Number(longitude) } })} />
        <div className="md:col-span-2">
          <ImageManager
            title="Hero image"
            image={value.heroImage}
            section="hero"
            onChange={(heroImage) => onChange({ ...value, heroImage })}
          />
        </div>
      </EditorPanel>

      <EditorPanel title="Global labels" description="Reusable interface copy shown in navigation, floating contact, and the footer.">
        <Input label="Booking button label" value={value.uiText.bookingButton} onChange={(bookingButton) => onChange({ ...value, uiText: { ...value.uiText, bookingButton } })} />
        <Input label="WhatsApp button label" value={value.uiText.whatsappButton} onChange={(whatsappButton) => onChange({ ...value, uiText: { ...value.uiText, whatsappButton } })} />
        <Textarea label="Footer description" value={value.uiText.footerDescription} onChange={(footerDescription) => onChange({ ...value, uiText: { ...value.uiText, footerDescription } })} />
        <Textarea label="Footer note" value={value.uiText.footerNote} onChange={(footerNote) => onChange({ ...value, uiText: { ...value.uiText, footerNote } })} />
      </EditorPanel>

      <EditorPanel title="SEO" description="Search metadata and social profile links.">
        <Input label="Website URL" value={value.url} onChange={(url) => onChange({ ...value, url })} />
        <Input label="Instagram URL" value={value.instagram} onChange={(instagram) => onChange({ ...value, instagram })} />
        <Textarea label="SEO description" value={value.description} onChange={(description) => onChange({ ...value, description })} />
        <Textarea label="SEO keywords" help="One keyword per line." value={arrayToLines(value.seoKeywords)} onChange={(text) => onChange({ ...value, seoKeywords: linesToArray(text) })} />
      </EditorPanel>

      <EditorPanel title="Policies" description="Guest policies shown and referenced across booking pages.">
        <Textarea
          label="Policies"
          help="One policy per line. Format: Title | Detail"
          value={policiesToLines(value.policies)}
          onChange={(text) => onChange({ ...value, policies: linesToPolicies(text) })}
        />
      </EditorPanel>
    </div>
  );
}

function RoomEditor({ value, onChange }: { value: Room; onChange: (value: Room) => void }) {
  return (
    <div className="grid gap-4">
      <EditorPanel title="Room identity" description="Name, slug, visibility, price, and booking label.">
        <Input label="Name" value={value.name} onChange={(name) => onChange(withGeneratedRoomIdentity(value, name))} />
        <Input label="ID" value={value.id} onChange={(id) => onChange({ ...value, id: slugify(id) })} />
        <Input label="Slug" value={value.slug} onChange={(slug) => onChange({ ...value, slug: slugify(slug) })} />
        <Input label="Price per night" value={String(value.pricePerNight)} onChange={(pricePerNight) => onChange({ ...value, pricePerNight: Number(pricePerNight) })} />
        <Input label="Currency" value={value.currency} onChange={(currency) => onChange({ ...value, currency })} />
        <Input label="Capacity" value={String(value.capacity)} onChange={(capacity) => onChange({ ...value, capacity: Number(capacity) })} />
        <Input label="Bed type" value={value.bedType} onChange={(bedType) => onChange({ ...value, bedType })} />
        <Input label="Booking CTA" value={value.bookingCtaText} onChange={(bookingCtaText) => onChange({ ...value, bookingCtaText })} />
        <Checkbox label="Published on website" checked={value.available} onChange={(available) => onChange({ ...value, available })} />
      </EditorPanel>
      <EditorPanel title="Copy" description="Guest-facing descriptions and room amenities.">
        <Textarea label="Short description" value={value.shortDescription} onChange={(shortDescription) => onChange({ ...value, shortDescription })} />
        <Textarea label="Full description" value={value.fullDescription} onChange={(fullDescription) => onChange({ ...value, fullDescription })} />
        <Textarea label="Amenities" help="One amenity per line." value={arrayToLines(value.amenities)} onChange={(text) => onChange({ ...value, amenities: linesToArray(text) })} />
      </EditorPanel>
      <EditorPanel title="Images" description="Upload, preview, reorder, and choose the featured room photo.">
        <div className="md:col-span-2">
          <ImageManager title="Featured image" image={value.featuredImage} section="rooms" onChange={(featuredImage) => onChange({ ...value, featuredImage })} />
        </div>
        <div className="md:col-span-2">
          <ImageListEditor
            section="rooms"
            images={value.images}
            onChange={(images) => onChange({ ...value, images })}
            onSetFeatured={(featuredImage) => onChange({ ...value, featuredImage })}
          />
        </div>
      </EditorPanel>
    </div>
  );
}

function PackageEditor({ value, onChange }: { value: SurfPackage; onChange: (value: SurfPackage) => void }) {
  return (
    <div className="grid gap-4">
      <EditorPanel title="Package identity" description="Name, slug, visibility, price, duration, and CTA.">
        <Input label="Name" value={value.name} onChange={(name) => onChange(withGeneratedPackageIdentity(value, name))} />
        <Input label="ID" value={value.id} onChange={(id) => onChange({ ...value, id: slugify(id) })} />
        <Input label="Slug" value={value.slug} onChange={(slug) => onChange({ ...value, slug: slugify(slug) })} />
        <Input label="Price" value={value.price} onChange={(price) => onChange({ ...value, price })} />
        <Input label="Duration" value={value.duration} onChange={(duration) => onChange({ ...value, duration })} />
        <Input label="Booking CTA" value={value.bookingCtaText} onChange={(bookingCtaText) => onChange({ ...value, bookingCtaText })} />
        <Checkbox label="Published on website" checked={value.available} onChange={(available) => onChange({ ...value, available })} />
      </EditorPanel>
      <EditorPanel title="Copy" description="Package description, inclusions, and guest fit.">
        <Textarea label="Short description" value={value.shortDescription} onChange={(shortDescription) => onChange({ ...value, shortDescription })} />
        <Textarea label="Full description" value={value.fullDescription} onChange={(fullDescription) => onChange({ ...value, fullDescription })} />
        <Textarea label="Includes" help="One include per line." value={arrayToLines(value.includes)} onChange={(text) => onChange({ ...value, includes: linesToArray(text) })} />
        <Textarea label="Ideal for" help="One guest type per line." value={arrayToLines(value.idealFor)} onChange={(text) => onChange({ ...value, idealFor: linesToArray(text) })} />
      </EditorPanel>
      <EditorPanel title="Images" description="Upload, preview, reorder, and choose the featured package photo.">
        <div className="md:col-span-2">
          <ImageManager title="Featured image" image={value.featuredImage} section="packages" onChange={(featuredImage) => onChange({ ...value, featuredImage })} />
        </div>
        <div className="md:col-span-2">
          <ImageListEditor
            section="packages"
            images={value.images}
            onChange={(images) => onChange({ ...value, images })}
            onSetFeatured={(featuredImage) => onChange({ ...value, featuredImage })}
          />
        </div>
      </EditorPanel>
    </div>
  );
}

function GalleryEditor({ value, onChange }: { value: GalleryItem; onChange: (value: GalleryItem) => void }) {
  return (
    <div className="grid gap-4">
      <ImageManager
        title="Gallery image"
        image={value}
        section="gallery"
        allowCaption
        onChange={(image) =>
          onChange({
            ...value,
            ...image,
            id:
              image.alt !== value.alt
                ? slugFromText(image.alt, value.id)
                : value.id,
          })
        }
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="ID" value={value.id} onChange={(id) => onChange({ ...value, id: slugify(id) })} />
        <Select label="Category" value={value.category} options={galleryCategories} onChange={(category) => onChange({ ...value, category: category as GalleryItem["category"] })} />
      </div>
    </div>
  );
}

function FaqEditor({ value, onChange }: { value: Faq; onChange: (value: Faq) => void }) {
  return (
    <EditorPanel title="FAQ" description="Question, answer, and where it appears.">
      <Input label="ID" value={value.id} onChange={(id) => onChange({ ...value, id: slugify(id) })} />
      <Input label="Question" value={value.question} onChange={(question) => onChange({ ...value, question, id: slugFromText(question, value.id) })} />
      <Textarea label="Answer" value={value.answer} onChange={(answer) => onChange({ ...value, answer })} />
      <div className="grid gap-2">
        <p className="text-sm font-bold text-[var(--ocean-deep)]">Categories</p>
        <div className="flex flex-wrap gap-3">
          {faqCategories.map((category) => (
            <Checkbox
              key={category}
              label={category}
              checked={value.categories.includes(category)}
              onChange={(checked) =>
                onChange({
                  ...value,
                  categories: checked
                    ? [...new Set([...value.categories, category])]
                    : value.categories.filter((item) => item !== category),
                })
              }
            />
          ))}
        </div>
      </div>
    </EditorPanel>
  );
}

function TestimonialEditor({ value, onChange }: { value: Testimonial; onChange: (value: Testimonial) => void }) {
  return (
    <EditorPanel title="Testimonial" description="Use real verified guest reviews before launch.">
      <Input label="ID" value={value.id} onChange={(id) => onChange({ ...value, id: slugify(id) })} />
      <Input label="Display name" value={value.name} onChange={(name) => onChange({ ...value, name, id: slugFromText(name, value.id) })} />
      <Input label="Detail" value={value.detail} onChange={(detail) => onChange({ ...value, detail })} />
      <Textarea label="Quote" value={value.quote} onChange={(quote) => onChange({ ...value, quote })} />
    </EditorPanel>
  );
}

function EditorPanel({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <details open className="rounded-lg border border-[var(--border-soft)] bg-[var(--foam)] p-4">
      <summary className="cursor-pointer list-none">
        <p className="text-base font-black text-[var(--ocean-deep)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--muted)]">{description}</p>
      </summary>
      <div className="mt-5 grid gap-4 md:grid-cols-2">{children}</div>
    </details>
  );
}

function ImageListEditor({
  images,
  section,
  onChange,
  onSetFeatured,
}: {
  images: ContentImage[];
  section: string;
  onChange: (images: ContentImage[]) => void;
  onSetFeatured: (image: ContentImage) => void;
}) {
  function updateImage(index: number, image: ContentImage) {
    onChange(images.map((item, currentIndex) => currentIndex === index ? image : item));
  }

  function moveImage(index: number, direction: -1 | 1) {
    const nextIndex = index + direction;
    if (nextIndex < 0 || nextIndex >= images.length) {
      return;
    }
    const next = [...images];
    [next[index], next[nextIndex]] = [next[nextIndex], next[index]];
    onChange(next);
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm font-black text-[var(--ocean-deep)]">Gallery images</p>
        <button
          type="button"
          className={secondaryButtonClass}
          onClick={() => onChange([...images, { src: "", alt: "New image" }])}
        >
          <Plus className="h-4 w-4" />
          Add image
        </button>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {images.map((image, index) => (
          <div key={`${image.src}-${index}`} className="rounded-lg border border-[var(--border-soft)] bg-white p-4">
            <ImageManager
              title={`Image ${index + 1}`}
              image={image}
              section={section}
              allowCaption
              onChange={(nextImage) => updateImage(index, nextImage)}
            />
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button type="button" disabled={index === 0} className={secondaryButtonClass} onClick={() => moveImage(index, -1)}>
                <ArrowUp className="h-4 w-4" />
                Up
              </button>
              <button type="button" disabled={index === images.length - 1} className={secondaryButtonClass} onClick={() => moveImage(index, 1)}>
                <ArrowDown className="h-4 w-4" />
                Down
              </button>
              <button type="button" className={secondaryButtonClass} onClick={() => onSetFeatured(image)}>
                <Camera className="h-4 w-4" />
                Feature
              </button>
              <button type="button" className="inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-red-200 px-3 text-sm font-bold text-red-700 hover:bg-red-50" onClick={() => onChange(images.filter((_, currentIndex) => currentIndex !== index))}>
                <Trash2 className="h-4 w-4" />
                Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ImageManager({
  title,
  image,
  section,
  allowCaption = false,
  onChange,
}: {
  title: string;
  image: ContentImage;
  section: string;
  allowCaption?: boolean;
  onChange: (image: ContentImage) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function upload(file: File) {
    setError(null);

    if (!uploadableTypes.includes(file.type)) {
      setError("Use JPG, PNG, WebP, or AVIF.");
      return;
    }

    if (file.size > maxUploadBytes) {
      setError("Image must be smaller than 8 MB.");
      return;
    }

    setUploading(true);

    try {
      const body = new FormData();
      body.append("file", file);
      body.append("section", section);
      const response = await fetch("/api/admin/uploads", {
        method: "POST",
        body,
      });
      const data = await response.json() as UploadResult;

      if (!response.ok || !data.ok || !data.url) {
        throw new Error(data.message ?? "Upload failed.");
      }

      onChange({
        ...image,
        src: data.url,
        alt: image.alt || cleanFileName(file.name),
      });
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : "Upload failed.");
    } finally {
      setUploading(false);
      setDragging(false);
    }
  }

  return (
    <div className="grid gap-4 rounded-lg border border-[var(--border-soft)] bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="font-black text-[var(--ocean-deep)]">{title}</p>
        {image.src ? (
          <button
            type="button"
            className={iconButtonClass}
            onClick={() => onChange({ ...image, src: "" })}
            aria-label="Remove image"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </div>
      <div
        className={cn(
          "relative grid min-h-56 place-items-center overflow-hidden rounded-lg border border-dashed bg-[var(--sand)] transition",
          dragging && "border-[var(--sunset)] ring-4 ring-[rgba(230,125,78,0.16)]",
        )}
        onDragOver={(event) => {
          event.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(event) => {
          event.preventDefault();
          const file = event.dataTransfer.files[0];
          if (file) {
            void upload(file);
          }
        }}
      >
        {image.src ? (
          <ResilientImage
            src={image.src}
            alt={image.alt || title}
            fill
            sizes="(min-width: 1024px) 34vw, 100vw"
            className="object-cover"
            fallbackLabel="Image preview"
          />
        ) : (
          <div className="p-6 text-center">
            <UploadCloud className="mx-auto h-8 w-8 text-[var(--terracotta)]" />
            <p className="mt-3 text-sm font-black text-[var(--ocean-deep)]">
              Drop an image here
            </p>
            <p className="mt-1 text-xs text-[var(--muted)]">
              JPG, PNG, WebP, or AVIF up to 8 MB
            </p>
          </div>
        )}
        {uploading ? (
          <div className="absolute inset-0 grid place-items-center bg-white/70 backdrop-blur">
            <Loader2 className="h-6 w-6 animate-spin text-[var(--ocean-deep)]" />
          </div>
        ) : null}
      </div>
      <label className={secondaryButtonClass}>
        <UploadCloud className="h-4 w-4" />
        Upload or replace
        <input
          type="file"
          accept={uploadableTypes.join(",")}
          className="hidden"
          onChange={(event) => {
            const file = event.target.files?.[0];
            if (file) {
              void upload(file);
            }
          }}
        />
      </label>
      <Input label="Image URL" value={image.src} onChange={(src) => onChange({ ...image, src })} />
      <Input label="Alt text" value={image.alt} onChange={(alt) => onChange({ ...image, alt })} />
      {allowCaption ? (
        <Input label="Caption" value={image.caption ?? ""} onChange={(caption) => onChange({ ...image, caption })} />
      ) : null}
      {error ? <p className="text-sm font-semibold text-red-700">{error}</p> : null}
    </div>
  );
}

function AdminToast({ notice, onClose }: { notice: Notice; onClose: () => void }) {
  return (
    <div
      className={cn(
        "fixed right-4 top-24 z-[80] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border bg-white p-4 text-sm shadow-[0_18px_60px_rgba(18,55,67,0.18)] sm:max-w-sm",
        notice.type === "success"
          ? "border-emerald-200 text-[var(--ocean-deep)]"
          : "border-red-200 text-red-800",
      )}
      role="status"
      aria-live="polite"
    >
      <span className={cn("mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full", notice.type === "success" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}>
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <p className="leading-6">{notice.message}</p>
      <button type="button" onClick={onClose} className={iconButtonClass} aria-label="Close notification">
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function Input({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-[var(--ocean-deep)]">{label}</span>
      <input value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass} />
    </label>
  );
}

function ColorInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const pickerValue = isHexColor(value) ? value : "#000000";

  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-[var(--ocean-deep)]">{label}</span>
      <span className="flex min-h-11 items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-white px-3">
        <input
          type="color"
          value={pickerValue}
          onChange={(event) => onChange(event.target.value)}
          className="h-8 w-10 shrink-0 cursor-pointer rounded border border-[var(--border-soft)] bg-transparent p-0"
          aria-label={`${label} picker`}
        />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="min-w-0 flex-1 bg-transparent text-sm font-semibold uppercase text-[var(--ocean-deep)] outline-none"
          placeholder="#123743"
          spellCheck={false}
        />
      </span>
    </label>
  );
}

function Select({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (value: string) => void }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-[var(--ocean-deep)]">{label}</span>
      <select value={value} onChange={(event) => onChange(event.target.value)} className={fieldClass}>
        {options.map((option) => (
          <option key={option} value={option}>{option}</option>
        ))}
      </select>
    </label>
  );
}

function Textarea({ label, value, onChange, help }: { label: string; value: string; onChange: (value: string) => void; help?: string }) {
  return (
    <label className="grid gap-2 md:col-span-2">
      <span className="text-sm font-bold text-[var(--ocean-deep)]">{label}</span>
      {help ? <span className="text-xs font-semibold text-[var(--muted)]">{help}</span> : null}
      <textarea value={value} onChange={(event) => onChange(event.target.value)} className={cn(fieldClass, "min-h-28 py-3")} />
    </label>
  );
}

function Checkbox({ label, checked, onChange }: { label: string; checked: boolean; onChange: (checked: boolean) => void }) {
  return (
    <label className="inline-flex min-h-11 items-center gap-3 rounded-lg border border-[var(--border-soft)] bg-white px-4 text-sm font-bold text-[var(--ocean-deep)]">
      <input type="checkbox" checked={checked} onChange={(event) => onChange(event.target.checked)} className="h-4 w-4 accent-[var(--sunset)]" />
      {label}
    </label>
  );
}

function createBlankPayload(section: ContentSection, count: number) {
  const id = `new-${section}-${count}-${Date.now().toString(36)}`;

  switch (section) {
    case "rooms":
      return {
        id,
        name: "New Room",
        slug: id,
        shortDescription: "Short description for this new room type.",
        fullDescription: "Full description for this new room type. Explain the atmosphere, layout, and ideal guest clearly.",
        pricePerNight: 50,
        currency: "EUR",
        capacity: 2,
        bedType: "Double bed",
        amenities: ["Fresh linens", "Wi-Fi"],
        images: [{ src: "/images/rooms/private-double-room.svg", alt: "Room photo placeholder" }],
        featuredImage: { src: "/images/rooms/private-double-room.svg", alt: "Room photo placeholder" },
        available: false,
        bookingCtaText: "Request this room",
      } satisfies Room;
    case "packages":
      return {
        id,
        name: "New Surf Package",
        slug: id,
        shortDescription: "Short description for this surf package.",
        fullDescription: "Full description for this surf package. Explain the duration, included support, and ideal guest clearly.",
        price: "from EUR 250",
        duration: "Flexible dates",
        includes: ["Surf planning", "WhatsApp follow-up"],
        idealFor: ["Surf travelers"],
        images: [{ src: "/images/packages/surf-camp-package.svg", alt: "Surf package photo placeholder" }],
        featuredImage: { src: "/images/packages/surf-camp-package.svg", alt: "Surf package photo placeholder" },
        available: false,
        bookingCtaText: "Request package",
      } satisfies SurfPackage;
    case "gallery":
      return { id, src: "/images/gallery/gallery-surf-arrival.svg", alt: "Gallery photo placeholder", category: "surf", caption: "" } satisfies GalleryItem;
    case "faqs":
      return { id, question: "New question?", answer: "Write a clear answer for guests here.", categories: ["general"] } satisfies Faq;
    case "testimonials":
      return { id, quote: "Replace this placeholder with a verified guest review before launch.", name: "Example guest", detail: "Placeholder testimonial" } satisfies Testimonial;
    case "settings":
      throw new Error("Settings only has one editable record.");
  }
}

function clonePayload(section: ContentSection, payload: unknown) {
  const clone = JSON.parse(JSON.stringify(payload)) as Record<string, unknown>;
  const baseId = getPayloadId(clone);
  const originalName = String(clone.name ?? baseId);
  const nextName =
    section === "rooms" || section === "packages"
      ? `Copy of ${originalName}`
      : originalName;
  const nextId = `${slugFromText(nextName, baseId)}-${Date.now().toString(36)}`;
  clone.id = nextId;

  if ("slug" in clone) {
    clone.slug = nextId;
  }

  if (section === "rooms" || section === "packages") {
    clone.name = nextName;
    clone.available = false;
  }

  return clone;
}

function getPayloadId(payload: unknown) {
  return payload && typeof payload === "object" && "id" in payload && typeof payload.id === "string" ? payload.id : "item";
}

function getItemTitle(section: ContentSection, payload: unknown) {
  if (section === "settings") {
    return (payload as EditableSiteContent).name;
  }
  if (section === "gallery") {
    return (payload as GalleryItem).alt;
  }
  if (section === "faqs") {
    return (payload as Faq).question;
  }
  if (section === "testimonials") {
    return (payload as Testimonial).name;
  }
  return (payload as Room | SurfPackage).name;
}

function getItemSubtitle(section: ContentSection, payload: unknown) {
  if (section === "settings") {
    return "Branding, contact, SEO, policies, and homepage settings";
  }
  if (section === "gallery") {
    return (payload as GalleryItem).src;
  }
  if (section === "faqs") {
    return (payload as Faq).categories.join(", ");
  }
  if (section === "testimonials") {
    return (payload as Testimonial).detail;
  }
  return (payload as Room | SurfPackage).slug;
}

function isPublishable(section: ContentSection, payload: unknown) {
  return (section === "rooms" || section === "packages") && Boolean(payload && typeof payload === "object" && "available" in payload);
}

function withGeneratedRoomIdentity(value: Room, name: string): Room {
  const generated = slugFromText(name, value.id);

  return {
    ...value,
    name,
    id: generated,
    slug: generated,
  };
}

function withGeneratedPackageIdentity(
  value: SurfPackage,
  name: string,
): SurfPackage {
  const generated = slugFromText(name, value.id);

  return {
    ...value,
    name,
    id: generated,
    slug: generated,
  };
}

function slugFromText(value: string, fallback: string) {
  return slugify(value) || fallback || "item";
}

function getDuplicateIdentityMessage(
  section: ContentSection,
  items: AdminContentItem[],
) {
  if (section === "settings") {
    return null;
  }

  const ids = new Set<string>();
  const slugs = new Set<string>();

  for (const item of items) {
    const payload = item.payload as Partial<Room & SurfPackage & GalleryItem & Faq & Testimonial>;
    const id = typeof payload.id === "string" ? payload.id : "";

    if (!id) {
      return "Every content item needs an ID before saving.";
    }

    if (ids.has(id)) {
      return `Duplicate ID "${id}". Change the name or ID before saving.`;
    }

    ids.add(id);

    if (section === "rooms" || section === "packages") {
      const slug = typeof payload.slug === "string" ? payload.slug : "";

      if (!slug) {
        return "Every room and package needs a slug before saving.";
      }

      if (slugs.has(slug)) {
        return `Duplicate slug "${slug}". Change the name or slug before saving.`;
      }

      slugs.add(slug);
    }
  }

  return null;
}

function arrayToLines(values: string[]) {
  return values.join("\n");
}

function linesToArray(value: string) {
  return value.split("\n").map((line) => line.trim()).filter(Boolean);
}

function policiesToLines(policies: { title: string; detail: string }[]) {
  return policies.map((policy) => `${policy.title} | ${policy.detail}`).join("\n");
}

function linesToPolicies(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [title = "", detail = ""] = line.split("|").map((part) => part.trim());
      return { title, detail };
    });
}

function cleanFileName(name: string) {
  return name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ");
}

function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function isHexColor(value: string) {
  return /^#[0-9a-fA-F]{6}$/.test(value);
}

function serializeItems(items: AdminContentItem[]) {
  return JSON.stringify(items.map((item, index) => ({ payload: item.payload, position: index })));
}

const fieldClass = "min-h-11 w-full rounded-lg border border-[var(--border-soft)] bg-white px-4 text-sm text-[var(--ocean-deep)] outline-none transition placeholder:text-[rgba(23,49,59,0.38)] focus:border-[var(--sunset)] focus:bg-white";
const pillClass = "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white px-5 text-sm font-bold text-[var(--ocean-deep)] transition hover:bg-[var(--background)]";
const primaryButtonClass = "inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[var(--ocean-deep)] px-5 text-sm font-bold text-white transition hover:bg-[var(--ocean)] disabled:cursor-not-allowed disabled:opacity-60";
const secondaryButtonClass = "inline-flex min-h-10 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] bg-white px-4 text-sm font-bold text-[var(--ocean-deep)] transition hover:bg-[var(--foam)] disabled:cursor-not-allowed disabled:opacity-50";
const iconButtonClass = "grid h-10 w-10 place-items-center rounded-full border border-[var(--border-soft)] bg-white text-[var(--ocean-deep)] transition hover:bg-[var(--foam)] disabled:cursor-not-allowed disabled:opacity-40";

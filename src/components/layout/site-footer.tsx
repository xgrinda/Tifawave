import Link from "next/link";
import { Camera, Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { BrandLogo } from "@/components/layout/brand-logo";
import { navItems, siteContent as fallbackSiteContent } from "@/content/site";
import type { Room, SiteContent, SurfPackage } from "@/content/types";
import { toWhatsAppLink } from "@/lib/utils";

type SiteFooterProps = {
  site?: SiteContent;
  rooms: Room[];
  surfPackages: SurfPackage[];
};

export function SiteFooter({
  site = fallbackSiteContent,
  rooms,
  surfPackages,
}: SiteFooterProps) {
  const whatsappLink = toWhatsAppLink(
    site.whatsapp.e164,
    site.whatsapp.defaultMessage,
  );

  return (
    <footer className="bg-[var(--ocean-deep)] text-white">
      <div className="container-shell grid gap-10 py-14 lg:grid-cols-[1.2fr_0.8fr_0.8fr_1fr]">
        <div>
          <BrandLogo site={site} variant="dark" />
          <p className="mt-6 max-w-sm text-sm leading-7 text-white/72">
            {site.uiText.footerDescription}
          </p>
          <div className="mt-6 flex items-center gap-3">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[var(--ocean-deep)]"
              aria-label="WhatsApp Tifawave"
            >
              <MessageCircle className="h-4 w-4" />
            </a>
            <Link
              href="/gallery"
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[var(--ocean-deep)]"
              aria-label="View Tifawave gallery"
            >
              <Camera className="h-4 w-4" />
            </Link>
            <a
              href={`mailto:${site.email}`}
              className="grid h-11 w-11 place-items-center rounded-full bg-white/10 text-white transition hover:bg-white hover:text-[var(--ocean-deep)]"
              aria-label="Send email to Tifawave"
            >
              <Mail className="h-4 w-4" />
            </a>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--sand)]">
            Explore
          </h3>
          <div className="mt-5 grid gap-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm text-white/74 transition hover:text-white"
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/booking"
              className="text-sm text-white/74 transition hover:text-white"
            >
              Booking
            </Link>
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--sand)]">
            Stay
          </h3>
          <div className="mt-5 grid gap-3">
            {rooms.slice(0, 4).map((room) => (
              <Link
                key={room.id}
                href={`/rooms/${room.slug}`}
                className="text-sm text-white/74 transition hover:text-white"
              >
                {room.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-bold uppercase tracking-[0.18em] text-[var(--sand)]">
            Contact
          </h3>
          <div className="mt-5 grid gap-4 text-sm leading-6 text-white/74">
            <p className="flex gap-3">
              <MapPin className="mt-1 h-4 w-4 shrink-0 text-[var(--sunset)]" />
              <span>
                {site.address.locality}, {site.address.region},{" "}
                {site.address.country}
              </span>
            </p>
            <a
              href={`tel:${site.whatsapp.e164}`}
              className="flex gap-3 transition hover:text-white"
            >
              <Phone className="mt-1 h-4 w-4 shrink-0 text-[var(--sunset)]" />
              <span>{site.whatsapp.display}</span>
            </a>
            <a
              href={`mailto:${site.email}`}
              className="flex gap-3 transition hover:text-white"
            >
              <Mail className="mt-1 h-4 w-4 shrink-0 text-[var(--sunset)]" />
              <span>{site.email}</span>
            </a>
          </div>
          <div className="mt-6 rounded-lg border border-white/10 bg-white/5 p-4">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--sand)]">
              Popular package
            </p>
            <p className="mt-2 text-sm text-white/74">
              {surfPackages.find((item) => item.slug === "surf-camp-package")
                ?.name ?? surfPackages[0]?.name ?? "Surf packages"}
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="container-shell flex flex-col gap-3 pb-24 pt-5 text-xs text-white/56 sm:flex-row sm:items-center sm:justify-between sm:pb-5">
          <p>(c) {new Date().getFullYear()} {site.name}. All rights reserved.</p>
          <p>{site.uiText.footerNote}</p>
        </div>
      </div>
    </footer>
  );
}

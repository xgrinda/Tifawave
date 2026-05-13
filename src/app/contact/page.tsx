import type { Metadata } from "next";
import { Mail, MapPin, Phone } from "lucide-react";
import { BookingInquiryForm } from "@/components/booking/booking-inquiry-form";
import { ButtonLink } from "@/components/ui/button-link";
import {
  getRooms,
  getSiteContent,
  getSurfPackages,
  packageBookingOptionsFromPackages,
  roomBookingOptionsFromRooms,
} from "@/lib/content-store";
import { buildPageMetadata } from "@/lib/seo";
import { toWhatsAppLink } from "@/lib/utils";

export const metadata: Metadata = buildPageMetadata({
  title: "Contact Tifawave for Hostel and Surf Booking Help",
  description:
    "Contact Tifawave Surf Stay Tamraght by WhatsApp, email, or inquiry form for hostel Tamraght stays, surf camp questions, and booking support.",
  path: "/contact",
  keywords: ["hostel Tamraght", "surf camp Tamraght Morocco"],
});

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const [editableSiteContent, rooms, surfPackages] = await Promise.all([
    getSiteContent(),
    getRooms(),
    getSurfPackages(),
  ]);
  const whatsappLink = toWhatsAppLink(
    editableSiteContent.whatsapp.e164,
    editableSiteContent.whatsapp.defaultMessage,
  );

  return (
    <section className="section-pad">
      <div className="container-shell grid gap-10 lg:grid-cols-[0.82fr_1.18fr] lg:items-start">
        <div>
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--terracotta)]">
            Contact
          </p>
          <h1 className="text-balance text-4xl font-black leading-tight text-[var(--ocean-deep)] sm:text-6xl">
            Ask about rooms, surf, transfers, or dates.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            WhatsApp is fastest for same-day questions. Booking inquiries create
            a structured request with everything needed to confirm availability.
          </p>
          <div className="mt-8 grid gap-4">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-4 rounded-lg border border-[var(--border-soft)] bg-white p-5 text-[var(--ocean-deep)] shadow-[0_16px_50px_rgba(18,55,67,0.06)]"
            >
              <Phone className="h-5 w-5 text-[var(--sunset)]" />
              <span className="font-bold">
                {editableSiteContent.whatsapp.display}
              </span>
            </a>
            <a
              href={`mailto:${editableSiteContent.email}`}
              className="flex items-center gap-4 rounded-lg border border-[var(--border-soft)] bg-white p-5 text-[var(--ocean-deep)] shadow-[0_16px_50px_rgba(18,55,67,0.06)]"
            >
              <Mail className="h-5 w-5 text-[var(--sunset)]" />
              <span className="font-bold">{editableSiteContent.email}</span>
            </a>
            <div className="flex items-center gap-4 rounded-lg border border-[var(--border-soft)] bg-white p-5 text-[var(--ocean-deep)] shadow-[0_16px_50px_rgba(18,55,67,0.06)]">
              <MapPin className="h-5 w-5 text-[var(--sunset)]" />
              <span className="font-bold">
                {editableSiteContent.address.line1},{" "}
                {editableSiteContent.address.locality},{" "}
                {editableSiteContent.address.region},{" "}
                {editableSiteContent.address.country}
              </span>
            </div>
          </div>
          <ButtonLink href="/booking" variant="secondary" className="mt-8">
            Open booking page
          </ButtonLink>
          <div className="relative mt-10 min-h-[360px] overflow-hidden rounded-lg bg-[var(--sand)]">
            <iframe
              src={editableSiteContent.googleMapsEmbedUrl}
              title={`${editableSiteContent.name} map`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              className="absolute inset-0 h-full w-full border-0"
            />
          </div>
        </div>
        <BookingInquiryForm
          compact
          roomOptions={roomBookingOptionsFromRooms(rooms)}
          packageOptions={packageBookingOptionsFromPackages(surfPackages)}
          whatsappDisplay={editableSiteContent.whatsapp.display}
        />
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import { BookingInquiryForm } from "@/components/booking/booking-inquiry-form";
import { ResilientImage } from "@/components/ui/resilient-image";
import {
  getRooms,
  getSiteContent,
  getSurfPackages,
  packageBookingOptionsFromPackages,
  roomBookingOptionsFromRooms,
} from "@/lib/content-store";
import { buildPageMetadata } from "@/lib/seo";

export const metadata: Metadata = buildPageMetadata({
  title: "Booking Inquiry for Your Surf Stay in Morocco",
  description:
    "Send a room or surf package inquiry to Tifawave Surf Stay Tamraght. Booking remains direct by email or WhatsApp, with no online payment required.",
  path: "/booking",
  keywords: ["surf stay Morocco", "surf hostel Tamraght"],
});

export const dynamic = "force-dynamic";

type BookingPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function BookingPage({ searchParams }: BookingPageProps) {
  const params = searchParams ? await searchParams : {};
  const [editableSiteContent, rooms, surfPackages] = await Promise.all([
    getSiteContent(),
    getRooms(),
    getSurfPackages(),
  ]);
  const initialRoomType = firstValue(params.room);
  const initialPackageType = firstValue(params.package);
  const initialGuests = firstValue(params.guests);

  return (
    <section className="section-pad">
      <div className="container-shell grid gap-10 lg:grid-cols-[0.86fr_1.14fr] lg:items-start">
        <div className="lg:sticky lg:top-28">
          <p className="mb-4 text-xs font-bold uppercase tracking-[0.24em] text-[var(--terracotta)]">
            Booking
          </p>
          <h1 className="text-balance text-4xl font-black leading-tight text-[var(--ocean-deep)] sm:text-6xl">
            Send a clean inquiry. Confirm by email or WhatsApp.
          </h1>
          <p className="mt-6 text-lg leading-8 text-[var(--muted)]">
            Tifawave is set up for inquiry-first booking while online payments
            are offline. Your request is saved, formatted for email, and ready
            for future Stripe integration.
          </p>
          <div className="relative mt-10 min-h-[420px] overflow-hidden rounded-lg bg-[var(--sand)] shadow-[0_26px_86px_rgba(18,55,67,0.12)]">
            <ResilientImage
              src={editableSiteContent.heroImage.src}
              alt={editableSiteContent.heroImage.alt}
              fill
              priority
              sizes="(min-width: 1024px) 38vw, 100vw"
              className="object-cover"
              fallbackLabel="Booking photo coming soon"
            />
          </div>
        </div>
        <BookingInquiryForm
          initialRoomType={initialRoomType}
          initialPackageType={initialPackageType}
          initialGuests={initialGuests}
          roomOptions={roomBookingOptionsFromRooms(rooms)}
          packageOptions={packageBookingOptionsFromPackages(surfPackages)}
          whatsappDisplay={editableSiteContent.whatsapp.display}
        />
      </div>
    </section>
  );
}

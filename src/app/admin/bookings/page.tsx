import { redirect } from "next/navigation";
import Link from "next/link";
import { BookingsAdmin } from "@/components/admin/bookings-admin";
import { getAdminSession } from "@/lib/admin-auth";
import { listBookingInquiries } from "@/lib/supabase-admin";
import type { StoredBookingInquiry } from "@/lib/booking-schema";

export const metadata = {
  title: "Bookings Admin | Tifawave",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminBookingsPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  let bookings: StoredBookingInquiry[] = [];
  let setupError: string | null = null;

  try {
    bookings = await listBookingInquiries();
  } catch (error) {
    setupError =
      error instanceof Error
        ? error.message
        : "Could not load booking inquiries.";
  }

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[var(--foam)] py-10 sm:py-14">
      <div className="container-shell">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--terracotta)]">
              Admin
            </p>
            <h1 className="mt-3 text-3xl font-black text-[var(--ocean-deep)] sm:text-5xl">
              Booking inquiries
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Signed in as {session.email}. Manage guest inquiries, statuses,
              and follow-up work.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white px-5 text-sm font-bold text-[var(--ocean-deep)]"
            >
              Dashboard
            </Link>
            <Link
              href="/admin/content/settings"
              className="inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white px-5 text-sm font-bold text-[var(--ocean-deep)]"
            >
              Website content
            </Link>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="min-h-11 rounded-full border border-[var(--border-soft)] bg-white px-5 text-sm font-bold text-[var(--ocean-deep)] transition hover:bg-[var(--background)]"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>

        {setupError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-5 text-red-800">
            <p className="font-bold">Supabase setup needed</p>
            <p className="mt-2 text-sm leading-6">{setupError}</p>
            <p className="mt-2 text-sm leading-6">
              Add Supabase environment variables and run the SQL in
              supabase/schema.sql.
            </p>
          </div>
        ) : (
          <BookingsAdmin initialBookings={bookings} />
        )}
      </div>
    </section>
  );
}

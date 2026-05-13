import Link from "next/link";
import { redirect } from "next/navigation";
import {
  BedDouble,
  CalendarDays,
  FilePenLine,
  Inbox,
  LayoutDashboard,
  Package,
  Plus,
} from "lucide-react";
import { bookingStatuses } from "@/lib/booking-schema";
import { getAdminSession } from "@/lib/admin-auth";
import {
  getRooms,
  getSurfPackages,
  listRecentContentUpdates,
} from "@/lib/content-store";
import { listBookingInquiries } from "@/lib/supabase-admin";
import type { StoredBookingInquiry } from "@/lib/booking-schema";

export const metadata = {
  title: "Admin Dashboard | Tifawave",
  robots: {
    index: false,
    follow: false,
  },
};

export default async function AdminDashboardPage() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  let bookings: StoredBookingInquiry[] = [];
  let bookingError: string | null = null;

  try {
    bookings = await listBookingInquiries();
  } catch (error) {
    bookingError =
      error instanceof Error ? error.message : "Could not load bookings.";
  }

  const [rooms, surfPackages, recentUpdates] = await Promise.all([
    getRooms(),
    getSurfPackages(),
    listRecentContentUpdates(5),
  ]);
  const activeRooms = rooms.filter((room) => room.available);
  const activePackages = surfPackages.filter((item) => item.available);
  const recentBookings = bookings.slice(0, 5);

  return (
    <section className="min-h-[calc(100vh-80px)] bg-[var(--foam)] py-10 sm:py-14">
      <div className="container-shell grid gap-8">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-[var(--terracotta)]">
              <LayoutDashboard className="h-4 w-4" />
              Admin dashboard
            </p>
            <h1 className="mt-3 text-3xl font-black text-[var(--ocean-deep)] sm:text-5xl">
              Tifawave operations
            </h1>
            <p className="mt-3 text-sm leading-6 text-[var(--muted)]">
              Signed in as {session.email}. Review guest demand, edit website
              content, and keep the booking pipeline moving.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/bookings" className={pillClass}>
              Bookings
            </Link>
            <Link href="/admin/content/settings" className={pillClass}>
              Website content
            </Link>
            <form action="/api/admin/logout" method="post">
              <button type="submit" className={pillClass}>
                Sign out
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard
            icon={Inbox}
            label="Total inquiries"
            value={String(bookings.length)}
            detail={bookingError ?? "All booking statuses"}
          />
          <MetricCard
            icon={CalendarDays}
            label="New inquiries"
            value={String(
              bookings.filter((booking) => booking.status === "new").length,
            )}
            detail={formatStatusCounts(bookings)}
          />
          <MetricCard
            icon={BedDouble}
            label="Active rooms"
            value={`${activeRooms.length}/${rooms.length}`}
            detail="Published room types"
          />
          <MetricCard
            icon={Package}
            label="Active packages"
            value={`${activePackages.length}/${surfPackages.length}`}
            detail="Published surf offers"
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
          <Panel title="Recent bookings" actionHref="/admin/bookings" actionLabel="Open bookings">
            {bookingError ? (
              <SetupWarning message={bookingError} />
            ) : recentBookings.length === 0 ? (
              <EmptyState text="No booking inquiries yet." />
            ) : (
              <div className="divide-y divide-[var(--border-soft)]">
                {recentBookings.map((booking) => (
                  <div key={booking.id} className="grid gap-2 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <p className="font-black text-[var(--ocean-deep)]">
                        {booking.name}
                      </p>
                      <p className="mt-1 text-sm text-[var(--muted)]">
                        {booking.roomType} - {booking.packageType}
                      </p>
                    </div>
                    <span className="rounded-full bg-[var(--foam)] px-3 py-1 text-xs font-black uppercase tracking-[0.12em] text-[var(--terracotta)]">
                      {booking.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          <Panel title="Quick actions">
            <div className="grid gap-3 sm:grid-cols-2">
              <QuickAction href="/admin/content/rooms" icon={BedDouble} label="Edit rooms" />
              <QuickAction href="/admin/content/packages" icon={Package} label="Edit packages" />
              <QuickAction href="/admin/content/gallery" icon={Plus} label="Upload gallery" />
              <QuickAction href="/admin/content/settings" icon={FilePenLine} label="Site settings" />
            </div>
          </Panel>
        </div>

        <Panel title="Recent content updates" actionHref="/admin/content/settings" actionLabel="Manage CMS">
          {recentUpdates.length === 0 ? (
            <EmptyState text="No CMS updates yet. Publish a content section to begin tracking edits." />
          ) : (
            <div className="divide-y divide-[var(--border-soft)]">
              {recentUpdates.map((item) => (
                <div key={item.id} className="grid gap-1 py-4 sm:grid-cols-[1fr_auto] sm:items-center">
                  <div>
                    <p className="font-black text-[var(--ocean-deep)]">
                      {item.itemKey}
                    </p>
                    <p className="text-sm capitalize text-[var(--muted)]">
                      {item.contentType}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-[var(--muted)]">
                    {new Intl.DateTimeFormat("en", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    }).format(new Date(item.updatedAt))}
                  </p>
                </div>
              ))}
            </div>
          )}
        </Panel>
      </div>
    </section>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: typeof Inbox;
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <article className="rounded-lg border border-[var(--border-soft)] bg-white p-5 premium-shadow">
      <span className="grid h-11 w-11 place-items-center rounded-full bg-[var(--foam)] text-[var(--ocean)]">
        <Icon className="h-5 w-5" />
      </span>
      <p className="mt-4 text-xs font-black uppercase tracking-[0.16em] text-[var(--terracotta)]">
        {label}
      </p>
      <p className="mt-2 text-4xl font-black text-[var(--ocean-deep)]">
        {value}
      </p>
      <p className="mt-2 text-sm text-[var(--muted)]">{detail}</p>
    </article>
  );
}

function Panel({
  title,
  children,
  actionHref,
  actionLabel,
}: {
  title: string;
  children: React.ReactNode;
  actionHref?: string;
  actionLabel?: string;
}) {
  return (
    <section className="rounded-lg border border-[var(--border-soft)] bg-white p-5 premium-shadow">
      <div className="mb-3 flex items-center justify-between gap-4">
        <h2 className="text-xl font-black text-[var(--ocean-deep)]">{title}</h2>
        {actionHref && actionLabel ? (
          <Link href={actionHref} className="text-sm font-bold text-[var(--terracotta)]">
            {actionLabel}
          </Link>
        ) : null}
      </div>
      {children}
    </section>
  );
}

function QuickAction({
  href,
  icon: Icon,
  label,
}: {
  href: string;
  icon: typeof Inbox;
  label: string;
}) {
  return (
    <Link
      href={href}
      className="flex min-h-24 flex-col justify-between rounded-lg border border-[var(--border-soft)] bg-[var(--foam)] p-4 text-[var(--ocean-deep)] transition hover:-translate-y-0.5 hover:bg-white"
    >
      <Icon className="h-5 w-5 text-[var(--sunset)]" />
      <span className="font-black">{label}</span>
    </Link>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <p className="rounded-lg bg-[var(--foam)] p-5 text-center text-sm font-semibold text-[var(--muted)]">
      {text}
    </p>
  );
}

function SetupWarning({ message }: { message: string }) {
  return (
    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
      <p className="font-bold">Setup needed</p>
      <p className="mt-2 leading-6">{message}</p>
    </div>
  );
}

function formatStatusCounts(bookings: StoredBookingInquiry[]) {
  return bookingStatuses
    .map((status) => `${status}: ${bookings.filter((booking) => booking.status === status).length}`)
    .join(" / ");
}

const pillClass =
  "inline-flex min-h-11 items-center justify-center rounded-full border border-[var(--border-soft)] bg-white px-5 text-sm font-bold text-[var(--ocean-deep)] transition hover:bg-[var(--background)]";

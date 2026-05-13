"use client";

import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronUp,
  Mail,
  MessageCircle,
  Trash2,
} from "lucide-react";
import {
  bookingStatuses,
  type BookingStatus,
  type StoredBookingInquiry,
} from "@/lib/booking-schema";
import { cn } from "@/lib/utils";

type BookingsAdminProps = {
  initialBookings: StoredBookingInquiry[];
};

type Notice = {
  type: "success" | "error";
  message: string;
};

export function BookingsAdmin({ initialBookings }: BookingsAdminProps) {
  const [bookings, setBookings] = useState(initialBookings);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [notice, setNotice] = useState<Notice | null>(null);

  const counts = useMemo(() => {
    return bookingStatuses.map((status) => ({
      status,
      count: bookings.filter((booking) => booking.status === status).length,
    }));
  }, [bookings]);

  async function updateStatus(id: string, status: BookingStatus) {
    setBusyId(id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const data = await response.json() as {
        ok: boolean;
        booking?: StoredBookingInquiry;
        message?: string;
      };

      if (!response.ok || !data.ok || !data.booking) {
        throw new Error(data.message ?? "Could not update status.");
      }

      setBookings((current) =>
        current.map((booking) => (booking.id === id ? data.booking! : booking)),
      );
      setNotice({ type: "success", message: "Booking status updated." });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Could not update status.",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function deleteBooking(id: string) {
    const confirmed = window.confirm("Delete this booking inquiry?");

    if (!confirmed) {
      return;
    }

    setBusyId(id);
    setNotice(null);

    try {
      const response = await fetch(`/api/admin/bookings/${id}`, {
        method: "DELETE",
      });
      const data = await response.json() as { ok: boolean; message?: string };

      if (!response.ok || !data.ok) {
        throw new Error(data.message ?? "Could not delete inquiry.");
      }

      setBookings((current) => current.filter((booking) => booking.id !== id));
      setNotice({ type: "success", message: "Booking inquiry deleted." });
    } catch (error) {
      setNotice({
        type: "error",
        message:
          error instanceof Error ? error.message : "Could not delete inquiry.",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="grid gap-6">
      <div className="grid gap-3 sm:grid-cols-4">
        {counts.map((item) => (
          <div
            key={item.status}
            className="rounded-lg border border-[var(--border-soft)] bg-white p-4"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--terracotta)]">
              {item.status}
            </p>
            <p className="mt-2 text-3xl font-black text-[var(--ocean-deep)]">
              {item.count}
            </p>
          </div>
        ))}
      </div>

      {notice ? (
        <p
          className={cn(
            "rounded-lg px-4 py-3 text-sm font-semibold",
            notice.type === "success"
              ? "bg-emerald-50 text-emerald-800"
              : "bg-red-50 text-red-700",
          )}
        >
          {notice.message}
        </p>
      ) : null}

      <div className="overflow-hidden rounded-lg border border-[var(--border-soft)] bg-white premium-shadow">
        {bookings.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-lg font-bold text-[var(--ocean-deep)]">
              No booking inquiries yet.
            </p>
            <p className="mt-2 text-sm text-[var(--muted)]">
              New website inquiries will appear here after Supabase is connected.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[var(--border-soft)]">
            {bookings.map((booking) => {
              const expanded = expandedId === booking.id;

              return (
                <article key={booking.id} className="p-4 sm:p-5">
                  <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr_1fr_160px_120px] lg:items-center">
                    <div>
                      <p className="text-base font-black text-[var(--ocean-deep)]">
                        {booking.name}
                      </p>
                      <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold text-[var(--muted)]">
                        <span className="inline-flex items-center gap-1.5">
                          <Mail className="h-3.5 w-3.5 text-[var(--sunset)]" />
                          {booking.email}
                        </span>
                        <span className="inline-flex items-center gap-1.5">
                          <MessageCircle className="h-3.5 w-3.5 text-[var(--sunset)]" />
                          {booking.whatsapp}
                        </span>
                      </div>
                    </div>

                    <div className="text-sm text-[var(--ocean-deep)]">
                      <p className="flex items-center gap-2 font-bold">
                        <CalendarDays className="h-4 w-4 text-[var(--sunset)]" />
                        {booking.checkIn} to {booking.checkOut}
                      </p>
                      <p className="mt-1 text-[var(--muted)]">
                        {booking.guests} guest{booking.guests === 1 ? "" : "s"}
                      </p>
                    </div>

                    <div className="text-sm">
                      <p className="font-bold text-[var(--ocean-deep)]">
                        {booking.roomType}
                      </p>
                      <p className="mt-1 text-[var(--muted)]">
                        {booking.packageType}
                      </p>
                    </div>

                    <select
                      value={booking.status}
                      disabled={busyId === booking.id}
                      onChange={(event) =>
                        updateStatus(booking.id, event.target.value as BookingStatus)
                      }
                      className="min-h-10 rounded-lg border border-[var(--border-soft)] bg-[var(--foam)] px-3 text-sm font-bold text-[var(--ocean-deep)]"
                    >
                      {bookingStatuses.map((status) => (
                        <option key={status} value={status}>
                          {status}
                        </option>
                      ))}
                    </select>

                    <div className="flex gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedId(expanded ? null : booking.id)
                        }
                        className="inline-flex h-10 items-center justify-center gap-2 rounded-full border border-[var(--border-soft)] px-3 text-sm font-bold text-[var(--ocean-deep)] hover:bg-[var(--foam)]"
                      >
                        {expanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                        Details
                      </button>
                      <button
                        type="button"
                        disabled={busyId === booking.id}
                        onClick={() => deleteBooking(booking.id)}
                        className="grid h-10 w-10 place-items-center rounded-full border border-red-200 text-red-700 transition hover:bg-red-50 disabled:opacity-50"
                        aria-label={`Delete booking inquiry for ${booking.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {expanded ? (
                    <div className="mt-5 rounded-lg bg-[var(--foam)] p-4">
                      <div className="grid gap-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
                        <Detail label="Inquiry ID" value={booking.id} />
                        <Detail label="Created" value={formatDateTime(booking.createdAt)} />
                        <Detail label="Status" value={booking.status} />
                        <Detail label="Source" value={booking.source} />
                      </div>
                      <div className="mt-4">
                        <p className="text-xs font-bold uppercase tracking-[0.16em] text-[var(--terracotta)]">
                          Message
                        </p>
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-7 text-[var(--ocean-deep)]">
                          {booking.message}
                        </p>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--terracotta)]">
        {label}
      </p>
      <p className="mt-1 break-words text-sm font-semibold text-[var(--ocean-deep)]">
        {value}
      </p>
    </div>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

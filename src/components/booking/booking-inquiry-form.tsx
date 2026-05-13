"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { CheckCircle2, Loader2, MessageCircle, Send, X } from "lucide-react";
import { packageBookingOptions } from "@/content/packages";
import { roomBookingOptions } from "@/content/rooms";
import { siteContent } from "@/content/site";
import {
  bookingInquirySchema,
  type BookingInquirySubmission,
  type BookingInquiryResponse,
} from "@/lib/booking-schema";
import { cn, todayIsoDate } from "@/lib/utils";

type BookingInquiryFormProps = {
  initialRoomType?: string;
  initialPackageType?: string;
  initialGuests?: string;
  compact?: boolean;
  roomOptions?: string[];
  packageOptions?: string[];
  whatsappDisplay?: string;
};

type FormState = {
  name: string;
  email: string;
  whatsapp: string;
  checkIn: string;
  checkOut: string;
  guests: string;
  roomType: string;
  packageType: string;
  message: string;
  website: string;
};

type FieldErrors = Partial<Record<keyof FormState, string>>;
type ToastState = {
  type: "success" | "error";
  message: string;
};

const localStorageKey = "tifawave-booking-inquiries";

function selectOption(options: string[], value?: string, fallback?: string) {
  if (value && options.includes(value)) {
    return value;
  }

  return fallback ?? options[0];
}

export function BookingInquiryForm({
  initialRoomType,
  initialPackageType,
  initialGuests,
  compact = false,
  roomOptions = roomBookingOptions,
  packageOptions = packageBookingOptions,
  whatsappDisplay = siteContent.whatsapp.display,
}: BookingInquiryFormProps) {
  const minDate = useMemo(() => todayIsoDate(), []);
  const startedAtRef = useRef<number | null>(null);
  const [form, setForm] = useState<FormState>({
    name: "",
    email: "",
    whatsapp: "",
    checkIn: "",
    checkOut: "",
    guests: initialGuests ?? "2",
    roomType: selectOption(roomOptions, initialRoomType),
    packageType: selectOption(
      packageOptions,
      initialPackageType,
      "Stay Only",
    ),
    message: "",
    website: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<BookingInquiryResponse | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  useEffect(() => {
    startedAtRef.current = Date.now();
  }, []);

  useEffect(() => {
    if (!toast) {
      return;
    }

    const timeout = window.setTimeout(() => setToast(null), 5600);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  function updateField(name: keyof FormState, value: string) {
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: undefined }));
  }

  async function submitInquiry(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setResult(null);

    const parsed = bookingInquirySchema.safeParse({
      ...form,
      guests: Number(form.guests),
      startedAt: startedAtRef.current ?? Date.now(),
    });

    if (!parsed.success) {
      const flattened = parsed.error.flatten().fieldErrors;
      setErrors(
        Object.fromEntries(
          Object.entries(flattened).map(([key, value]) => [
            key,
            value?.[0],
          ]),
        ) as FieldErrors,
      );
      setToast({
        type: "error",
        message: "Please check the highlighted booking fields.",
      });
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/api/booking", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(parsed.data satisfies BookingInquirySubmission),
      });
      const data = (await response.json()) as BookingInquiryResponse;

      if (!response.ok || !data.ok) {
        setResult(data);
        setToast({
          type: "error",
          message:
            data.message ??
            "The inquiry could not be sent. Please try WhatsApp.",
        });
        if (data.errors) {
          setErrors(
            Object.fromEntries(
              Object.entries(data.errors).map(([key, value]) => [
                key,
                value?.[0],
              ]),
            ) as FieldErrors,
          );
        }
        return;
      }

      if (data.inquiry) {
        const existing = JSON.parse(
          window.localStorage.getItem(localStorageKey) ?? "[]",
        ) as unknown[];
        window.localStorage.setItem(
          localStorageKey,
          JSON.stringify([data.inquiry, ...existing].slice(0, 20)),
        );
      }

      setResult(data);
      setToast({
        type: "success",
        message:
          data.message ??
          "Your inquiry was sent. Tifawave will reply soon.",
      });
      setForm((current) => ({
        ...current,
        name: "",
        email: "",
        whatsapp: "",
        message: "",
        website: "",
      }));
      startedAtRef.current = Date.now();
    } catch {
      const errorMessage =
        "The booking form could not connect. WhatsApp is fastest.";
      setResult({
        ok: false,
        message: errorMessage,
      });
      setToast({ type: "error", message: errorMessage });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      {toast ? <BookingToast toast={toast} onClose={() => setToast(null)} /> : null}
      <form
        onSubmit={submitInquiry}
        className={cn(
          "rounded-lg border border-[var(--border-soft)] bg-white p-5 premium-shadow sm:p-7",
          compact && "p-4 sm:p-5",
        )}
      >
      <div className="mb-6">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[var(--terracotta)]">
          Booking inquiry
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[var(--ocean-deep)]">
          Request availability
        </h2>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          No online payment. The team confirms availability and deposit details
          by email or WhatsApp.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {["No payment today", "Email-ready request", "WhatsApp follow-up"].map(
            (item) => (
              <span
                key={item}
                className="inline-flex items-center gap-2 rounded-full bg-[var(--foam)] px-3 py-2 text-xs font-bold text-[var(--ocean-deep)]"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-[var(--sunset)]" />
                {item}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <input
          type="text"
          name="website"
          value={form.website}
          onChange={(event) => updateField("website", event.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />
        <Field label="Name" error={errors.name}>
          <input
            name="name"
            value={form.name}
            autoComplete="name"
            required
            onChange={(event) => updateField("name", event.target.value)}
            className={fieldClass}
            placeholder="Your name"
          />
        </Field>
        <Field label="Email" error={errors.email}>
          <input
            type="email"
            name="email"
            value={form.email}
            autoComplete="email"
            required
            onChange={(event) => updateField("email", event.target.value)}
            className={fieldClass}
            placeholder="you@example.com"
          />
        </Field>
        <Field label="WhatsApp" error={errors.whatsapp}>
          <input
            name="whatsapp"
            value={form.whatsapp}
            autoComplete="tel"
            required
            onChange={(event) => updateField("whatsapp", event.target.value)}
            className={fieldClass}
            placeholder="+44 7000 000000"
          />
        </Field>
        <Field label="Guests" error={errors.guests}>
          <input
            type="number"
            min={1}
            max={16}
            name="guests"
            value={form.guests}
            required
            onChange={(event) => updateField("guests", event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Check-in" error={errors.checkIn}>
          <input
            type="date"
            min={minDate}
            name="checkIn"
            value={form.checkIn}
            required
            onChange={(event) => updateField("checkIn", event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Check-out" error={errors.checkOut}>
          <input
            type="date"
            min={form.checkIn || minDate}
            name="checkOut"
            value={form.checkOut}
            required
            onChange={(event) => updateField("checkOut", event.target.value)}
            className={fieldClass}
          />
        </Field>
        <Field label="Room type" error={errors.roomType}>
          <select
            name="roomType"
            value={form.roomType}
            required
            onChange={(event) => updateField("roomType", event.target.value)}
            className={fieldClass}
          >
            {roomOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Package type" error={errors.packageType}>
          <select
            name="packageType"
            value={form.packageType}
            required
            onChange={(event) =>
              updateField("packageType", event.target.value)
            }
            className={fieldClass}
          >
            {packageOptions.map((option) => (
              <option key={option}>{option}</option>
            ))}
          </select>
        </Field>
        <Field label="Message" error={errors.message} className="sm:col-span-2">
          <textarea
            name="message"
            value={form.message}
            required
            onChange={(event) => updateField("message", event.target.value)}
            className={cn(fieldClass, "min-h-32 resize-y py-3")}
            placeholder="Tell us your dates, surf level, arrival airport, or anything we should know."
          />
        </Field>
      </div>

      {result?.message ? (
        <p
          className={cn(
            "mt-4 rounded-lg px-4 py-3 text-sm font-semibold",
            result.ok
              ? "bg-[var(--foam)] text-[var(--ocean-deep)]"
              : "bg-red-50 text-red-700",
          )}
          role="status"
        >
          {result.message}
        </p>
      ) : null}

      {result?.ok && result.inquiry ? (
        <div className="mt-5 rounded-lg bg-[var(--foam)] p-4">
          <p className="text-sm font-bold text-[var(--ocean-deep)]">
            Inquiry sent: {result.inquiry.id}
          </p>
          <p className="mt-1 text-sm leading-6 text-[var(--muted)]">
            {result.email?.sent
              ? "The booking request has been emailed to Tifawave. We will reply with availability, price, and deposit details."
              : "The booking request has been saved. WhatsApp remains the fastest follow-up while email delivery is optional."}
          </p>
          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            {result.whatsappUrl ? (
              <a
                href={result.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1f9d62] px-4 text-sm font-bold text-white transition hover:bg-[#168451]"
              >
                <MessageCircle className="h-4 w-4" />
                Confirm on WhatsApp
              </a>
            ) : null}
          </div>
        </div>
      ) : null}

      {!result?.ok && result?.whatsappUrl ? (
        <div className="mt-5 rounded-lg bg-red-50 p-4">
          <p className="text-sm font-bold text-red-800">
            Email sending needs attention.
          </p>
          <p className="mt-1 text-sm leading-6 text-red-700">
            Your inquiry was not emailed. You can still send the same details by
            WhatsApp.
          </p>
          <a
            href={result.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-4 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-[#1f9d62] px-4 text-sm font-bold text-white transition hover:bg-[#168451]"
          >
            <MessageCircle className="h-4 w-4" />
            Send on WhatsApp
          </a>
        </div>
      ) : null}

      <button
        type="submit"
        disabled={submitting}
        className="mt-6 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-[var(--ocean-deep)] px-6 text-sm font-bold text-white shadow-[0_18px_50px_rgba(18,55,67,0.24)] transition hover:bg-[var(--ocean)] disabled:cursor-not-allowed disabled:opacity-70"
      >
        {submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Send className="h-4 w-4" />
        )}
        Send inquiry
      </button>

      <p className="mt-4 text-center text-xs leading-5 text-[var(--muted)]">
        Prefer a direct message? WhatsApp {whatsappDisplay}.
      </p>
      </form>
    </>
  );
}

function BookingToast({
  toast,
  onClose,
}: {
  toast: ToastState;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed right-4 top-24 z-[70] flex max-w-[calc(100vw-2rem)] items-start gap-3 rounded-lg border bg-white p-4 text-sm shadow-[0_18px_60px_rgba(18,55,67,0.18)] sm:max-w-sm",
        toast.type === "success"
          ? "border-emerald-200 text-[var(--ocean-deep)]"
          : "border-red-200 text-red-800",
      )}
      role="status"
      aria-live="polite"
    >
      <span
        className={cn(
          "mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full",
          toast.type === "success"
            ? "bg-emerald-100 text-emerald-700"
            : "bg-red-100 text-red-700",
        )}
      >
        <CheckCircle2 className="h-4 w-4" />
      </span>
      <p className="leading-6">{toast.message}</p>
      <button
        type="button"
        onClick={onClose}
        className="ml-1 grid h-7 w-7 shrink-0 place-items-center rounded-full text-current/60 transition hover:bg-black/5 hover:text-current"
        aria-label="Close notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("grid gap-2", className)}>
      <span className="text-sm font-bold text-[var(--ocean-deep)]">{label}</span>
      {children}
      {error ? <span className="text-xs font-semibold text-red-700">{error}</span> : null}
    </label>
  );
}

const fieldClass =
  "min-h-12 w-full rounded-lg border border-[rgba(23,49,59,0.14)] bg-[var(--foam)] px-4 text-sm outline-none transition placeholder:text-[rgba(23,49,59,0.38)] focus:border-[var(--sunset)] focus:bg-white";

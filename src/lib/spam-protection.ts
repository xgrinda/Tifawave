import type { BookingInquirySubmission } from "@/lib/booking-schema";

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type SpamCheckResult =
  | { ok: true }
  | {
      ok: false;
      status: number;
      message: string;
    };

const RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;
const RATE_LIMIT_MAX = 5;
const MIN_FORM_TIME_MS = 2500;
const MAX_LINKS_IN_MESSAGE = 2;

const rateLimitStore = new Map<string, RateLimitEntry>();

export function getClientIp(request: Request) {
  const forwardedFor = request.headers.get("x-forwarded-for");

  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() ?? "unknown";
  }

  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("cf-connecting-ip") ??
    "unknown"
  );
}

export function checkBookingSpam({
  submission,
  ip,
}: {
  submission: BookingInquirySubmission;
  ip: string;
}): SpamCheckResult {
  if (submission.website) {
    return {
      ok: false,
      status: 400,
      message: "Your inquiry could not be submitted.",
    };
  }

  if (Date.now() - submission.startedAt < MIN_FORM_TIME_MS) {
    return {
      ok: false,
      status: 429,
      message: "Please wait a moment before sending the inquiry.",
    };
  }

  if (countLinks(submission.message) > MAX_LINKS_IN_MESSAGE) {
    return {
      ok: false,
      status: 422,
      message: "Please remove extra links from the message.",
    };
  }

  return checkRateLimit(ip);
}

function checkRateLimit(ip: string): SpamCheckResult {
  const now = Date.now();
  const existing = rateLimitStore.get(ip);

  if (!existing || existing.resetAt < now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return { ok: true };
  }

  if (existing.count >= RATE_LIMIT_MAX) {
    return {
      ok: false,
      status: 429,
      message: "Too many booking inquiries. Please try again later or use WhatsApp.",
    };
  }

  existing.count += 1;
  rateLimitStore.set(ip, existing);
  return { ok: true };
}

function countLinks(value = "") {
  return (value.match(/https?:\/\/|www\./gi) ?? []).length;
}

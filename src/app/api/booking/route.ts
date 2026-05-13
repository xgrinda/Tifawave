import { NextResponse } from "next/server";
import { buildInquiryWhatsApp, saveInquiry } from "@/lib/inquiry-store";
import { sendBookingEmail } from "@/lib/email-service";
import {
  flattenBookingErrors,
  toPublicInquiry,
  validateBookingInquiry,
} from "@/lib/booking-validation";
import { checkBookingSpam, getClientIp } from "@/lib/spam-protection";
import { createBookingInquiry } from "@/lib/supabase-admin";
import type { StoredBookingInquiry } from "@/lib/booking-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    let payload: unknown;

    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid request body.",
        },
        { status: 400 },
      );
    }

    const parsed = validateBookingInquiry(payload);

    if (!parsed.success) {
      return NextResponse.json(
        {
          ok: false,
          errors: flattenBookingErrors(parsed),
          message: "Please check the highlighted fields.",
        },
        { status: 422 },
      );
    }

    const spamCheck = checkBookingSpam({
      submission: parsed.data,
      ip: getClientIp(request),
    });

    if (!spamCheck.ok) {
      return NextResponse.json(
        {
          ok: false,
          message: spamCheck.message,
        },
        { status: spamCheck.status },
      );
    }

    const inquiry: StoredBookingInquiry = {
      ...toPublicInquiry(parsed.data),
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      status: "new" as const,
      source: "website" as const,
    };

    let savedInquiry = inquiry;

    try {
      savedInquiry = await createBookingInquiry(inquiry);
    } catch (error) {
      console.error("Supabase booking save failed", error);
      return NextResponse.json(
        {
          ok: false,
          message:
            "We could not save the inquiry. Please try again or use WhatsApp.",
          whatsappUrl: buildInquiryWhatsApp(inquiry),
        },
        { status: 503 },
      );
    }

    const email = await sendBookingEmail(savedInquiry);

    if (!email.sent) {
      console.warn("Booking email was not sent", email.message);
    }

    await saveInquiry(savedInquiry);

    return NextResponse.json({
      ok: true,
      inquiry: savedInquiry,
      email,
      whatsappUrl: buildInquiryWhatsApp(savedInquiry),
      message: email.sent
        ? "Your inquiry was saved and emailed. Tifawave will reply by email or WhatsApp."
        : "Your inquiry was saved. Email is not configured yet, so WhatsApp is the fastest follow-up.",
    });
  } catch (error) {
    console.error("Booking inquiry route failed", error);
    return NextResponse.json(
      {
        ok: false,
        message: "We could not submit the inquiry. Please try WhatsApp.",
      },
      { status: 500 },
    );
  }
}

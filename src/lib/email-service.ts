import type { StoredBookingInquiry } from "@/lib/booking-schema";

type BookingEmail = {
  to: string;
  from: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
};

type EmailDeliveryResult =
  | { sent: true; provider: "resend"; id: string }
  | {
      sent: false;
      provider: "resend";
      status: number;
      message: string;
    };

export function buildBookingEmail(inquiry: StoredBookingInquiry): BookingEmail {
  const to = cleanEnvEmailValue(process.env.BOOKING_RECIPIENT_EMAIL);
  const from = cleanEnvEmailValue(process.env.BOOKING_EMAIL_FROM);
  const subject = `Booking inquiry: ${inquiry.name} for ${inquiry.checkIn}`;
  const text = [
    "New Tifawave booking inquiry",
    "",
    `Inquiry ID: ${inquiry.id}`,
    `Created: ${inquiry.createdAt}`,
    "",
    `Name: ${inquiry.name}`,
    `Email: ${inquiry.email}`,
    `WhatsApp: ${inquiry.whatsapp}`,
    `Check-in: ${inquiry.checkIn}`,
    `Check-out: ${inquiry.checkOut}`,
    `Guests: ${inquiry.guests}`,
    `Room type: ${inquiry.roomType}`,
    `Package type: ${inquiry.packageType}`,
    "",
    "Message:",
    inquiry.message || "No message provided.",
  ].join("\n");

  if (!to) {
    throw new Error("Missing BOOKING_RECIPIENT_EMAIL environment variable.");
  }

  if (!from) {
    throw new Error("Missing BOOKING_EMAIL_FROM environment variable.");
  }

  return {
    to,
    from,
    replyTo: inquiry.email,
    subject,
    text,
    html: renderBookingEmailHtml(inquiry),
  };
}

export async function sendBookingEmail(
  inquiry: StoredBookingInquiry,
): Promise<EmailDeliveryResult> {
  const apiKey = process.env.RESEND_API_KEY;

  // Place the Resend API key in `.env.local` for local development and in
  // Vercel Project Settings > Environment Variables for production:
  // RESEND_API_KEY=re_xxxxxxxxx
  // Place the receiving email in the same environment settings:
  // BOOKING_RECIPIENT_EMAIL=hello@tifawave.com
  if (!apiKey) {
    return {
      sent: false,
      provider: "resend",
      status: 503,
      message: "Email service is not configured.",
    };
  }

  let email: BookingEmail;

  try {
    email = buildBookingEmail(inquiry);
  } catch (error) {
    return {
      sent: false,
      provider: "resend",
      status: 503,
      message:
        error instanceof Error ? error.message : "Email service is not configured.",
    };
  }

  // This site uses Resend's HTTP API to stay lightweight on Vercel.
  // If you switch to Nodemailer later, place SMTP credentials in env vars such
  // as SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM. Do not
  // commit real SMTP credentials to the repository.
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": inquiry.id,
    },
    body: JSON.stringify({
      from: email.from,
      to: [email.to],
      reply_to: email.replyTo,
      subject: email.subject,
      text: email.text,
      html: email.html,
      tags: [
        { name: "source", value: "website" },
        { name: "type", value: "booking_inquiry" },
      ],
    }),
  });

  const responseBody = await response.json().catch(() => null) as
    | { id?: string; message?: string; error?: string }
    | null;

  if (!response.ok || !responseBody?.id) {
    console.error("Booking email failed", response.status, responseBody);
    return {
      sent: false,
      provider: "resend",
      status: response.status,
      message:
        responseBody?.message ??
        responseBody?.error ??
        "Email delivery failed. Please try again or use WhatsApp.",
    };
  }

  return {
    sent: true,
    provider: "resend",
    id: responseBody.id,
  };
}

function renderBookingEmailHtml(inquiry: StoredBookingInquiry) {
  const rows = [
    ["Inquiry ID", inquiry.id],
    ["Created", inquiry.createdAt],
    ["Name", inquiry.name],
    ["Email", inquiry.email],
    ["WhatsApp", inquiry.whatsapp],
    ["Check-in", inquiry.checkIn],
    ["Check-out", inquiry.checkOut],
    ["Guests", String(inquiry.guests)],
    ["Room type", inquiry.roomType],
    ["Package type", inquiry.packageType],
  ];

  const tableRows = rows
    .map(
      ([label, value]) => `
        <tr>
          <td style="padding:10px 12px;border-bottom:1px solid #e6eee9;color:#6e7d7b;font-weight:700;">${escapeHtml(label)}</td>
          <td style="padding:10px 12px;border-bottom:1px solid #e6eee9;color:#123743;">${escapeHtml(value)}</td>
        </tr>
      `,
    )
    .join("");

  return `
    <div style="font-family:Inter,Arial,sans-serif;background:#f8f3ea;padding:28px;">
      <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #dce6df;border-radius:14px;overflow:hidden;">
        <div style="background:#123743;color:#ffffff;padding:24px;">
          <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.18em;text-transform:uppercase;color:#e8d8bd;">Tifawave Surf Stay</p>
          <h1 style="margin:0;font-size:24px;line-height:1.25;">New booking inquiry</h1>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;">
          ${tableRows}
        </table>
        <div style="padding:20px 24px;">
          <p style="margin:0 0 8px;color:#6e7d7b;font-weight:700;">Message</p>
          <p style="margin:0;color:#123743;line-height:1.7;">${escapeHtml(
            inquiry.message || "No message provided.",
          ).replace(/\n/g, "<br />")}</p>
        </div>
      </div>
    </div>
  `;
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function cleanEnvEmailValue(value?: string) {
  const trimmed = value?.trim();

  if (!trimmed) {
    return "";
  }

  const startsWithDoubleQuote = trimmed.startsWith('"') && trimmed.endsWith('"');
  const startsWithSingleQuote = trimmed.startsWith("'") && trimmed.endsWith("'");

  if (startsWithDoubleQuote || startsWithSingleQuote) {
    return trimmed.slice(1, -1).trim();
  }

  return trimmed;
}

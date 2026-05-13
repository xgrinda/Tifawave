import { promises as fs } from "fs";
import path from "path";
import { siteContent } from "@/content/site";
import type { StoredBookingInquiry } from "@/lib/booking-schema";
import { toWhatsAppLink } from "@/lib/utils";

function inquiryStorePath() {
  if (process.env.BOOKING_STORE_PATH) {
    return process.env.BOOKING_STORE_PATH;
  }

  if (process.env.VERCEL) {
    return "/tmp/tifawave-booking-inquiries.jsonl";
  }

  return path.join(process.cwd(), ".data", "booking-inquiries.jsonl");
}

export async function saveInquiry(inquiry: StoredBookingInquiry) {
  const filePath = inquiryStorePath();

  try {
    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.appendFile(filePath, `${JSON.stringify(inquiry)}\n`, "utf8");
    return { saved: true, path: filePath };
  } catch (error) {
    console.error("Could not persist booking inquiry", error);
    return { saved: false, path: filePath };
  }
}

export function buildInquiryWhatsApp(inquiry: StoredBookingInquiry) {
  const message = [
    `Hi Tifawave, I sent a booking inquiry (${inquiry.id}).`,
    `Name: ${inquiry.name}`,
    `Dates: ${inquiry.checkIn} to ${inquiry.checkOut}`,
    `Guests: ${inquiry.guests}`,
    `Room: ${inquiry.roomType}`,
    `Package: ${inquiry.packageType}`,
  ].join("\n");

  return toWhatsAppLink(siteContent.whatsapp.e164, message);
}

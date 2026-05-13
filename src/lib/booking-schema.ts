import { z } from "zod";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Use a valid date.");

export const bookingInquirySchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name.").max(100),
    email: z.email("Enter a valid email address."),
    whatsapp: z.string().trim().min(6, "Enter your WhatsApp number.").max(40),
    checkIn: isoDate,
    checkOut: isoDate,
    guests: z.coerce.number().int().min(1).max(16),
    roomType: z.string().trim().min(2, "Choose a room type."),
    packageType: z.string().trim().min(2, "Choose a package type."),
    message: z
      .string()
      .trim()
      .min(2, "Add a short message about your trip.")
      .max(1200),
    website: z.string().trim().max(200).optional().default(""),
    startedAt: z.coerce.number().int().positive(),
  })
  .refine((data) => new Date(data.checkOut) > new Date(data.checkIn), {
    message: "Check-out must be after check-in.",
    path: ["checkOut"],
  });

export type BookingInquirySubmission = z.infer<typeof bookingInquirySchema>;

export type BookingInquiry = Omit<
  BookingInquirySubmission,
  "website" | "startedAt"
>;

export type BookingInquiryResponse = {
  ok: boolean;
  inquiry?: StoredBookingInquiry;
  email?: {
    id?: string;
    provider: "resend";
    sent: boolean;
    status?: number;
    message?: string;
  };
  whatsappUrl?: string;
  errors?: Record<string, string[] | undefined>;
  message?: string;
};

export const bookingStatuses = [
  "new",
  "contacted",
  "confirmed",
  "cancelled",
] as const;

export const bookingStatusSchema = z.enum(bookingStatuses);

export type BookingStatus = (typeof bookingStatuses)[number];

export type StoredBookingInquiry = BookingInquiry & {
  id: string;
  createdAt: string;
  status: BookingStatus;
  source: "website";
};

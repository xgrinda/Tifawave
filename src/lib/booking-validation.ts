import { bookingInquirySchema, type BookingInquirySubmission } from "@/lib/booking-schema";

export function validateBookingInquiry(payload: unknown) {
  return bookingInquirySchema.safeParse(payload);
}

export function toPublicInquiry(
  submission: BookingInquirySubmission,
) {
  return {
    name: submission.name,
    email: submission.email,
    whatsapp: submission.whatsapp,
    checkIn: submission.checkIn,
    checkOut: submission.checkOut,
    guests: submission.guests,
    roomType: submission.roomType,
    packageType: submission.packageType,
    message: submission.message,
  };
}

export function flattenBookingErrors(
  result: ReturnType<typeof bookingInquirySchema.safeParse>,
) {
  if (result.success) {
    return {};
  }

  return result.error.flatten().fieldErrors;
}

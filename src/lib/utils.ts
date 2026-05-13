import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function toWhatsAppLink(phoneE164: string, message: string) {
  const phone = phoneE164.replace(/\D/g, "");
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function bookingHref(params: {
  room?: string;
  packageType?: string;
  guests?: number;
}) {
  const search = new URLSearchParams();

  if (params.room) {
    search.set("room", params.room);
  }

  if (params.packageType) {
    search.set("package", params.packageType);
  }

  if (params.guests) {
    search.set("guests", String(params.guests));
  }

  const query = search.toString();
  return query ? `/booking?${query}` : "/booking";
}

export function todayIsoDate() {
  const date = new Date();
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

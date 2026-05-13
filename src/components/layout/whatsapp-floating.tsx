import { MessageCircle } from "lucide-react";
import { siteContent as fallbackSiteContent } from "@/content/site";
import type { SiteContent } from "@/content/types";
import { toWhatsAppLink } from "@/lib/utils";

type WhatsAppFloatingProps = {
  site?: SiteContent;
};

export function WhatsAppFloating({
  site = fallbackSiteContent,
}: WhatsAppFloatingProps) {
  const href = toWhatsAppLink(
    site.whatsapp.e164,
    site.whatsapp.defaultMessage,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      aria-label="Contact Tifawave on WhatsApp"
      className="fixed bottom-[calc(0.75rem+env(safe-area-inset-bottom))] right-3 z-50 inline-flex h-12 w-12 items-center justify-center gap-2 rounded-full bg-[#1f9d62] text-sm font-bold text-white shadow-[0_18px_48px_rgba(31,157,98,0.32)] ring-1 ring-white/35 transition hover:-translate-y-0.5 hover:bg-[#168451] sm:bottom-5 sm:right-5 sm:h-14 sm:w-auto sm:px-5"
    >
      <MessageCircle className="h-5 w-5" />
      <span className="hidden sm:inline">WhatsApp</span>
    </a>
  );
}

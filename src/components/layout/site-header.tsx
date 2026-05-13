"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, MessageCircle, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { BrandLogo } from "@/components/layout/brand-logo";
import { navItems, siteContent as fallbackSiteContent } from "@/content/site";
import type { SiteContent } from "@/content/types";
import { cn, toWhatsAppLink } from "@/lib/utils";
import { ButtonLink } from "@/components/ui/button-link";

type SiteHeaderProps = {
  site?: SiteContent;
};

export function SiteHeader({ site = fallbackSiteContent }: SiteHeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const whatsappLink = toWhatsAppLink(
    site.whatsapp.e164,
    site.whatsapp.defaultMessage,
  );

  return (
    <header className="sticky top-0 z-50 border-b border-white/50 bg-[rgba(248,243,234,0.82)] backdrop-blur-xl">
      <div className="container-shell flex h-20 items-center justify-between gap-6">
        <BrandLogo site={site} />

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {navItems.map((item) => {
            const active =
              pathname === item.href || pathname.startsWith(`${item.href}/`);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "rounded-full px-4 py-2 text-sm font-semibold text-[var(--ocean-deep)] transition hover:bg-white/70",
                  active && "bg-white text-[var(--terracotta)] shadow-sm",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <a
            href={`tel:${site.whatsapp.e164}`}
            className="text-sm font-semibold text-[var(--ocean-deep)] hover:text-[var(--terracotta)]"
          >
            {site.whatsapp.display}
          </a>
          <ButtonLink href="/booking" variant="secondary" className="min-w-32">
            Book stay
          </ButtonLink>
        </div>

        <button
          type="button"
          className="grid h-11 w-11 place-items-center rounded-full border border-[rgba(23,49,59,0.14)] bg-white/75 text-[var(--ocean-deep)] lg:hidden"
          aria-label={open ? "Close navigation" : "Open navigation"}
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
        >
          {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.22 }}
            className="border-t border-[rgba(23,49,59,0.1)] bg-[var(--background)] px-4 pb-5 pt-3 shadow-2xl shadow-[rgba(18,55,67,0.08)] lg:hidden"
          >
            <nav className="container-shell grid gap-2" aria-label="Mobile">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-3 text-base font-semibold text-[var(--ocean-deep)] hover:bg-white"
                >
                  {item.label}
                </Link>
              ))}
              <div className="mt-2 grid grid-cols-2 gap-3">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-[rgba(23,49,59,0.16)] bg-white/80 px-4 text-sm font-bold text-[var(--ocean-deep)]"
                >
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </a>
                <ButtonLink
                  href="/booking"
                  variant="secondary"
                  showArrow={false}
                  className="w-full"
                >
                  Book stay
                </ButtonLink>
              </div>
            </nav>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}

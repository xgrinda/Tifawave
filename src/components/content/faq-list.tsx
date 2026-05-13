import { ArrowRight } from "lucide-react";
import type { Faq } from "@/content/types";

type FaqListProps = {
  items: Faq[];
};

export function FaqList({ items }: FaqListProps) {
  return (
    <div className="grid gap-3">
      {items.map((faq) => (
        <details
          key={faq.id}
          className="group rounded-lg border border-[var(--border-soft)] bg-white p-5 shadow-[0_14px_46px_rgba(18,55,67,0.05)]"
        >
          <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-base font-bold text-[var(--ocean-deep)]">
            {faq.question}
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[var(--foam)] text-[var(--ocean)] transition group-open:rotate-90">
              <ArrowRight className="h-4 w-4" />
            </span>
          </summary>
          <p className="mt-4 text-sm leading-7 text-[var(--muted)]">
            {faq.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowUpRight } from "lucide-react";
import { cn } from "@/lib/utils";

type ButtonLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  variant?: "primary" | "secondary" | "outline" | "ghost";
  showArrow?: boolean;
  target?: string;
};

const variants = {
  primary:
    "bg-[var(--ocean-deep)] text-white shadow-[0_18px_50px_rgba(18,55,67,0.22)] hover:bg-[var(--ocean)]",
  secondary:
    "bg-[var(--sunset)] text-white shadow-[0_18px_50px_rgba(244,122,69,0.28)] hover:bg-[var(--terracotta)]",
  outline:
    "border border-[var(--border-soft)] bg-white/78 text-[var(--ocean-deep)] backdrop-blur hover:bg-white",
  ghost: "text-[var(--ocean-deep)] hover:bg-white/60",
};

export function ButtonLink({
  href,
  children,
  className,
  variant = "primary",
  showArrow = true,
  target,
}: ButtonLinkProps) {
  const classes = cn(
    "inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 text-sm font-semibold transition duration-300",
    variants[variant],
    className,
  );

  const content = (
    <>
      <span>{children}</span>
      {showArrow ? <ArrowUpRight className="h-4 w-4" aria-hidden="true" /> : null}
    </>
  );

  if (href.startsWith("http") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={classes} target={target} rel="noreferrer">
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {content}
    </Link>
  );
}

import Link from "next/link";
import clsx from "clsx";
import { ReactNode } from "react";

export default function Button({
  href,
  children,
  variant = "primary",
  className,
  cta,
}: {
  href: string;
  /** Name for the cta_click event (analytics), e.g. "shows_hero_book". Omit for plain links. */
  cta?: string;
  children: ReactNode;
  variant?: "primary" | "ghost";
  className?: string;
}) {
  const base =
    "inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-medium transition-all duration-300";
  const styles =
    variant === "primary"
      ? "bg-amber text-navy hover:bg-amber-soft hover:shadow-[0_0_30px_rgba(224,162,48,0.35)]"
      : "border border-line text-ink hover:border-cyan-soft hover:text-cyan-soft";

  return (
    <Link href={href} className={clsx(base, styles, className)} {...(cta ? { "data-track": "cta", "data-cta": cta } : {})}>
      {children}
    </Link>
  );
}

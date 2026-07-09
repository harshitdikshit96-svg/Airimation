"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navLinks, contactInfo, site } from "@/lib/content";

export default function Footer() {
  const pathname = usePathname();
  const isInternal = pathname?.startsWith("/internal") ?? false;

  return (
    <footer
      className={clsx(
        "relative z-10 border-t",
        isInternal ? "border-int-line bg-int-bg-2" : "border-line-2 bg-navy-2"
      )}
    >
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <span
              className={clsx(
                "font-serif text-lg font-semibold",
                isInternal ? "text-int-ink" : "text-ink"
              )}
            >
              Air<span className={isInternal ? "text-int-pink" : "text-amber-soft"}>mation</span>
            </span>
            <p className={clsx("mt-3 max-w-xs text-sm", isInternal ? "text-int-muted" : "text-muted")}>
              {isInternal
                ? "The internal learning game — the business, the tech, and the roadmap, gamified."
                : `Drone-swarm light shows, designed and performed under our flagship, Biscope. Based in ${contactInfo.base}.`}
            </p>
            {!isInternal && (
              <p className="mt-2 max-w-xs text-xs text-dim">
                Airimation is a brand of {site.legalName}.
              </p>
            )}
          </div>

          <div>
            <div
              className={clsx(
                "font-mono text-xs uppercase tracking-[0.2em]",
                isInternal ? "text-int-dim" : "text-dim"
              )}
            >
              {isInternal ? "Academy" : "Site"}
            </div>
            <ul className="mt-4 space-y-2">
              {(isInternal
                ? [
                    { href: "/internal", label: "Chapters" },
                    { href: "/internal/quiz", label: "Take the Quiz" },
                    { href: "/", label: "Main site" },
                  ]
                : navLinks
              ).map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className={clsx(
                      "text-sm transition-colors",
                      isInternal
                        ? "text-int-muted hover:text-int-ink"
                        : "text-muted hover:text-ink"
                    )}
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div
              className={clsx(
                "font-mono text-xs uppercase tracking-[0.2em]",
                isInternal ? "text-int-dim" : "text-dim"
              )}
            >
              Reach us
            </div>
            <ul
              className={clsx(
                "mt-4 space-y-2 text-sm",
                isInternal ? "text-int-muted" : "text-muted"
              )}
            >
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className={clsx(
                    "transition-colors",
                    isInternal ? "hover:text-int-ink" : "hover:text-ink"
                  )}
                >
                  {contactInfo.email}
                </a>
              </li>
              <li>{contactInfo.base}</li>
            </ul>
          </div>
        </div>

        <div
          className={clsx(
            "mt-12 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between",
            isInternal ? "border-int-line text-int-dim" : "border-line-2 text-dim"
          )}
        >
          <span>© {new Date().getFullYear()} {site.legalName}. All rights reserved.</span>
          <span>
            {isInternal
              ? "Internal use only — not for external distribution."
              : "Show visuals are concept renders — Biscope's first shows are in preparation."}
          </span>
        </div>
      </div>
    </footer>
  );
}

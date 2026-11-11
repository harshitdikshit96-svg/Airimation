"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import clsx from "clsx";
import { navLinks, contactInfo, credentials, company, site } from "@/lib/content";

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
            {/* eslint-disable-next-line @next/next/no-img-element -- static SVG, cached */}
            <img
              src={isInternal ? "/brand/airimation-mark-black.svg" : "/brand/airimation-mark-white.svg"}
              alt=""
              width={44}
              height={51}
              className="mb-4 h-[51px] w-auto"
            />
            <span
              className={clsx(
                "font-serif text-lg font-semibold",
                isInternal ? "text-int-ink" : "text-ink"
              )}
            >
              Air<span className={isInternal ? "text-int-pink" : "text-amber-soft"}>imation</span>
            </span>
            <p className={clsx("mt-3 max-w-xs text-sm", isInternal ? "text-int-muted" : "text-muted")}>
              {isInternal
                ? "The internal learning game — the business, the tech, and the roadmap, gamified."
                : `Drone-swarm light shows, designed, built and flown in India. Based in ${contactInfo.base}.`}
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
            {/* Two columns: one long column made the footer needlessly tall. */}
            <ul className="mt-2 grid grid-cols-2 gap-x-6">
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
                      // inline-flex + min height so the link is a real touch
                      // target on a phone, not an 18px sliver of text.
                      "inline-flex min-h-9 items-center text-sm transition-colors",
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
                    "inline-flex min-h-9 items-center transition-colors",
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

        {/* Statutory credentials, as plain text.
            No Startup India / MSME / emblem badges — see the note on
            `company` in content.ts for why. */}
        {!isInternal && (
          <div className="mt-12 border-t border-line-2 pt-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-4 sm:flex sm:flex-wrap sm:gap-x-8 sm:gap-y-3">
              {credentials.map((item) => (
                <div key={item.label}>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                    {item.label}
                  </dt>
                  <dd className="mt-1 font-mono text-xs text-muted">{item.value}</dd>
                </div>
              ))}
            </dl>
            <p className="mt-4 max-w-2xl text-xs leading-relaxed text-dim">
              {company.legalName} · Incorporated under the Companies Act,
              2013 · Registered in {company.registeredOfficeShort}
            </p>
          </div>
        )}

        <div
          className={clsx(
            "mt-8 flex flex-col gap-3 border-t pt-6 text-xs sm:flex-row sm:items-center sm:justify-between",
            isInternal ? "border-int-line text-int-dim" : "border-line-2 text-dim"
          )}
        >
          <span>© {new Date().getFullYear()} {company.legalName}. All rights reserved.</span>
          <span>
            {isInternal
              ? "Internal use only — not for external distribution."
              : "Show visuals are concept renders — our first shows are in preparation."}
          </span>
        </div>

        <div
          className={clsx(
            "mt-4 text-center text-xs",
            isInternal ? "text-int-dim" : "text-dim"
          )}
        >
          Designed &amp; Developed by{" "}
          <a
            href="https://www.harshitcreates.in"
            target="_blank"
            rel="noopener noreferrer"
            className={clsx(
              "underline transition-colors",
              isInternal ? "hover:text-int-ink" : "hover:text-ink"
            )}
          >
            harshitcreates.in
          </a>
        </div>
      </div>
    </footer>
  );
}

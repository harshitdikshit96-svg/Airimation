"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { navLinks } from "@/lib/content";

/**
 * The nav is hidden by default so every page opens on a clean, full-bleed
 * hero — nothing but the swarm and the headline, no bar competing for
 * attention. On desktop, moving the pointer to the far-left edge of the
 * screen slides a nav panel in from the left; it hides again a moment after
 * the pointer leaves. Touch devices (no hover) get a small persistent tab at
 * the same edge to tap instead, since they can't trigger a hover zone.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  function show() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function scheduleHide() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 400);
  }

  return (
    <>
      {/* Invisible hover hotzone along the left edge — desktop only. */}
      <div
        onMouseEnter={show}
        className="fixed inset-y-0 left-0 z-40 hidden w-5 md:block"
        aria-hidden="true"
      />

      {/* Persistent tap tab for touch devices, which have no hover state. */}
      <button
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="fixed left-0 top-1/2 z-50 -translate-y-1/2 rounded-r-md border border-l-0 border-line-2 bg-navy/85 px-1.5 py-3 text-dim backdrop-blur-sm transition-colors hover:text-ink md:hidden"
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      <aside
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col justify-between border-r border-line-2 bg-navy/95 px-8 py-10 backdrop-blur-md transition-transform duration-300 ease-out",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <span className="font-serif text-lg font-semibold tracking-tight text-ink">
              Air<span className="text-amber-soft">mation</span>
            </span>
          </Link>

          <nav className="mt-14 flex flex-col gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "font-mono text-xs uppercase tracking-[0.16em] transition-colors",
                  pathname === link.href
                    ? "text-amber-soft"
                    : "text-muted hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <Link
          href="/contact"
          onClick={() => setOpen(false)}
          className="inline-flex w-fit rounded-full bg-amber px-5 py-2 font-mono text-xs uppercase tracking-[0.16em] text-navy transition-all hover:bg-amber-soft"
        >
          Book a Show
        </Link>
      </aside>
    </>
  );
}

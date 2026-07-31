"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { navLinks } from "@/lib/content";

const PANEL_ID = "mobile-nav-panel";
const MOBILE_QUERY = "(max-width: 767px)";
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * The nav is hidden by default so every page opens on a clean, full-bleed
 * hero — nothing but the swarm and the headline, no bar competing for
 * attention. On desktop, moving the pointer to the far-left edge of the
 * screen slides a nav panel in from the left; it hides again a moment after
 * the pointer leaves. Touch devices (no hover) get a small persistent tab at
 * the same edge to tap instead, since they can't trigger a hover zone.
 *
 * Below `md`, opening the panel (via the tap tab) behaves like a proper
 * mobile menu: it traps focus, closes on Escape, closes on link click, and
 * locks body scroll while open. Desktop's hover-triggered panel is left
 * exactly as before — hover is transient and shouldn't fight the page.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isInternal = pathname?.startsWith("/internal") ?? false;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const panelRef = useRef<HTMLElement | null>(null);
  const tapTabRef = useRef<HTMLButtonElement | null>(null);

  function show() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }
  function scheduleHide() {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setOpen(false), 400);
  }

  // Mobile-only behaviors: body scroll lock, Escape to close, and a focus
  // trap inside the panel. Gated on the md breakpoint so desktop's
  // hover-to-peek panel keeps working unmodified.
  useEffect(() => {
    if (!open) return;
    if (typeof window === "undefined") return;
    if (!window.matchMedia(MOBILE_QUERY).matches) return;

    const panel = panelRef.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const focusable = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    focusable[0]?.focus();

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        tapTabRef.current?.focus();
        return;
      }
      if (e.key !== "Tab" || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

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
        ref={tapTabRef}
        type="button"
        aria-label={open ? "Close menu" : "Open menu"}
        aria-expanded={open}
        aria-controls={PANEL_ID}
        onClick={() => setOpen((v) => !v)}
        className={clsx(
          "fixed left-0 top-1/2 z-50 -translate-y-1/2 rounded-r-md border border-l-0 px-1.5 py-3 backdrop-blur-sm transition-colors md:hidden",
          isInternal
            ? "border-int-line bg-int-panel/90 text-int-dim hover:text-int-ink"
            : "border-line-2 bg-navy/85 text-dim hover:text-ink"
        )}
      >
        {open ? <X size={16} /> : <Menu size={16} />}
      </button>

      {/* Backdrop, mobile only — gives the open panel a modal feel and is
          also clickable to dismiss it. */}
      {open && (
        <div
          aria-hidden="true"
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
        />
      )}

      <aside
        id={PANEL_ID}
        ref={panelRef}
        role="dialog"
        aria-modal={open}
        aria-label="Site navigation"
        onMouseEnter={show}
        onMouseLeave={scheduleHide}
        className={clsx(
          "fixed inset-y-0 left-0 z-50 flex w-72 max-w-[80vw] flex-col justify-between border-r px-8 py-10 backdrop-blur-md transition-transform duration-300 ease-out",
          isInternal ? "border-int-line bg-int-panel/95" : "border-line-2 bg-navy/95",
          open ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div>
          <Link
            href={isInternal ? "/internal" : "/"}
            className="flex items-center gap-2"
            onClick={() => setOpen(false)}
          >
            <span
              className={clsx(
                "font-serif text-lg font-semibold tracking-tight",
                isInternal ? "text-int-ink" : "text-ink"
              )}
            >
              Air
              <span className={isInternal ? "text-int-pink" : "text-amber-soft"}>imation</span>
            </span>
          </Link>

          {isInternal ? (
            <nav className="mt-14 flex flex-col gap-6">
              <Link
                href="/internal"
                onClick={() => setOpen(false)}
                className={clsx(
                  "font-mono text-xs uppercase tracking-[0.16em] transition-colors",
                  pathname === "/internal"
                    ? "text-int-pink"
                    : "text-int-muted hover:text-int-ink"
                )}
              >
                Academy
              </Link>
              <Link
                href="/internal/quiz"
                onClick={() => setOpen(false)}
                className={clsx(
                  "font-mono text-xs uppercase tracking-[0.16em] transition-colors",
                  pathname === "/internal/quiz"
                    ? "text-int-pink"
                    : "text-int-muted hover:text-int-ink"
                )}
              >
                Take the Quiz
              </Link>
            </nav>
          ) : (
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
          )}
        </div>

        {isInternal ? (
          <Link
            href="/"
            onClick={() => setOpen(false)}
            className="inline-flex w-fit rounded-full bg-int-yellow px-5 py-2 font-mono text-xs uppercase tracking-[0.16em] text-int-ink transition-all hover:bg-int-yellow-soft"
          >
            Back to main site
          </Link>
        ) : (
          <Link
            href="/contact"
            onClick={() => setOpen(false)}
            className="inline-flex w-fit rounded-full bg-amber px-5 py-2 font-mono text-xs uppercase tracking-[0.16em] text-navy transition-all hover:bg-amber-soft"
          >
            Book a Show
          </Link>
        )}
      </aside>
    </>
  );
}

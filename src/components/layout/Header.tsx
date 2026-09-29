"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import clsx from "clsx";
import { navLinks } from "@/lib/content";

const PANEL_ID = "site-nav-panel";
const FOCUSABLE_SELECTOR =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';

/**
 * A conventional top navigation bar.
 *
 * It sits IN FLOW and is deliberately not sticky: it scrolls away with the
 * page, so the swarm canvas and each page's hero get the full viewport once
 * the visitor starts reading.
 *
 * This replaced a hidden left-edge panel that appeared on hover. That design
 * kept pages clean but left most visitors with no idea the nav existed —
 * there was nothing on screen to discover. A visible bar costs a strip of
 * height and removes the problem entirely.
 */
export default function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  const isInternal = pathname?.startsWith("/internal") ?? false;
  const panelRef = useRef<HTMLDivElement | null>(null);
  const toggleRef = useRef<HTMLButtonElement | null>(null);

  // Mobile menu behaviour: Escape closes, focus stays inside while open.
  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    const focusable = panel
      ? Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR))
      : [];
    focusable[0]?.focus();

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
        toggleRef.current?.focus();
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

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  const links = isInternal
    ? [
        { href: "/internal", label: "Academy" },
        { href: "/internal/quiz", label: "Take the Quiz" },
        { href: "/", label: "Main site" },
      ]
    : navLinks;

  return (
    <header
      className={clsx(
        "relative z-30 w-full border-b",
        isInternal ? "border-int-line bg-int-bg" : "border-line-2 bg-navy/80 backdrop-blur-sm"
      )}
    >
      <div className="mx-auto flex max-w-[1100px] items-center justify-between px-6 py-4">
        <Link href={isInternal ? "/internal" : "/"} onClick={() => setOpen(false)}>
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

        {/* Desktop links */}
        <nav className="hidden items-center gap-7 md:flex">
          {links.map((link) => {
            const active = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? "page" : undefined}
                className={clsx(
                  "text-sm transition-colors",
                  isInternal
                    ? active
                      ? "text-int-ink"
                      : "text-int-muted hover:text-int-ink"
                    : active
                      ? "text-ink"
                      : "text-muted hover:text-ink"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile toggle */}
        <button
          ref={toggleRef}
          type="button"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls={PANEL_ID}
          onClick={() => setOpen((v) => !v)}
          className={clsx(
            "-mr-1 p-1.5 transition-colors md:hidden",
            isInternal ? "text-int-muted hover:text-int-ink" : "text-muted hover:text-ink"
          )}
        >
          {open ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div
          id={PANEL_ID}
          ref={panelRef}
          className={clsx(
            "border-t md:hidden",
            isInternal ? "border-int-line bg-int-bg" : "border-line-2 bg-navy"
          )}
        >
          <nav className="mx-auto flex max-w-[1100px] flex-col px-6 py-3">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={clsx(
                  "border-b py-3 text-sm last:border-b-0",
                  isInternal
                    ? "border-int-line/60 text-int-muted"
                    : "border-line-2/60 text-muted"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}

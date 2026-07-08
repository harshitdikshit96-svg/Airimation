import Link from "next/link";
import { navLinks, contactInfo } from "@/lib/content";

export default function Footer() {
  return (
    <footer className="border-t border-line-2 bg-navy-2/60">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-1 gap-10 sm:grid-cols-3">
          <div>
            <span className="font-serif text-lg font-semibold text-ink">
              Air<span className="text-amber-soft">mation</span>
            </span>
            <p className="mt-3 max-w-xs text-sm text-muted">
              Drone-swarm light shows, designed and performed under our flagship,
              Biscope. Based in {contactInfo.base}.
            </p>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
              Site
            </div>
            <ul className="mt-4 space-y-2">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted transition-colors hover:text-ink"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
              Reach us
            </div>
            <ul className="mt-4 space-y-2 text-sm text-muted">
              <li>
                <a
                  href={`mailto:${contactInfo.email}`}
                  className="transition-colors hover:text-ink"
                >
                  {contactInfo.email}
                </a>
              </li>
              <li>{contactInfo.base}</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-line-2 pt-6 text-xs text-dim sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Airmation. All rights reserved.</span>
          <span>Show visuals are concept renders — Biscope&apos;s first shows are in preparation.</span>
        </div>
      </div>
    </footer>
  );
}

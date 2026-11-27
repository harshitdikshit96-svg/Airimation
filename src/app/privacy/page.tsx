import type { Metadata } from "next";
import { company, contactInfo, privacyPolicy } from "@/lib/content";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "What airimation.in collects, why, and the choices you have.",
  robots: { index: false },
};

/** Required by Google Analytics' terms; copy in content.ts (privacyPolicy). */
export default function PrivacyPage() {
  return (
    <section className="border-b border-line-2 px-6 py-16 sm:py-24">
      <div className="mx-auto max-w-[1052px]">
        <div className="max-w-[68ch]">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dim">Privacy</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">Privacy policy</h1>
        <p className="mt-3 font-mono text-xs text-dim">Last updated {privacyPolicy.updated}</p>
        <p className="mt-6 text-muted">{privacyPolicy.intro}</p>
        {privacyPolicy.sections.map((s) => (
          <div key={s.title} className="mt-10">
            <h2 className="font-display text-2xl font-medium text-ink">{s.title}</h2>
            {s.body.map((p) => (
              <p key={p.slice(0, 32)} className="mt-3 leading-relaxed text-muted">
                {p}
              </p>
            ))}
          </div>
        ))}
        <div className="mt-10">
          <h2 className="font-display text-2xl font-medium text-ink">Contact</h2>
          <p className="mt-3 leading-relaxed text-muted">
            {company.legalName}, {contactInfo.base}.{" "}
            <a href={`mailto:${contactInfo.email}`} className="text-ink underline underline-offset-4">
              {contactInfo.email}
            </a>
          </p>
        </div>
        </div>
      </div>
    </section>
  );
}

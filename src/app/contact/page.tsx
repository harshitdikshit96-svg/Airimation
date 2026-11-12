import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import ContactForm from "@/components/ui/ContactForm";
import { company, contactInfo, credentials } from "@/lib/content";
import { Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Airimation",
  description:
    "Get in touch with Airimation to book a drone-swarm light show, or to discuss a partnership.",
};

export default function ContactPage() {
  return (
    <section className="px-6 py-16 sm:py-24">
      <div className="mx-auto grid max-w-[1052px] grid-cols-1 gap-16 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Reveal>
            <SectionLabel>Get in touch</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink">
              Let&apos;s talk about your event.
            </h1>
            <p className="mt-5 text-muted">
              Whether it&apos;s a civic celebration, a festival, a wedding,
              a corporate launch, or a partnership and investment conversation
              — tell us the details and we&apos;ll respond directly.
            </p>

            {/* Company information — the details a district office, a venue
                or a corporate procurement team will ask for. Plain text,
                no official badges; see content.ts for why. */}
            <div className="mt-10 border-t border-line-2 pt-8">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-dim">
                Company information
              </p>
              <dl className="mt-5 space-y-4">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                    Registered name
                  </dt>
                  <dd className="mt-1 text-sm text-muted">{company.legalName}</dd>
                </div>
                {credentials.map((item) => (
                  <div key={item.label}>
                    <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                      {item.label}
                    </dt>
                    <dd className="mt-1 font-mono text-sm text-muted">{item.value}</dd>
                  </div>
                ))}
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-dim">
                    Registered office
                  </dt>
                  <dd className="mt-1 text-sm leading-relaxed text-muted">
                    {company.registeredOfficeShort}
                  </dd>
                </div>
              </dl>
              <p className="mt-6 text-xs leading-relaxed text-dim">
                Recognised as a startup by the Department for Promotion of Industry
                and Internal Trade (DPIIT), and registered as an MSME
                under Udyam. Incorporated under the Companies Act, 2013.
              </p>
            </div>

            <div className="mt-10 space-y-4">
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex min-h-11 items-center gap-3 text-sm text-muted transition-colors hover:text-ink"
              >
                <Mail size={18} className="text-cyan-soft" />
                {contactInfo.email}
              </a>
              <div className="flex items-center gap-3 text-sm text-muted">
                <MapPin size={18} className="text-cyan-soft" />
                {contactInfo.base}
              </div>
            </div>

            <p className="mt-8 text-xs text-dim">
              Airimation is a brand of {company.legalName}.
            </p>
          </Reveal>
        </div>

        <div className="lg:col-span-3">
          <Reveal delay={0.1}>
            <div className="panel-border rounded-2xl bg-panel/40 p-6 sm:p-8">
              <ContactForm />
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}

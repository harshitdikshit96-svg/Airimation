import Reveal from "@/components/ui/Reveal";
import SectionLabel from "@/components/ui/SectionLabel";
import ContactForm from "@/components/ui/ContactForm";
import { contactInfo } from "@/lib/content";
import { Mail, MapPin } from "lucide-react";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact | Airmation",
  description:
    "Get in touch with Airmation to book a Biscope drone-swarm light show, or to discuss partnership and investment.",
};

export default function ContactPage() {
  return (
    <section className="px-6 py-24">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-16 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <Reveal>
            <SectionLabel>Get in touch</SectionLabel>
            <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink">
              Let&apos;s talk about your event.
            </h1>
            <p className="mt-5 text-muted">
              Whether it&apos;s a government celebration, a festival, a wedding,
              a corporate launch, or a partnership and investment conversation
              — tell us the details and we&apos;ll respond directly.
            </p>

            <div className="mt-10 space-y-4">
              <a
                href={`mailto:${contactInfo.email}`}
                className="flex items-center gap-3 text-sm text-muted transition-colors hover:text-ink"
              >
                <Mail size={18} className="text-cyan-soft" />
                {contactInfo.email}
              </a>
              <div className="flex items-center gap-3 text-sm text-muted">
                <MapPin size={18} className="text-cyan-soft" />
                {contactInfo.base}
              </div>
            </div>
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

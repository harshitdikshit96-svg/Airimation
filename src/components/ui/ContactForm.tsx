"use client";

import { useEffect, useState, useSyncExternalStore, FormEvent } from "react";
import { orgTypes } from "@/lib/content";
import { trackFormError, trackGenerateLead } from "@/lib/analytics";
import { getAttribution } from "@/lib/attribution";

type Status = "idle" | "submitting" | "success" | "error";

const noopSubscribe = () => () => {};
/** `?show=<code>` from the configurator's "Request a quote" button. */
const readShowCode = () => new URLSearchParams(window.location.search).get("show");

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const showCode = useSyncExternalStore(noopSubscribe, readShowCode, () => null);
  const [showMessage, setShowMessage] = useState("");

  // Arriving from "Request a quote for this show": prefill the message with
  // the show and its link. The formation library is only loaded in that
  // case, so the form stays light everywhere else.
  useEffect(() => {
    if (!showCode) return;
    let cancelled = false;
    Promise.all([import("@/lib/show/recipe"), import("@/lib/show/summary")]).then(
      ([{ decodeRecipe }, { describeRecipe, sharePath }]) => {
        const recipe = decodeRecipe(showCode);
        if (cancelled || !recipe) return;
        const summary = describeRecipe(recipe);
        setShowMessage(
          `I'd like a quote for this show: ${summary.line} (${summary.palette} palette).\n` +
            `Show link: ${window.location.origin}${sharePath(showCode)}\n\n` +
            `Event, city and date: `
        );
      }
    );
    return () => {
      cancelled = true;
    };
  }, [showCode]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setErrorMsg("");

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: data.get("name"),
      email: data.get("email"),
      phone: data.get("phone") || undefined,
      organization_type: data.get("organization_type"),
      event_date: data.get("event_date") || undefined,
      message: data.get("message"),
      website: data.get("website") || undefined,
      // Where the visit came from, stored with the lead (never shown to anyone outside).
      attribution: getAttribution(),
    };

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const json = await res.json();
      if (!res.ok) {
        setErrorMsg(json.error ?? "Something went wrong. Please try again.");
        setStatus("error");
        trackFormError("contact", res.status === 400 ? "validation" : "server", json.field);
        return;
      }
      // The conversion: only now, after the server has stored the enquiry. Never on the click.
      trackGenerateLead(String(payload.organization_type ?? ""), (payload.event_date as string | undefined) ?? undefined);
      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg("Network error — please try again in a moment.");
      setStatus("error");
      trackFormError("contact", "network");
    }
  }

  if (status === "success") {
    return (
      <div role="status" className="panel-border rounded-2xl bg-panel/50 p-8 text-center">
        <h3 className="font-display text-xl font-semibold text-green-soft">
          Message received
        </h3>
        <p className="mt-2 text-sm text-muted">
          Thank you — we&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form id="contact" onSubmit={handleSubmit} className="relative space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-name" className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
            Name
          </label>
          <input
            id="cf-name"
            name="name"
            required
            maxLength={120}
            autoComplete="name"
            className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label htmlFor="cf-email" className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
            Email
          </label>
          <input
            type="email"
            id="cf-email"
            name="email"
            required
            maxLength={200}
            autoComplete="email"
            className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cf-phone" className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
            Phone (optional)
          </label>
          <input
            id="cf-phone"
            name="phone"
            type="tel"
            autoComplete="tel"
            className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
            placeholder="+91"
          />
        </div>
        <div>
          <label htmlFor="cf-event_date" className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
            Event date (optional)
          </label>
          <input
            type="date"
            id="cf-event_date"
            name="event_date"
            className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
          />
        </div>
      </div>

      <div>
        <label htmlFor="cf-organization_type" className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
          You are reaching out as
        </label>
        <select
          id="cf-organization_type"
            name="organization_type"
          required
          defaultValue=""
          className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
        >
          <option value="" disabled>
            Select one
          </option>
          {orgTypes.map((type) => (
            <option key={type} value={type}>
              {type}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="cf-message" className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
          Message
        </label>
        <textarea
          // Remount when the show summary arrives, so it lands as the default.
          key={showMessage ? "show" : "blank"}
          defaultValue={showMessage}
          id="cf-message"
            name="message"
          required
          maxLength={5000}
          rows={showMessage ? 7 : 5}
          className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
          placeholder="Tell us about the event, venue, or what you'd like to discuss"
        />
      </div>

      {/* Spam trap: hidden from people, filled in by bots; the API drops those. */}
      <div aria-hidden="true" className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="cf-website">Website</label>
        <input id="cf-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>

      <p role="alert" className="text-sm text-brick-soft empty:hidden">
        {status === "error" ? errorMsg : ""}
      </p>

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full rounded-full bg-amber px-6 py-3.5 text-sm font-medium text-navy transition-all hover:bg-amber-soft disabled:opacity-60 sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Send Message"}
      </button>
    </form>
  );
}

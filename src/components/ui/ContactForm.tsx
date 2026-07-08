"use client";

import { useState, FormEvent } from "react";
import { orgTypes } from "@/lib/content";

type Status = "idle" | "submitting" | "success" | "error";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

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
        return;
      }
      setStatus("success");
      form.reset();
    } catch {
      setErrorMsg("Network error — please try again in a moment.");
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="panel-border rounded-2xl bg-panel/50 p-8 text-center">
        <h3 className="font-serif text-xl font-semibold text-green-soft">
          Message received
        </h3>
        <p className="mt-2 text-sm text-muted">
          Thank you — we&apos;ll get back to you shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
            Name
          </label>
          <input
            name="name"
            required
            className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
            placeholder="Your full name"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
            Email
          </label>
          <input
            type="email"
            name="email"
            required
            className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
            placeholder="you@example.com"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
            Phone (optional)
          </label>
          <input
            name="phone"
            className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
            placeholder="+91"
          />
        </div>
        <div>
          <label className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
            Event date (optional)
          </label>
          <input
            type="date"
            name="event_date"
            className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
          />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
          You are reaching out as
        </label>
        <select
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
        <label className="mb-1.5 block font-mono text-xs uppercase tracking-[0.14em] text-dim">
          Message
        </label>
        <textarea
          name="message"
          required
          rows={5}
          className="w-full rounded-lg border border-line bg-panel-2/70 px-4 py-3 text-sm text-ink outline-none transition-colors focus:border-cyan-soft"
          placeholder="Tell us about the event, venue, or what you'd like to discuss"
        />
      </div>

      {status === "error" && (
        <p className="text-sm text-brick-soft">{errorMsg}</p>
      )}

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

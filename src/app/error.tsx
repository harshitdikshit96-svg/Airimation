"use client";

import { useEffect } from "react";
import Button from "@/components/ui/Button";
import { trackException } from "@/lib/analytics";

/** Shown if a page fails to render; the header and footer stay in place. */
export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
    trackException(error);
  }, [error]);

  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1052px]">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dim">Something went wrong</p>
        <h1 className="mt-4 font-display text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          A drone dropped out of formation.
        </h1>
        <p className="mt-6 max-w-xl text-muted">This page didn&apos;t load properly. Try again, or head back home.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-full bg-amber px-6 py-3 text-sm font-medium text-navy transition-all duration-300 hover:bg-amber-soft"
          >
            Try again
          </button>
          <Button href="/" variant="ghost">
            Back to the home page
          </Button>
        </div>
      </div>
    </section>
  );
}

import type { Metadata } from "next";
import Button from "@/components/ui/Button";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false },
};

export default function NotFound() {
  return (
    <section className="px-6 py-24 sm:py-32">
      <div className="mx-auto max-w-[1052px]">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-dim">404</p>
        <h1 className="mt-4 font-serif text-4xl font-semibold leading-tight text-ink sm:text-5xl">
          This part of the sky is empty.
        </h1>
        <p className="mt-6 max-w-xl text-muted">The page you were looking for isn&apos;t here — it may have moved.</p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button href="/">Back to the home page</Button>
          <Button href="/design-your-show" variant="ghost">
            Design a show
          </Button>
        </div>
      </div>
    </section>
  );
}

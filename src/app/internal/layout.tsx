import type { Metadata } from "next";

// All /internal routes share one light-pink-and-yellow theme, deliberately
// distinct from the public site's dark navy/amber look — this is an
// employee-only surface, and shouldn't be mistaken for customer marketing.
export const metadata: Metadata = {
  robots: { index: false, follow: false },
};

export default function InternalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-int-bg text-int-ink">
      {children}
    </div>
  );
}

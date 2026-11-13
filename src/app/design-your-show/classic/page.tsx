import type { Metadata } from "next";
import DesignYourShowView from "@/components/show/DesignYourShowView";

// ARCHIVED (Nov 2026): the earlier formation-picker configurator. Not
// linked from the site; kept so its share links (/design-your-show/s/…)
// keep working. The live page is /design-your-show.
export const metadata: Metadata = {
  title: "Show Designer (archived)",
  robots: { index: false, follow: true },
  alternates: { canonical: "/design-your-show" },
};

export default function ClassicDesignerPage() {
  return <DesignYourShowView archived />;
}

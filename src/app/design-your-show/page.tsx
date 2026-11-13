import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import DesignShowcaseView from "@/components/show/DesignShowcaseView";

export const metadata: Metadata = pageMeta({
  title: "Design Your Show",
  description:
    "Pick a fleet size — 100 to 5,000 drones — and watch what it can fly — figures made from real 3D models, from the Tiranga to a scanned Ganesha — simulated live in 3D.",
  path: "/design-your-show",
});

export default function DesignYourShowPage() {
  return <DesignShowcaseView />;
}

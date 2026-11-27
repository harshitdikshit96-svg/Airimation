import type { Metadata } from "next";
import { pageMeta } from "@/lib/seo";
import DesignShowcaseView from "@/components/show/DesignShowcaseView";
import { allFormationFacts } from "@/lib/cultural/facts";

export const metadata: Metadata = pageMeta({
  title: "Design a Drone Light Show in 3D",
  description:
    `Pick 100 to 5,000 drones and watch ${allFormationFacts().length} formations — Ganesha, the Tiranga, a diya, the Taj Mahal and more — fly live in 3D over a night sky. A free concept preview from Airimation.`,
  path: "/design-your-show",
});

export default function DesignYourShowPage() {
  return <DesignShowcaseView />;
}

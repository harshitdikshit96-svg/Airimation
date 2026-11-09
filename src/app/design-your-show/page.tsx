import type { Metadata } from "next";
import DesignShowcaseView from "@/components/show/DesignShowcaseView";

export const metadata: Metadata = {
  title: "Design Your Show | Airimation",
  description:
    "Pick a fleet size — 100 to 2,000 drones — and watch the formations it can fly, from the Tiranga to Ganesha and a dragon, simulated live in 3D at real drone speeds.",
};

export default function DesignYourShowPage() {
  return <DesignShowcaseView />;
}

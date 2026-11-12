import type { Metadata } from "next";
import DesignShowcaseView from "@/components/show/DesignShowcaseView";

export const metadata: Metadata = {
  title: "Design Your Show | Airimation",
  description:
    "Pick a fleet size — 100 to 5,000 drones — and watch what it can fly — figures made from real 3D models, from the Tiranga to a scanned Ganesha — simulated live in 3D.",
};

export default function DesignYourShowPage() {
  return <DesignShowcaseView />;
}

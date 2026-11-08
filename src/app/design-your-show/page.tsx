import type { Metadata } from "next";
import DesignYourShowView from "@/components/show/DesignYourShowView";

export const metadata: Metadata = {
  title: "Design Your Show | Airimation",
  description:
    "Choose a fleet size and formations, and watch a drone light show play out over a night sky — so you can picture yours before you book.",
};

export default function DesignYourShowPage() {
  return <DesignYourShowView />;
}

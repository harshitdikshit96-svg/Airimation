import type { Metadata } from "next";
import AcademyExperience from "@/components/academy/AcademyExperience";

// Internal-only: not linked from the public nav, and explicitly kept out of
// search results. Reachable directly at /internal for anyone at Airimation.
export const metadata: Metadata = {
  title: "Airimation Academy (Internal)",
  description: "Internal onboarding — the business, the tech, and the roadmap, gamified.",
  robots: { index: false, follow: false },
};

export default function InternalAcademyPage() {
  return <AcademyExperience />;
}

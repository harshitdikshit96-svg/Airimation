import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { pageMeta, SITE_URL } from "@/lib/seo";
import DesignShowcaseView from "@/components/show/DesignShowcaseView";
import { allFormationFacts, formationFacts, formationOgImage, formationPath } from "@/lib/cultural/facts";

// One page per Design a Show formation (docs/seo/PLAN.md §2), built ahead of
// time. The same live sky as /design-your-show, opened on this figure;
// picking another changes the address bar, not the page. Unknown ids 404.

type Params = { params: Promise<{ formation: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return allFormationFacts().map((f) => ({ formation: f.id }));
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const f = formationFacts((await params).formation);
  if (!f) return {};
  return pageMeta({
    title: `${f.heading} — see it in 3D`,
    description: `${f.blurb} See it live in 3D from ${f.minDrones.toLocaleString("en-IN")} to 5,000 drones, change its LED colours, and ask Airimation for a quote.`,
    path: formationPath(f.id),
    image: { url: formationOgImage(f.id), alt: `Concept render: ${f.label} drawn in 5,000 drones over a dusk skyline` },
  });
}

export default async function FormationPage({ params }: Params) {
  const f = formationFacts((await params).formation);
  if (!f) notFound();
  const breadcrumbs = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Design a Show", item: `${SITE_URL}/design-your-show` },
      { "@type": "ListItem", position: 3, name: f.label, item: `${SITE_URL}${formationPath(f.id)}` },
    ],
  };
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }} />
      <DesignShowcaseView formation={f} />
    </>
  );
}

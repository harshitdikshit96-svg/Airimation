import type { Metadata } from "next";
import DesignYourShowView from "@/components/show/DesignYourShowView";
import { decodeRecipe } from "@/lib/show/recipe";
import { describeRecipe, sharePath } from "@/lib/show/summary";

type Params = { params: Promise<{ code: string }> };

// A shared show: the same page, opened with the sender's configuration.
// Everything is in the URL, so there is nothing to look up and nothing
// that can expire. The preview image is ./opengraph-image.tsx.

// Rendered on a code's first visit, then served from the cache: the page is a
// pure function of the code, so no visit after the first runs a function.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { code } = await params;
  const recipe = decodeRecipe(code);
  const title = recipe
    ? `A ${recipe.d}-drone show, designed for you | Airimation`
    : "Design Your Show | Airimation";
  const description = recipe
    ? `${describeRecipe(recipe).line}. Open the link to watch it play over a night sky — a concept preview from Airimation.`
    : "Choose a fleet size and formations, and watch a drone light show play out over a night sky.";
  return {
    // Already carries the brand; skip the layout's " | Airimation".
    title: { absolute: title },
    description,
    // One canonical page for search; every shared variant points to it.
    alternates: { canonical: "/design-your-show" },
    robots: { index: false, follow: true },
    openGraph: { title, description, url: sharePath(code), type: "website" },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function SharedShowPage({ params }: Params) {
  const { code } = await params;
  // A broken or tampered link still opens the configurator, on the
  // default show, rather than a 404.
  return <DesignYourShowView code={decodeRecipe(code) ? code : undefined} />;
}

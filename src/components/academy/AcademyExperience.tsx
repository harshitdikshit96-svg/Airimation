"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { academyMeta } from "@/lib/academyContent";
import AcademySwarmHero from "./AcademySwarmHero";
import ProgressRail, { type AcademyChapterMeta } from "./ProgressRail";
import MissionChapter from "./MissionChapter";
import HistoryChapter from "./HistoryChapter";
import QuadcopterLab from "./QuadcopterLab";
import SwarmScienceChapter from "./SwarmScienceChapter";
import BusinessChapter from "./BusinessChapter";
import RoadmapExplorer from "./RoadmapExplorer";

const CHAPTERS: AcademyChapterMeta[] = [
  { id: "mission", label: "Mission", num: 1 },
  { id: "history", label: "History & Records", num: 2 },
  { id: "quad", label: "Quadcopter 101", num: 3 },
  { id: "swarm", label: "Swarm Science", num: 4 },
  { id: "business", label: "Business & Market", num: 5 },
  { id: "roadmap", label: "Roadmap", num: 6 },
];

const PROGRESS_KEY = "airimation-academy-completed";
const FACTS_KEY = "airimation-academy-facts";

// Read once at module scope so both lazy initializers below share the same
// "are we on the client" check without duplicating the try/catch.
function readLocalStorage(key: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export default function AcademyExperience() {
  const [activeId, setActiveId] = useState(CHAPTERS[0].id);
  // Lazy initializers read localStorage directly rather than restoring via a
  // useEffect + setState — that pattern (setState synchronously inside an
  // effect body) is what the react-hooks lint rule flags; reading during the
  // initial render instead avoids the extra render pass entirely.
  const [completed, setCompleted] = useState<Set<string>>(() => {
    const saved = readLocalStorage(PROGRESS_KEY);
    const restored = saved ? (JSON.parse(saved) as string[]) : [];
    return new Set([CHAPTERS[0].id, ...restored]);
  });
  const [factsOpened, setFactsOpened] = useState<number>(() => {
    const saved = readLocalStorage(FACTS_KEY);
    return saved ? Number(saved) || 0 : 0;
  });
  const contentRef = useRef<HTMLDivElement | null>(null);

  function markComplete(id: string) {
    setCompleted((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev).add(id);
      window.localStorage.setItem(PROGRESS_KEY, JSON.stringify(Array.from(next)));
      return next;
    });
  }

  function goTo(id: string) {
    markComplete(id);
    setActiveId(id);
    requestAnimationFrame(() => {
      contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }

  function handleFactOpen() {
    setFactsOpened((n) => {
      const next = n + 1;
      window.localStorage.setItem(FACTS_KEY, String(next));
      return next;
    });
  }

  function nextFrom(id: string) {
    const i = CHAPTERS.findIndex((c) => c.id === id);
    if (i >= 0 && i + 1 < CHAPTERS.length) goTo(CHAPTERS[i + 1].id);
  }
  function prevFrom(id: string) {
    const i = CHAPTERS.findIndex((c) => c.id === id);
    if (i > 0) goTo(CHAPTERS[i - 1].id);
  }

  return (
    <div className="min-h-screen">
      <div className="relative h-[46vh] min-h-[360px] w-full overflow-hidden border-b border-int-line">
        <div className="absolute inset-0">
          <AcademySwarmHero />
        </div>
        <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center">
          <p className="mb-4 font-mono text-xs tracking-[0.28em] text-int-dim">
            {academyMeta.tagline}
          </p>
          <h1 className="font-serif text-[clamp(32px,5.2vw,64px)] font-light leading-[1.1] text-int-ink">
            {academyMeta.title}
          </h1>
          <p className="mt-4 max-w-[48ch] text-base font-light text-int-muted">
            {academyMeta.subtitle}
          </p>
          <p className="mt-6 font-mono text-[11px] tracking-[0.16em] text-int-pink">
            {factsOpened} facts uncovered so far
          </p>
          <Link
            href="/internal/quiz"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-int-yellow px-6 py-3 font-mono text-xs uppercase tracking-[0.16em] text-int-ink shadow-sm transition-all hover:bg-int-yellow-soft"
          >
            Take the quiz <ArrowRight size={14} />
          </Link>
        </div>
      </div>

      <ProgressRail
        chapters={CHAPTERS}
        activeId={activeId}
        completed={completed}
        onSelect={goTo}
      />

      <div ref={contentRef} />

      <AnimatePresence mode="wait">
        <motion.div
          key={activeId}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {activeId === "mission" && (
            <MissionChapter onNext={() => nextFrom("mission")} onCardOpen={handleFactOpen} />
          )}
          {activeId === "history" && (
            <HistoryChapter
              onNext={() => nextFrom("history")}
              onPrev={() => prevFrom("history")}
              onCardOpen={handleFactOpen}
            />
          )}
          {activeId === "quad" && (
            <QuadcopterLab
              onNext={() => nextFrom("quad")}
              onPrev={() => prevFrom("quad")}
              onPartOpen={handleFactOpen}
            />
          )}
          {activeId === "swarm" && (
            <SwarmScienceChapter
              onNext={() => nextFrom("swarm")}
              onPrev={() => prevFrom("swarm")}
              onCardOpen={handleFactOpen}
            />
          )}
          {activeId === "business" && (
            <BusinessChapter
              onNext={() => nextFrom("business")}
              onPrev={() => prevFrom("business")}
              onCardOpen={handleFactOpen}
            />
          )}
          {activeId === "roadmap" && (
            <RoadmapExplorer
              onPrev={() => prevFrom("roadmap")}
              onYearOpen={handleFactOpen}
            />
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

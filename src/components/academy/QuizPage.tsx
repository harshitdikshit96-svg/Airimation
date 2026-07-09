"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Check, X, RotateCcw, ArrowLeft } from "lucide-react";
import clsx from "clsx";
import { pickRandomQuestions, badgeForScore, type QuizQuestion } from "@/lib/academyContent";

const STORAGE_KEY = "airimation-academy-best-score";

export default function QuizPage() {
  const [questions, setQuestions] = useState<QuizQuestion[]>(() => pickRandomQuestions());
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number | null>(null);

  const q = questions[index];
  const total = questions.length;

  function choose(optionIdx: number) {
    if (selected !== null) return;
    setSelected(optionIdx);
    if (optionIdx === q.correct) setScore((s) => s + 1);
  }

  function next() {
    if (index + 1 < total) {
      setIndex((i) => i + 1);
      setSelected(null);
    } else {
      setDone(true);
      if (typeof window !== "undefined") {
        const prev = Number(window.localStorage.getItem(STORAGE_KEY) ?? 0);
        const bestScore = Math.max(prev, score);
        window.localStorage.setItem(STORAGE_KEY, String(bestScore));
        setBest(bestScore);
      }
    }
  }

  function restart(freshSet: boolean) {
    if (freshSet) setQuestions(pickRandomQuestions());
    setIndex(0);
    setSelected(null);
    setScore(0);
    setDone(false);
  }

  if (done) {
    const tier = badgeForScore(score, total);
    return (
      <div className="mx-auto max-w-2xl px-6 py-20">
        <Link
          href="/internal"
          className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-int-dim transition-colors hover:text-int-ink"
        >
          <ArrowLeft size={14} /> Back to Academy
        </Link>

        <div className="rounded-2xl border border-int-yellow/40 bg-int-yellow/10 p-8 text-center">
          <p className="mb-2 font-mono text-xs uppercase tracking-[0.2em] text-int-pink">
            Your badge
          </p>
          <h1 className="mb-3 font-serif text-3xl font-medium text-int-ink">{tier.name}</h1>
          <p className="mx-auto mb-6 max-w-[50ch] text-[15px] font-light text-int-muted">
            {tier.blurb}
          </p>
          <p className="mb-1 font-mono text-2xl text-int-ink">
            {score}/{total}
          </p>
          <p className="font-mono text-[11px] tracking-[0.1em] text-int-dim">
            correct {best !== null && best > score ? `· personal best: ${best}/10` : ""}
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => restart(true)}
              className="inline-flex items-center gap-2 rounded-full bg-int-pink px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-white transition-colors hover:bg-int-pink/90"
            >
              <RotateCcw size={14} /> New random set
            </button>
            <Link
              href="/internal"
              className="inline-flex items-center gap-2 rounded-full border border-int-line px-5 py-2.5 font-mono text-xs uppercase tracking-[0.14em] text-int-ink transition-colors hover:border-int-yellow"
            >
              Back to Academy
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <Link
        href="/internal"
        className="mb-10 inline-flex items-center gap-2 font-mono text-xs uppercase tracking-[0.14em] text-int-dim transition-colors hover:text-int-ink"
      >
        <ArrowLeft size={14} /> Back to Academy
      </Link>

      <p className="mb-4 font-mono text-xs tracking-[0.28em] text-int-dim">
        AIRIMATION ACADEMY · KNOWLEDGE CHECK
      </p>
      <h1 className="mb-8 font-serif text-[clamp(28px,3.6vw,40px)] font-light leading-[1.15] text-int-ink">
        Prove it.
      </h1>

      <div className="mb-6 flex items-center justify-between">
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-int-dim">
          Question {index + 1} of {total}
        </p>
        <p className="font-mono text-xs uppercase tracking-[0.14em] text-int-pink">{q.topic}</p>
      </div>

      <div className="mb-2 h-1 w-full overflow-hidden rounded-full bg-int-ink/[0.08]">
        <div
          className="h-full rounded-full bg-int-yellow transition-all duration-300"
          style={{ width: `${(index / total) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={q.id}
          initial={{ opacity: 0, x: 12 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -12 }}
          transition={{ duration: 0.2 }}
          className="mt-8"
        >
          <h2 className="mb-6 font-serif text-xl font-light leading-snug text-int-ink">
            {q.question}
          </h2>

          <div className="grid grid-cols-1 gap-3">
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correct;
              const isPicked = i === selected;
              const revealed = selected !== null;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => choose(i)}
                  disabled={revealed}
                  className={clsx(
                    "flex items-center justify-between rounded-xl border px-5 py-3.5 text-left text-[15px] font-light transition-colors",
                    !revealed && "border-int-line bg-int-panel text-int-ink/90 hover:border-int-yellow/60",
                    revealed && isCorrect && "border-emerald-500/50 bg-emerald-500/[0.08] text-emerald-700",
                    revealed && isPicked && !isCorrect && "border-red-400/50 bg-red-400/[0.08] text-red-700",
                    revealed && !isPicked && !isCorrect && "border-int-line bg-int-panel text-int-dim"
                  )}
                >
                  <span>{opt}</span>
                  {revealed && isCorrect && <Check size={16} className="shrink-0" />}
                  {revealed && isPicked && !isCorrect && <X size={16} className="shrink-0" />}
                </button>
              );
            })}
          </div>

          {selected !== null && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mt-5 overflow-hidden rounded-xl border border-int-line bg-int-panel p-4"
            >
              <p className="text-sm font-light leading-relaxed text-int-muted">{q.explain}</p>
            </motion.div>
          )}

          {selected !== null && (
            <button
              type="button"
              onClick={next}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-int-yellow px-5 py-2.5 font-mono text-xs uppercase tracking-[0.16em] text-int-ink transition-all hover:bg-int-yellow-soft"
            >
              {index + 1 < total ? "Next question" : "See my results"}
            </button>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

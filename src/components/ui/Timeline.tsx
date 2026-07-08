import Reveal from "./Reveal";
import { roadmap } from "@/lib/content";

export default function Timeline() {
  return (
    <div className="relative">
      <div className="absolute left-[10px] top-2 bottom-2 w-px bg-line hidden sm:block" />
      <div className="space-y-8">
        {roadmap.map((item, i) => (
          <Reveal key={item.year} delay={i * 0.06}>
            <div className="relative flex flex-col gap-2 sm:flex-row sm:gap-8 sm:pl-10">
              <span className="absolute left-0 top-1.5 hidden h-[21px] w-[21px] items-center justify-center sm:flex">
                <span className="h-2.5 w-2.5 rounded-full bg-amber ring-4 ring-navy" />
              </span>
              <div className="w-32 shrink-0 font-mono text-xs uppercase tracking-[0.2em] text-cyan-soft">
                {item.year}
              </div>
              <div className="flex-1 pb-2">
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <h4 className="font-serif text-lg font-semibold text-ink">{item.heading}</h4>
                  <span className="font-mono text-xs text-dim">{item.fleet}</span>
                </div>
                <p className="mt-1 text-sm text-muted">{item.detail}</p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </div>
  );
}

import Reveal from "./Reveal";

export default function StatGrid({
  stats,
}: {
  stats: { value: string; label: string }[];
}) {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
      {stats.map((s, i) => (
        <Reveal key={s.label} delay={i * 0.08}>
          <div className="panel-border rounded-2xl bg-panel/60 p-6 h-full">
            <div className="font-serif text-3xl font-semibold text-amber-soft sm:text-4xl">
              {s.value}
            </div>
            <div className="mt-2 text-sm text-muted">{s.label}</div>
          </div>
        </Reveal>
      ))}
    </div>
  );
}

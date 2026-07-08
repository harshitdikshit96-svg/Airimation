export default function SectionLabel({
  no,
  children,
}: {
  no?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-3 font-mono text-xs uppercase tracking-[0.28em] text-cyan-soft">
      {no && <span className="text-dim">{no}</span>}
      <span>{children}</span>
    </div>
  );
}

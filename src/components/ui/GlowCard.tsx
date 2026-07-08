import { ReactNode } from "react";
import clsx from "clsx";

const colorMap: Record<string, string> = {
  amber: "group-hover:border-amber/60 group-hover:shadow-[0_0_40px_rgba(224,162,48,0.15)]",
  cyan: "group-hover:border-cyan/60 group-hover:shadow-[0_0_40px_rgba(42,165,181,0.18)]",
  violet: "group-hover:border-violet/60 group-hover:shadow-[0_0_40px_rgba(124,107,196,0.18)]",
  green: "group-hover:border-green/60 group-hover:shadow-[0_0_40px_rgba(79,176,122,0.18)]",
};

const dotMap: Record<string, string> = {
  amber: "bg-amber",
  cyan: "bg-cyan",
  violet: "bg-violet",
  green: "bg-green",
};

export default function GlowCard({
  title,
  description,
  color = "amber",
  children,
}: {
  title: string;
  description: string;
  color?: "amber" | "cyan" | "violet" | "green";
  children?: ReactNode;
}) {
  return (
    <div
      className={clsx(
        "group panel-border rounded-2xl bg-panel/50 p-7 h-full transition-all duration-500",
        colorMap[color]
      )}
    >
      <span className={clsx("inline-block h-2 w-2 rounded-full", dotMap[color])} />
      <h3 className="mt-4 font-serif text-xl font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
      {children}
    </div>
  );
}

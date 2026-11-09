import Image from "next/image";
import clsx from "clsx";

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

/**
 * A founder's photo, or — until a real one is added to `public/team/` and
 * wired up in `content.ts` — a neutral initials placeholder so the section
 * never shows a broken image. Photos render slightly desaturated by default
 * and go full colour on hover, a small bit of polish instead of a flat grid
 * of headshots.
 */
export default function FounderAvatar({
  name,
  photo,
  size = "md",
  className,
}: {
  name: string;
  photo?: string;
  /** sm: round 64px thumbnail (cards) · md: square tile · lg: 4:5 portrait. */
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const aspect = size === "lg" ? "aspect-[4/5]" : size === "sm" ? "aspect-square h-16 w-16 shrink-0 !rounded-full" : "aspect-square";

  if (photo) {
    return (
      <div className={clsx("relative overflow-hidden rounded-2xl bg-panel-2", aspect, className)}>
        <Image
          src={photo}
          alt={name}
          fill
          // The tiles are small and fixed-width now, so ask for small files:
          // "lg" is a 200px column (96px on phones), "md" a grid cell that is
          // roughly half the viewport on phones.
          sizes={size === "lg" ? "(min-width: 640px) 200px, 96px" : size === "sm" ? "64px" : "176px"}
          className="object-cover grayscale-[40%] contrast-[1.05] transition-all duration-500 group-hover:grayscale-0"
        />
      </div>
    );
  }

  return (
    <div
      className={clsx(
        "flex items-center justify-center rounded-2xl bg-panel-2",
        aspect,
        className
      )}
    >
      <span
        className={clsx(
          "font-serif font-medium text-amber-soft/80",
          size === "lg" ? "text-5xl" : size === "sm" ? "text-lg" : "text-3xl"
        )}
      >
        {initials(name)}
      </span>
    </div>
  );
}

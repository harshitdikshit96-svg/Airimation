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
  size?: "md" | "lg";
  className?: string;
}) {
  const aspect = size === "lg" ? "aspect-[4/5]" : "aspect-square";

  if (photo) {
    return (
      <div className={clsx("relative overflow-hidden rounded-2xl bg-panel-2", aspect, className)}>
        <Image
          src={photo}
          alt={name}
          fill
          sizes={size === "lg" ? "(min-width: 1024px) 320px, 50vw" : "(min-width: 1024px) 220px, 40vw"}
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
          size === "lg" ? "text-5xl" : "text-3xl"
        )}
      >
        {initials(name)}
      </span>
    </div>
  );
}

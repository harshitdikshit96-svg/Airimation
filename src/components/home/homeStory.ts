// Scroll -> story state, via GSAP ScrollTrigger.
//
// Each beat of the story is its own scrubbed tween on its own proxy
// object, triggered by the section whose copy narrates it. The story
// state is the sum of those proxies, so a fast scroll in either direction
// can never leave two tweens fighting over one value.
//
//   hero -> 01 Lift-off   lights ripple on, fleet rises into a sheet
//   02 Open sky (in)      the sheet loosens into a cloud
//   02 Open sky (out)     the cloud gathers into a lotus
//   03 The show           the lotus becomes the AIRIMATION wordmark
//   past the show         the wordmark dissolves; rendering stops

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { StoryState } from "./HomeSwarm";
import { trackHomeStory } from "@/lib/analytics";

export function setupStory(
  story: StoryState,
  scrim: HTMLElement | null,
  onActive: (active: boolean) => void
): () => void {
  gsap.registerPlugin(ScrollTrigger);

  const lift = { p: 0 };
  const loosen = { p: 0 };
  const bloom = { p: 0 };
  const brand = { p: 0 };
  const dissolve = { p: 0 };

  // home_story_progress: each beat once per page view, when its segment is nearly done.
  const beats = [lift, loosen, bloom, brand];
  const sync = () => {
    beats.forEach((b, i) => b.p > 0.9 && trackHomeStory(i + 1));
    story.lit = Math.min(1, lift.p * 1.8);
    story.beat = lift.p + loosen.p + bloom.p + brand.p;
    story.dissolve = dissolve.p;
  };

  const ctx = gsap.context(() => {
    const seg = (obj: { p: number }, trigger: string, start: string, end: string) =>
      gsap.to(obj, {
        p: 1,
        ease: "none",
        onUpdate: sync,
        // Numeric scrub = the value glides to the scroll position, which is
        // what turns stepped wheel input into smooth flight. 0.7s keeps that
        // smoothing without the swarm feeling a second behind the page.
        scrollTrigger: { trigger, start, end, scrub: 0.7 },
      });

    seg(lift, "#lift-off", "top 92%", "center 55%");
    seg(loosen, "#open-sky", "top 92%", "top 35%");
    seg(bloom, "#open-sky", "center 65%", "bottom 15%");
    seg(brand, "#shows", "top 95%", "top 50%");
    seg(dissolve, "#shows", "bottom 80%", "bottom 10%");

    if (scrim) {
      gsap.fromTo(
        scrim,
        { opacity: 0 },
        { opacity: 1, ease: "none", scrollTrigger: { trigger: "#shows", start: "bottom 70%", end: "bottom 10%", scrub: true } }
      );
    }

    // Past the story, freeze the last frame (the empty dusk sky) and stop
    // rendering entirely. Scrolling back up starts it again.
    ScrollTrigger.create({
      trigger: "#shows",
      start: "bottom 8%",
      onEnter: () => onActive(false),
      onLeaveBack: () => onActive(true),
    });
  });

  return () => ctx.revert();
}

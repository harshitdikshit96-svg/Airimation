import Reveal from "@/components/ui/Reveal";
import ContactForm from "@/components/ui/ContactForm";
import ScrollSwarmCanvas from "@/components/home/ScrollSwarmCanvas";
import {
  homeHero,
  homeChapters,
  biscopeStepsCompact,
  homeSegments,
  founders,
  safetyHighlightsCompact,
  contactInfo,
} from "@/lib/content";

export default function Home() {
  return (
    <>
      <ScrollSwarmCanvas />

      <div className="relative z-[1]">
        {/* HERO */}
        <section
          id="show"
          className="mx-auto flex min-h-screen max-w-[1100px] flex-col justify-center px-6 pb-20 pt-36"
        >
          <Reveal>
            <p className="mb-7 font-mono text-xs tracking-[0.28em] text-dim">
              {homeHero.eyebrow}
            </p>
            <h1 className="max-w-[15ch] font-serif text-[clamp(42px,6.4vw,84px)] font-light leading-[1.08] text-ink">
              {homeHero.title}
            </h1>
            <p className="mt-8 max-w-[52ch] text-lg font-light text-muted">
              {homeHero.subtitle}
            </p>
            <div className="mt-16 flex items-center gap-3">
              <span className="h-11 w-px bg-gradient-to-b from-white/25 to-transparent" />
              <span className="font-mono text-[11px] tracking-[0.22em] text-dim">
                SCROLL TO BEGIN THE SHOW
              </span>
            </div>
          </Reveal>
        </section>

        {/* LIFT-OFF / OPEN SKY CHAPTERS */}
        {homeChapters.map((chapter, i) => (
          <section
            key={chapter.id}
            className={`mx-auto flex min-h-[90vh] max-w-[1100px] items-center px-6 ${
              i % 2 === 1 ? "justify-end" : ""
            }`}
          >
            <Reveal>
              <div className={`max-w-[46ch] ${i % 2 === 1 ? "text-left" : ""}`}>
                <p className="mb-5 font-mono text-xs tracking-[0.28em] text-dim">
                  {chapter.index}
                </p>
                <h2 className="max-w-[20ch] font-serif text-[clamp(30px,3.6vw,46px)] font-light leading-[1.15] text-ink">
                  {chapter.title}
                </h2>
                <p className="mt-6 text-[17px] font-light text-muted">{chapter.body}</p>
              </div>
            </Reveal>
          </section>
        ))}

        {/* BISCOPE */}
        <section
          id="biscope"
          className="mx-auto flex min-h-screen max-w-[1100px] flex-col justify-center px-6 py-24"
        >
          <Reveal>
            <p className="mb-5 font-mono text-xs tracking-[0.28em] text-dim">03 · THE FLAGSHIP</p>
            <h2 className="mb-4 font-serif text-[clamp(34px,4.4vw,58px)] font-light leading-[1.12] text-ink">
              Biscope.
            </h2>
            <p className="mb-14 max-w-[58ch] text-[17px] font-light text-muted">
              Our flagship show system: storyboard to sky, one disciplined pipeline.
              Choreographed to a client&apos;s story, colours and music.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 gap-x-10 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
            {biscopeStepsCompact.map((step, i) => (
              <Reveal key={step.step} delay={i * 0.06}>
                <div>
                  <p className="mb-3.5 font-mono text-xs tracking-[0.2em] text-dim">
                    {step.step}
                  </p>
                  <h3 className="mb-2.5 text-[17px] font-medium text-ink">{step.title}</h3>
                  <p className="text-sm font-light text-muted">{step.description}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-16 flex flex-wrap gap-10">
            {homeSegments.map((segment, i) => (
              <Reveal key={segment.label} delay={i * 0.06}>
                <div>
                  <p className="font-mono text-[22px] text-ink">{segment.label}</p>
                  <p className="mt-1.5 text-[13px] text-dim">{segment.sub}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* TEAM */}
        <section
          id="team"
          className="mx-auto flex min-h-[90vh] max-w-[1100px] flex-col justify-center px-6 py-24"
        >
          <Reveal>
            <p className="mb-5 font-mono text-xs tracking-[0.28em] text-dim">04 · THE TEAM</p>
            <h2 className="mb-12 font-serif text-[clamp(30px,3.6vw,46px)] font-light leading-[1.15] text-ink">
              Built in New Delhi, by people who fly.
            </h2>
          </Reveal>

          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-4">
            {founders.map((founder, i) => (
              <Reveal key={founder.name} delay={i * 0.06}>
                <div>
                  <h3 className="mb-1 text-[17px] font-medium text-ink">{founder.name}</h3>
                  <p className="mb-3 font-mono text-[11px] tracking-[0.08em] text-dim">
                    {founder.role}
                  </p>
                  <p className="text-[13.5px] font-light text-muted">{founder.background}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </section>

        {/* SAFETY */}
        <section className="mx-auto max-w-[1100px] px-6 py-20">
          <Reveal>
            <p className="mb-6 font-mono text-xs tracking-[0.28em] text-dim">
              SAFETY &amp; COMPLIANCE
            </p>
            <div className="grid grid-cols-1 gap-x-10 gap-y-5 sm:grid-cols-2">
              {safetyHighlightsCompact.map((point) => (
                <p key={point} className="text-sm font-light text-muted">
                  {point}
                </p>
              ))}
            </div>
          </Reveal>
        </section>

        {/* CONTACT */}
        <section
          id="contact"
          className="mx-auto flex min-h-[90vh] max-w-[1100px] flex-col justify-center px-6 pb-16 pt-24"
        >
          <div className="grid grid-cols-1 gap-16 lg:grid-cols-5">
            <Reveal className="lg:col-span-2">
              <p className="mb-5 font-mono text-xs tracking-[0.28em] text-dim">05 · CONTACT</p>
              <h2 className="mb-5 font-serif text-[clamp(30px,3.6vw,46px)] font-light leading-[1.15] text-ink">
                Put a show in your sky.
              </h2>
              <p className="mb-8 max-w-[44ch] text-base font-light text-muted">
                Tell us about the event — the city, the date, the story you want the
                sky to tell. We reply within two working days.
              </p>
              <p className="font-mono text-sm text-ink">{contactInfo.email}</p>
              <p className="mt-2 font-mono text-xs text-dim">{contactInfo.base}</p>
            </Reveal>

            <Reveal delay={0.1} className="lg:col-span-3">
              <ContactForm />
            </Reveal>
          </div>
        </section>
      </div>
    </>
  );
}

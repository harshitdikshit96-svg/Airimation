// Central content store for the Airimation website.
// Pulled from the Airimation business plan, show blueprint, pitch deck and
// products blueprint. Figures are illustrative / assumption-based per those
// source documents and should be reviewed before any investor-facing use.

export const site = {
  name: "Airimation",
  // Deprecated: use `company.legalName`. Kept so older references keep
  // compiling; `company` is the single source of truth for statutory detail.
  legalName: "Airimation Technologies Private Limited",
  base: "Noida, Uttar Pradesh (Delhi NCR)",
  tagline:
    "Synchronised drone-swarm light shows for the moments a city, a festival or a family will remember.",
  shortDescription:
    "Airimation designs, builds and flies choreographed LED drone-swarm shows for civic celebrations, temple-town festivals, weddings and corporate events — a reusable, eco-friendly alternative to fireworks.",
};

// Copy for the cinematic, scroll-driven homepage ("Home v2"). Kept separate
// from the longer-form copy above (used on /shows, /about, etc.) because
// this page is a tighter, teaser-length narrative — the deep-dive pages
// remain the place for the fuller explanation.
export const homeHero = {
  eyebrow: "NOIDA · DELHI NCR · DRONE-SWARM LIGHT SHOWS",
  title: "The night sky, choreographed.",
  subtitle:
    "Hundreds of synchronised LED drones lift off, form, and dissolve — a light show for the moments a city, a festival or a family will remember. Scroll, and watch the swarm fly.",
};

export const homeChapters = [
  {
    id: "lift-off",
    index: "01 · LIFT-OFF",
    title: "Every show starts on the ground.",
    body: "Each drone is placed by hand, checked, and cleared. Then, on cue, the whole fleet rises together — silent, reusable, and leaving nothing behind but a memory. An eco-friendly answer to fireworks.",
  },
  {
    id: "open-sky",
    index: "02 · OPEN SKY",
    title: "A swarm that thinks as one.",
    body: "RTK GNSS positioning gives every aircraft centimetre accuracy. A dedicated telemetry link feeds live battery, GPS and health data to the ground station — hundreds of drones holding tight, safe formation.",
  },
];

// Shorter phrasing of the same four-step process as `processSteps`, sized
// for the compact homepage grid. /shows keeps the longer version.
export const showStepsCompact = [
  {
    step: "01",
    title: "Design",
    description:
      "Storyboard, 3D animation, then formation choreography — formations, transitions, colour and music synced into a single show file.",
  },
  {
    step: "02",
    title: "Validate",
    description:
      "Collision-free paths, minimum separation and battery margin verified in simulation before a single drone leaves the ground. Never skipped.",
  },
  {
    step: "03",
    title: "Permit",
    description:
      "Digital Sky flight permission, airspace segregation, night and swarm clearances — plus police, district and venue NOCs for the specific mission.",
  },
  {
    step: "04",
    title: "Perform",
    description:
      "The swarm flies live to layered safety SOPs: geofencing, auto return-to-launch, a manual kill-switch, and a dedicated safety officer throughout.",
  },
];

// Compact three-up version of `clientSegments`, for the homepage strip.
export const homeSegments = [
  {
    label: "Civic & public celebrations",
    sub: "City functions and public milestones",
  },
  {
    label: "Temple-town festivals",
    sub: "Ayodhya · Varanasi · Mathura · the Kumbh",
  },
  {
    label: "Weddings & launches",
    sub: "Premium venues, brands and agencies",
  },
];

// Four-item condensed version of `safetyPoints`, for the homepage grid
// (merges the insurance and safety-officer lines from the full list).
export const safetyHighlightsCompact = [
  // Statutory identity stated in words only — the registration numbers
  // themselves live in the footer and on /contact. The Drone Rules /
  // Digital Sky clause is deliberately left to the next line so this one
  // does not repeat it.
  "Airimation Technologies Private Limited is a DPIIT-recognised startup and a registered Udyam (MSME) enterprise.",
  "Operations under the Drone Rules, 2021, via the DGCA Digital Sky Platform, with NPNT-compliant geofencing on every aircraft.",
  "Audiences are always kept at a cordoned lateral standoff — our shows never fly over a crowd.",
  "Automatic return-to-launch on link loss or low battery, geofence auto-containment, and a manual all-land kill-switch on standby.",
  "Third-party and public-liability insurance on every show; a dedicated safety officer monitors the swarm for the full performance.",
];

// Short brand-pillar statements for the /shows hero — three quick, punchy
// claims about how a show works, not a factual/statistical claim (kept
// deliberately free of numbers we can't back up pre-first-show).
export const showPillars = [
  {
    title: "Engineered precision",
    description:
      "RTK-GNSS positioning and validated flight paths, so every formation holds its shape exactly as designed.",
  },
  {
    title: "Storytelling in the sky",
    description:
      "Every show is built around your moment — a name, a symbol, a message — not a stock formation reel.",
  },
  {
    title: "A safer, reusable spectacle",
    description:
      "The same visual impact as fireworks, without the debris, smoke or one-time cost.",
  },
];

// Teaser copy linking /shows to the two-track vision on /vision.
export const beyondShows = {
  eyebrow: "Beyond the shows",
  title: "Light shows are where this starts, not where it ends.",
  body: "The show business builds the fleet, the crew and the credibility. Once operations are stable, the same swarm know-how goes into a grant-funded R&D track — environmental sensing, civic monitoring and swarm-coordination research.",
};

// WHERE WE ARE — the honest, current state of the build. Shown on the home
// page and /vision. Update `status` as milestones land; nothing here may
// claim a flown show until one has flown.
export const buildStatus = {
  eyebrow: "WHERE WE ARE",
  title: "Our first prototype is built. Now we're making it lighter.",
  body: "Airimation's first in-house show drone exists — not a renamed import. We're now taking its weight below 250 grams, into the DGCA Nano category: lighter and safer around people, simpler to clear, and far easier to transport and turn around at fleet scale.",
  facts: [
    { label: "Prototype", value: "First drone built in-house" },
    { label: "In progress", value: "Weight down to Nano class — under 250 g" },
    { label: "Flight stack", value: "ArduPilot firmware · Skybrush show control" },
    { label: "Sourcing", value: "Components from Indian vendors only" },
  ],
};

export type NavLink = {
  href: string;
  label: string;
  /** Rendered in amber — one entry at most, or it stops being a highlight. */
  highlight?: boolean;
};

export const navLinks: NavLink[] = [
  { href: "/design-your-show", label: "Design a Show", highlight: true },
  { href: "/shows", label: "Shows" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/vision", label: "Vision" },
  { href: "/contact", label: "Contact" },
];

// Copy for /design-your-show. Kept here with everything else — this file is
// the single source of truth for site copy.
export const designYourShow = {
  eyebrow: "DESIGN A SHOW",
  title: "See it in the sky before you book it.",
  intro:
    "Most people have never stood under a drone show, so the hardest question is the simplest one: how many drones do you actually need? Pick a fleet size and watch what it can fly — every figure here is made from a real 3D model: museum scans of Ganesha and Nataraja, a scanned oil lamp, a damru, a bow and arrow, the Tiranga to its official specification. A bigger fleet flies a bigger, finer picture. Drag to walk all the way round.",
  quoteNote:
    "Tell us the date, the venue and the story — every real show is designed around your occasion, then safety-validated, before a single drone flies.",
  notes: [
    {
      title: "It is a simulation, sped up",
      body: "Simulated formations, not footage and not a flight plan. Every figure is choreographed to real drone speeds (under 8 m/s) and the preview plays it 1.8× faster. Effects — a flame, a drum beat, an arrow of light — are done with LEDs, the way a real show does them.",
    },
    {
      title: "Fleet size changes everything",
      body: "Drones keep a safe distance apart, so more drones means a bigger picture, not just a denser one — and room for detail. A hundred draws bold, simple objects; sculptures like Ganesha need five hundred or more. Our standard fleet is a hundred, flown in two packs of fifty; larger shows are arranged in advance.",
    },
    {
      title: "Your show is yours",
      body: "The library here is a starting point. A real Airimation show is built around your occasion — a name, a deity, an emblem, a message — rather than assembled from stock formations.",
    },
  ],
};

// Home-page teaser pointing at the configurator.
export const designTeaser = {
  eyebrow: "04 · DESIGN A SHOW",
  title: "How many drones does your sky need?",
  body: "Pick a fleet size — 100 to 2,000 drones — and watch what it can fly, from the Tiranga to a scanned Ganesha, live in 3D.",
  cta: "Design your show",
};

export const clientSegments = [
  {
    title: "Civic & Public Celebrations",
    description:
      "City and district functions, Republic Day and Independence Day celebrations, and public milestones — the single largest drone-show customer segment worldwide.",
    color: "amber",
  },
  {
    title: "Temple-Town Festivals",
    description:
      "Ayodhya, the Kumbh, Varanasi and Mathura sit inside one of India's richest religious-tourism calendars — a wedge no national operator is rooted in.",
    color: "cyan",
  },
  {
    title: "Premium Weddings",
    description:
      "An eco-friendly, reusable, unforgettable alternative to fireworks, sold through existing wedding-venue relationships across Uttar Pradesh.",
    color: "violet",
  },
  {
    title: "Corporate Launches",
    description:
      "Brand activations and product launches through agencies and real-estate developers, choreographed to a client's story and colours.",
    color: "green",
  },
];

export const processSteps = [
  {
    step: "01",
    title: "Design",
    description:
      "Every show begins as a storyboard, then 3D animation, then formation choreography — formations, transitions, colour and music synced into a single show file.",
  },
  {
    step: "02",
    title: "Validate",
    description:
      "Collision-free flight paths, minimum separation and battery-duration margin are verified in simulation before a single drone leaves the ground. This gate is never skipped.",
  },
  {
    step: "03",
    title: "Permit",
    description:
      "Digital Sky flight permission, a Temporary Segregated Area, and night / crowd / swarm operation clearances — plus local police, district and venue NOCs — are secured for the specific mission.",
  },
  {
    step: "04",
    title: "Perform",
    description:
      "The LED swarm flies live to layered safety SOPs: geofencing, automatic return-to-launch on link loss, a manual kill-switch, and a dedicated safety officer watching the swarm throughout.",
  },
];

export const droneSpecs = [
  {
    title: "Nano-class airframe",
    description:
      "Our show drone is being engineered below 250 grams — the DGCA Nano category. Less mass in the air, simpler to clear, easier to move at fleet scale.",
  },
  {
    title: "RTK GNSS positioning",
    description:
      "Centimetre-accurate positioning on every drone — the precision that lets hundreds of aircraft hold tight, safe formations.",
  },
  {
    title: "Telemetry radio link",
    description:
      "A dedicated radio channel per drone feeding live battery, GPS and health data to the ground control dashboard throughout the show.",
  },
  {
    title: "Programmable LED payload",
    description:
      "High-brightness, full-colour LEDs — the part of the drone every member of the audience actually sees.",
  },
];

export const safetyPoints = [
  "Operations under the Drone Rules, 2021, via the DGCA Digital Sky Platform, with NPNT-compliant geofencing on every aircraft.",
  "Audiences are always kept at a cordoned lateral standoff — our shows never fly over a crowd.",
  "Automatic return-to-launch or land on link loss or low battery, geofence auto-containment, and a manual all-land kill-switch on standby.",
  "Third-party liability and event public-liability insurance carried on every show, alongside hull and transit cover for the fleet.",
  "A dedicated safety officer monitors the swarm for the full duration of every performance.",
];

// The plan, dated. Year zero is 2027. The fleet grows in 50-drone packs;
// the minimum show is two packs (100 drones). Everything after "Now" is a
// plan, and is labelled as one wherever it is shown.
export const roadmap = [
  {
    year: "Now · 2026",
    heading: "Prototype to Nano",
    fleet: "1 prototype",
    detail: "First in-house drone built; weight coming down below 250 g for the DGCA Nano category.",
  },
  {
    year: "2027",
    heading: "Fly the first few",
    fleet: "2 drones by Q2 · 5 by year-end",
    detail: "Formation flight, safety SOPs and the full show pipeline proven on a small fleet.",
  },
  {
    year: "2028",
    heading: "The first 100",
    fleet: "100 drones · 6–8 shows",
    detail: "Two 50-drone packs. Test shows across Uttar Pradesh, then the first commercial shows.",
  },
  {
    year: "2029",
    heading: "Scale up",
    fleet: "Toward 500 drones",
    detail: "Operations and hiring scale; Uttar Pradesh, then NCR, then pan-India.",
  },
  {
    year: "Beyond",
    heading: "India, then the world",
    fleet: "International clients",
    detail: "Shows abroad — and the long-range goal: replacing the fireworks at Formula 1.",
  },
];

// VISION — two tracks, in order. Track 2 starts only once show operations
// are stable. Copy for /vision.
export const visionTracks = [
  {
    no: "01",
    label: "Track 1 · Light shows",
    title: "A 100-drone fleet, then the country, then the world.",
    body: "Build a 100-drone fleet and prove it with test shows in Uttar Pradesh. Grow the fleet and take bigger shows — Uttar Pradesh, then NCR, then pan-India, then international clients. The long-range goal is a single, specific one: replace the fireworks at Formula 1.",
    steps: ["Uttar Pradesh", "Delhi NCR", "Pan-India", "International", "Formula 1"],
  },
  {
    no: "02",
    label: "Track 2 · Research & development",
    title: "Swarm know-how, put to work on real problems.",
    body: "Once show operations are stable, the same skills — many aircraft, one plan, centimetre precision — go into grant-funded custom solutions, built for the partner who needs them rather than as a product looking for a buyer.",
    steps: [],
  },
];

export const rdDirections = [
  {
    title: "Waste-site detection",
    detail: "Camera payloads that find and map illegal dumping and waste sites for municipal and civic bodies.",
  },
  {
    title: "River-pollutant analysis",
    detail: "Spectrometer payloads that sample and map pollutants along a river, faster and wider than a boat crew can.",
  },
  {
    title: "Swarm-coordination research",
    detail: "Coordination and formation-control IP for defence research partners — strictly non-weaponised.",
  },
];

export const pledge = {
  title: "What we will never build",
  body: "Airimation will never make weapons of destruction — no armed drones, no kamikaze swarms, in any shape or form, irrespective of the money on the table.",
};

export const principles = [
  {
    title: "Made with Indian parts",
    body: "Every drone component is sourced from Indian vendors. It is slower some weeks; it is the company we want to be.",
  },
  {
    title: "Proven, open foundations",
    body: "ArduPilot on the aircraft and Skybrush for show control — mature open tools, so our effort goes into the airframe, the safety case and the show itself.",
  },
  {
    title: "People first",
    body: "An inclusive team, and real money spent on people's growth. A show only holds formation if the crew trust each other — that starts with how we treat them.",
  },
];

// TEAM
//
// Two groups: directors (Harshit Dixit, Madhuri Mishra) and advisors
// (Dr. Gaurav Tripathi, Dr. Neeraj Jain). The other advisors stay listed
// with `hidden: true` — kept for when they can be named, never rendered.
//
// `photo` is a path under /public — e.g. "/team/gaurav.jpg". Leave it unset
// until a real headshot exists; FounderAvatar falls back to initials so
// nothing breaks. Drop new photos in public/team/ (see that folder's note
// for naming and sizing) and fill in the path here — no other code changes
// needed.

export type TeamMember = {
  name: string;
  role: string;
  /** One compact line, for cards. */
  background: string;
  /** A fuller paragraph, for the /team page. */
  intro: string;
  photo?: string;
  /** Personal work address, shown on /team. */
  email?: string;
  /** Public profile, for verification. */
  profile?: string;
  /** Kept in config, never rendered. */
  hidden?: boolean;
};

export const advisors: TeamMember[] = [
  {
    name: "Prof. Rajeev Tripathi",
    role: "Chief Advisor",
    background:
      "Professor of Electronics & Communication Engineering, MNNIT Allahabad; former Director of MNNIT Allahabad and former Vice Chancellor of RGPV Bhopal.",
    intro:
      "Prof. Rajeev Tripathi chairs Airimation's advisory bench. A Professor of Electronics & Communication Engineering at MNNIT Allahabad, he has served as the institute's Director and as Vice Chancellor of RGPV Bhopal, bringing more than three decades in wireless communications, academic leadership and institutional governance.",
    photo: "/team/rajeev.jpg",
    hidden: true,
    profile: "https://www.linkedin.com/in/rajeev-tripathi-67a4953/",
  },
  {
    name: "Dr. Deepak Kumar Singh",
    role: "Advisor — Drone R&D and Institutional Relations",
    background:
      "PhD (IIT Kanpur); Dean at IIIT Lucknow; member of the UPTEC advisory board, Uttar Pradesh.",
    intro:
      "Dr. Deepak Kumar Singh advises Airimation on drone research and institutional relations. He holds a PhD from IIT Kanpur, serves as Dean at IIIT Lucknow, and sits on the advisory board of UPTEC in Uttar Pradesh — the intersection of research and public-sector delivery that this business depends on.",
    photo: "/team/deepak.jpg",
    hidden: true,
    profile: "https://www.linkedin.com/in/deepaksingh001/",
  },
  {
    name: "Dr. Vishal Krishna Singh",
    role: "Advisor — Flight Software and Real-Time Systems",
    background:
      "Lecturer, School of Computer Science and Electronic Engineering, University of Essex, UK; 10+ years in IoT and real-time systems.",
    intro:
      "Dr. Vishal Krishna Singh advises on flight software and real-time systems. A Lecturer in the School of Computer Science and Electronic Engineering at the University of Essex, his research spans the Internet of Things, machine learning and wireless sensor networks — the disciplines a swarm holding formation actually runs on.",
    photo: "/team/vishal.jpg",
    hidden: true,
    profile: "https://www.essex.ac.uk/people/SINGH43901/Vishal%20Krishna-Singh",
  },
  {
    name: "Dr. Gaurav Tripathi",
    role: "Advisor — Operations and Communication",
    background: "PhD, IIIT Lucknow; Assistant Professor at Bennett University.",
    intro:
      "Dr. Gaurav Tripathi advises on operations and communication — keeping partners, the team and every stakeholder working to one plan, and on the permissions and safety case that decide whether a show actually flies. He holds a PhD from IIIT Lucknow and is an Assistant Professor at Bennett University.",
    photo: "/team/gaurav.jpg",
    email: "gaurav@airimation.in",
  },
  {
    name: "Dr. Neeraj Jain",
    role: "Advisor — Technology and Research",
    background:
      "Associate Professor at Bennett University; 10+ years in drone technology and AI.",
    intro:
      "Dr. Neeraj Jain advises on technology and research — the hardware and software of the show drone, its RF link, and the direction of Airimation's research track. An Associate Professor at Bennett University with over a decade in drone technology and AI.",
    photo: "/team/neeraj.jpg",
    profile: "https://www.bennett.edu.in/faculties/dr-neeraj-jain/",
  },
];

export const directors: TeamMember[] = [
  {
    name: "Harshit Dixit",
    role: "Co-founder and Director — Technology, Hardware and Operations",
    background: "BTech, IIIT Lucknow; 5+ years of industry engineering.",
    intro:
      "Harshit Dixit co-founded Airimation and is its full-time director. He runs the hardware build — the prototype now being taken into the Nano category — alongside licences, compliance and the team, and builds the software pipeline that turns a client's occasion into a choreographed show. A BTech from IIIT Lucknow with five years of product engineering behind him.",
    photo: "/team/harshit.jpg",
    email: "harshit@airimation.in",
  },
  {
    name: "Madhuri Mishra",
    role: "Co-founder and Director — Research and Strategy",
    background: "PhD, IIIT Lucknow; Assistant Professor at UPES Dehradun.",
    intro:
      "Madhuri Mishra co-founded Airimation and leads research and strategy, keeping the R&D work on track and setting the direction for where the company flies next. She holds a PhD from IIIT Lucknow and is an Assistant Professor at UPES Dehradun.",
    photo: "/team/madhuri.png",
    email: "madhuri@airimation.in",
  },
];

/**
 * Team visibility. `showAdvisors: false` hides every advisor; otherwise
 * each advisor shows unless marked `hidden`. Pages read `visibleAdvisors`
 * and drop every advisor section when it is empty.
 */
export const teamConfig = {
  showAdvisors: true,
};

export const visibleAdvisors: TeamMember[] = teamConfig.showAdvisors
  ? advisors.filter((a) => !a.hidden)
  : [];

/**
 * Everyone shown on the site, advisors (when visible) first. `coreTeam` and
 * `founders` are aliases for the directors so existing imports keep working.
 */
export const coreTeam = directors;
export const founders = directors;
export const team: TeamMember[] = [...visibleAdvisors, ...directors];

export const orgTypes = [
  "Civic body / District Administration",
  "Temple Trust / Festival Committee",
  "Wedding Planner / Venue",
  "Corporate / Agency",
  "Investor / Partner",
  "Other",
];

/**
 * Statutory identity.
 *
 * These are STATEMENTS OF FACT, published as plain text. We deliberately do
 * not display the Startup India, MSME/Udyam or national-emblem logos:
 *  - the Startup India mark is DPIIT-owned and recognition alone grants no
 *    right to use it; private use needs prior written approval,
 *  - the MSME mark needs Ministry approval and is promotional/non-commercial
 *    only,
 *  - both, and the Udyam certificate itself, carry the State Emblem, whose
 *    reproduction is restricted by the State Emblem of India (Prohibition of
 *    Improper Use) Act, 2005.
 * Quoting the registration numbers is lawful, verifiable, and more useful to
 * a procurement officer than a badge.
 *
 * ⚠️ VERIFY `cin` AGAINST THE CERTIFICATE OF INCORPORATION BEFORE PUBLISHING.
 * The state code reads "UW", and there is no such Indian state code — Uttar
 * Pradesh is "UP", which is consistent with the GSTIN's 09 prefix and the
 * Udyam number's UP. Left exactly as supplied rather than silently corrected,
 * because this is a legal identifier.
 */
export const company = {
  legalName: "Airimation Technologies Private Limited",
  // Full numbers live in src/lib/registration.ts, which no page imports:
  // anything in this file reaches the browser (the footer is a client
  // component), so only masked forms belong here.
  cin: "U823" + "x".repeat(17),
  gstin: "09" + "x".repeat(13),
  udyam: "UDYAM-UP-" + "x".repeat(10),
  dpiit: "DIPP" + "x".repeat(6),
  /** Short form only on the site. */
  registeredOfficeShort: "Greater Noida, Uttar Pradesh",
};

/**
 * Registration numbers are shown MASKED on the site (Nov 2026 decision:
 * the full numbers gave away more than a marketing page needs to). The
 * real values are in src/lib/registration.ts.
 */
/** Credential lines for the footer strip, in display order (masked). */
export const credentials = [
  { label: "CIN", value: company.cin },
  { label: "GSTIN", value: company.gstin },
  { label: "Udyam (MSME)", value: company.udyam },
  { label: "DPIIT Startup", value: company.dpiit },
];

/**
 * The company's public email address. Every company mailto, the footer, the
 * contact page, the phone note and the JSON-LD read it from here. The only
 * other addresses published are the team's own @airimation.in addresses on
 * /team (src/lib/__tests__/content.test.ts).
 */
export const contactInfo = {
  email: "hello@airimation.in",
  base: "Noida, Uttar Pradesh (Delhi NCR)",
};

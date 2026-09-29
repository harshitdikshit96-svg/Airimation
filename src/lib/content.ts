// Central content store for the Airimation website.
// Pulled from the Airimation business plan, Biscope blueprint, pitch deck and
// products blueprint. Figures are illustrative / assumption-based per those
// source documents and should be reviewed before any investor-facing use.

export const site = {
  name: "Airimation",
  // The full registered legal entity name. Used anywhere a site needs to
  // state who legally operates it: footer, contact info, structured data —
  // not in casual brand copy (which just uses `name` above).
  legalName: "Airimation Technologies Private Limited",
  flagship: "Biscope",
  base: "New Delhi",
  tagline:
    "Synchronised drone-swarm light shows for the moments a state, a city or a family will remember.",
  shortDescription:
    "Airimation designs and performs Biscope: choreographed LED drone-swarm shows for government celebrations, temple-town festivals, weddings and corporate events — a fast-growing, eco-friendly alternative to fireworks.",
};

// Copy for the cinematic, scroll-driven homepage ("Home v2"). Kept separate
// from the longer-form copy above (used on /biscope, /about, etc.) because
// this page is a tighter, teaser-length narrative — the deep-dive pages
// remain the place for the fuller explanation.
export const homeHero = {
  eyebrow: "NEW DELHI, INDIA · DRONE-SWARM LIGHT SHOWS",
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
// for the compact homepage grid. /biscope keeps the longer version.
export const biscopeStepsCompact = [
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
  "Operations under the Drone Rules, 2021, via the DGCA Digital Sky Platform, with NPNT-compliant geofencing on every aircraft.",
  "Audiences are always kept at a cordoned lateral standoff — Biscope shows never fly over a crowd.",
  "Automatic return-to-launch on link loss or low battery, geofence auto-containment, and a manual all-land kill-switch on standby.",
  "Third-party and public-liability insurance on every show; a dedicated safety officer monitors the swarm for the full performance.",
];

// Short brand-pillar statements for the /biscope hero — three quick, punchy
// claims about how Biscope works, not a factual/statistical claim (kept
// deliberately free of numbers we can't back up pre-first-show).
export const biscopePillars = [
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

// Teaser copy linking /biscope to the longer-term roadmap on /vision —
// Biscope (the show business) funds and leads into the Academy and UAV R&D
// stages already described in full on /vision; this just cross-links them.
export const beyondBiscope = {
  eyebrow: "Beyond Biscope",
  title: "Biscope is where this starts, not where it ends.",
  body: "The show business builds the cash, the crew and the credibility for what comes next — an in-house training academy, and eventually, an indigenous UAV technology company.",
};

export const navLinks = [
  { href: "/design-your-show", label: "Design a Show" },
  { href: "/biscope", label: "Biscope" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/vision", label: "Vision" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

// Copy for /design-your-show. Kept here with everything else — this file is
// the single source of truth for site copy.
export const designYourShow = {
  eyebrow: "DESIGN A SHOW",
  title: "See it in the sky before you book it.",
  intro:
    "Most people have never stood under a drone show, so the hardest question to answer is the simplest one: how many drones do you actually need? Choose a fleet size and a few formations, and watch it play out over a night sky. Switch between fleet sizes while it runs — the difference is what you are really deciding.",
  notes: [
    {
      title: "It is a simulation",
      body: "These are simulated formations, not footage of a past show, and not a flight plan. The real choreography is designed and safety-validated after booking.",
    },
    {
      title: "Fleet size changes everything",
      body: "A hundred drones draws bold, clean shapes. More drones mean finer detail and larger formations. Our standard fleet is a hundred; larger shows are arranged in advance.",
    },
    {
      title: "Your show is yours",
      body: "The library here is a starting point. A real Biscope show is built around your occasion — a name, a deity, an emblem, a message — rather than assembled from stock formations.",
    },
  ],
};

// Home-page teaser pointing at the configurator.
export const designTeaser = {
  eyebrow: "04 · DESIGN A SHOW",
  title: "How many drones does your sky need?",
  body: "Pick a fleet size and a few formations, and watch a show play out over a night sky — then send the link to whoever else is deciding.",
  cta: "Design your show",
};

export const clientSegments = [
  {
    title: "Government & Public Celebrations",
    description:
      "State and district functions, Republic Day and Independence Day-adjacent civic events, and public milestones — the single largest drone-show customer segment worldwide.",
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
  "Audiences are always kept at a cordoned lateral standoff — Biscope shows never fly over a crowd.",
  "Automatic return-to-launch or land on link loss or low battery, geofence auto-containment, and a manual all-land kill-switch on standby.",
  "Third-party liability and event public-liability insurance carried on every show, alongside hull and transit cover for the fleet.",
  "A dedicated safety officer monitors the swarm for the full duration of every performance.",
];

export const roadmap = [
  {
    year: "Year 1",
    heading: "Stand it up",
    fleet: "100 drones · 12 shows",
    detail: "Certification cleared; first shows delivered.",
  },
  {
    year: "Year 2",
    heading: "Prove & diversify",
    fleet: "250 drones · 24 shows",
    detail: "Airimation Academy — our advanced training line — goes live.",
  },
  {
    year: "Year 3",
    heading: "Build the moat",
    fleet: "500 drones · 38 shows",
    detail: "Manufacturer-partnered firmware and a custom LED module.",
  },
  {
    year: "Year 4",
    heading: "Scale & start R&D",
    fleet: "1,000 drones · 52 shows",
    detail: "EBITDA-positive; NPNT firmware maturing; the R&D division opens.",
  },
  {
    year: "Year 5",
    heading: "Company, not operator",
    fleet: "1,300 drones · 65 shows",
    detail: "A divisional structure, with net profit within reach.",
  },
];

// TEAM
//
// Ordered ADVISORS FIRST, then the core team — the advisory bench is the
// strongest credibility signal Airimation has pre-first-show, so it leads.
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
  email?: string;
  /** Public profile, for verification. */
  profile?: string;
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
    profile: "https://www.linkedin.com/in/rajeev-tripathi-67a4953/",
  },
  {
    name: "Dr. Deepak Kumar Singh",
    role: "Advisor — Drone R&D and Government Relations",
    background:
      "PhD (IIT Kanpur); Dean at IIIT Lucknow; member of the UPTEC advisory board, Government of Uttar Pradesh.",
    intro:
      "Dr. Deepak Kumar Singh advises Airimation on drone research and on working with government. He holds a PhD from IIT Kanpur, serves as Dean at IIIT Lucknow, and sits on the advisory board of UPTEC under the Government of Uttar Pradesh — the intersection of research and public-sector delivery that this business depends on.",
    photo: "/team/deepak.jpg",
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
    profile: "https://www.essex.ac.uk/people/SINGH43901/Vishal%20Krishna-Singh",
  },
];

export const coreTeam: TeamMember[] = [
  {
    name: "Madhuri Mishra",
    role: "Co-founder and Director — Business Strategy and Expansion",
    background: "PhD, IIIT Lucknow; Assistant Professor at UPES Dehradun.",
    intro:
      "Madhuri Mishra co-founded Airimation and leads business strategy and expansion. She holds a PhD from IIIT Lucknow and is an Assistant Professor at UPES Dehradun, and sets the direction for where the company flies next and who it flies for.",
    photo: "/team/madhuri.png",
    email: "madhuri@airimation.in",
  },
  {
    name: "Harshit Dixit",
    role: "Co-founder and Chief Technology Officer — Show Design and Animation",
    background: "BTech, IIIT Lucknow; 5+ years of industry experience.",
    intro:
      "Harshit Dixit co-founded Airimation and leads technology, show design and animation. A BTech from IIIT Lucknow with five years of industry engineering behind him, he builds the pipeline that turns a client's occasion into a choreographed show file.",
    photo: "/team/harshit.jpg",
    email: "harshit@airimation.in",
  },
  {
    name: "Dr. Gaurav Tripathi",
    role: "Operations, Compliance and Client Relations",
    background: "PhD, IIIT Lucknow; Assistant Professor at Bennett University.",
    intro:
      "Dr. Gaurav Tripathi runs operations, compliance and client relations — the permissions, the safety case and the relationships that decide whether a show actually flies. He holds a PhD from IIIT Lucknow and is an Assistant Professor at Bennett University.",
    photo: "/team/gaurav.jpg",
    email: "gaurav@airimation.in",
  },
  {
    name: "Dr. Neeraj Jain",
    role: "RF and Communication Systems Lead, 3D Printing Lead",
    background:
      "Associate Professor at Bennett University; 10+ years in drone technology and AI.",
    intro:
      "Dr. Neeraj Jain leads RF and communication systems, and 3D printing. An Associate Professor at Bennett University with over a decade in drone technology and AI, he owns the radio link that keeps hundreds of aircraft talking to the ground station through a live show.",
    photo: "/team/neeraj.jpg",
    profile: "https://www.bennett.edu.in/faculties/dr-neeraj-jain/",
  },
];

/**
 * Advisors first, then the core team — the order used everywhere the whole
 * group is listed. `founders` is kept as an alias for the operating team so
 * existing imports keep working.
 */
export const team: TeamMember[] = [...advisors, ...coreTeam];
export const founders = coreTeam;

export const orgTypes = [
  "Government / District Administration",
  "Temple Trust / Festival Committee",
  "Wedding Planner / Venue",
  "Corporate / Agency",
  "Investor / Partner",
  "Other",
];

export const contactInfo = {
  // TODO: point this at your Google Workspace address once set up (e.g. hello@airimation.in)
  email: "hello@airimation.in",
  base: "New Delhi, India",
};

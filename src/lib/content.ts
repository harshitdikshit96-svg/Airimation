// Central content store for the Airmation website.
// Pulled from the Airmation business plan, Biscope blueprint, pitch deck and
// products blueprint. Figures are illustrative / assumption-based per those
// source documents and should be reviewed before any investor-facing use.

export const site = {
  name: "Airmation",
  flagship: "Biscope",
  base: "New Delhi",
  tagline:
    "Synchronised drone-swarm light shows for the moments a state, a city or a family will remember.",
  shortDescription:
    "Airmation designs and performs Biscope: choreographed LED drone-swarm shows for government celebrations, temple-town festivals, weddings and corporate events — a fast-growing, eco-friendly alternative to fireworks.",
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

export const navLinks = [
  { href: "/biscope", label: "Biscope" },
  { href: "/about", label: "About" },
  { href: "/team", label: "Team" },
  { href: "/vision", label: "Vision" },
  { href: "/gallery", label: "Gallery" },
  { href: "/contact", label: "Contact" },
];

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
    detail: "Airmation Academy — our advanced training line — goes live.",
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

// `photo` is a path under /public — e.g. "/team/gaurav-tripathi.jpg". Leave it
// unset until a real headshot is added; FounderAvatar falls back to an
// initials placeholder so nothing breaks in the meantime. Drop new photos in
// public/team/ (see that folder's note for naming/sizing) and just fill in
// the path here — no other code changes needed.
export const founders = [
  {
    name: "Madhuri Tripathi",
    role: "CEO",
    background:
      "PhD in Graph Neural Networks and UAV research; turns complex engineering challenges into aerial spectacle.",
    intro:
      "Madhuri leads Airmation as CEO. Driven by deep expertise and a PhD in Graph Neural Networks and UAV research, she transforms complex technical challenges into breathtaking aerial spectacles — her leadership bridges the gap between sophisticated engineering and artistic excellence.",
    photo: "/team/madhuri.png",
  },
  {
    name: "Dr. Gaurav Tripathi",
    role: "CPO / CTO — Autonomous Systems & Engineering",
    background:
      "PhD in IoT, drones and machine learning (IIIT Lucknow); founding member of GE Vernova.",
    intro:
      "Dr. Gaurav Tripathi engineers Airmation's proprietary autonomous swarm technology — the reliable navigation and precise synchronisation that make high-stakes flight possible. A founding member of GE Vernova, he holds a PhD in IoT, drones and machine learning from IIIT Lucknow, and previously built an agricultural drone.",
    photo: "/team/gaurav.jpg",
  },
  {
    name: "Harshit Dixit",
    role: "CAIO / COO — AI Governance & Operations",
    background:
      "BTech (IIIT Lucknow); bridges AI governance with creative direction across global operations.",
    intro:
      "Harshit bridges AI governance with cutting-edge animation as Airmation's CAIO/COO, orchestrating global operations so every performance is as technically robust as it is visually extraordinary. A BTech from IIIT Lucknow, he left a senior role at Tata to found Airmation.",
    photo: "/team/harshit.jpg",
  },
  {
    name: "Sandeep Srivastava",
    role: "Advisor — Infrastructure & Security",
    background: "PhD in Blockchain; secures Airmation's infrastructure and data transmissions.",
    intro:
      "Sandeep advises Airmation as a seasoned industry leader with a PhD in Blockchain, fortifying the company's infrastructure against interference. His strategic oversight guarantees the secure, encrypted data transmissions essential for flawless mission execution.",
    photo: "/team/sandeep.jpg",
  },
];

export const orgTypes = [
  "Government / District Administration",
  "Temple Trust / Festival Committee",
  "Wedding Planner / Venue",
  "Corporate / Agency",
  "Investor / Partner",
  "Other",
];

export const contactInfo = {
  // TODO: point this at your Google Workspace address once set up (e.g. hello@airmation.in)
  email: "hello@airmation.in",
  base: "New Delhi, India",
};

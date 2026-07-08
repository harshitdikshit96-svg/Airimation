// Central content store for the Airmation website.
// Pulled from the Airmation business plan, Biscope blueprint, pitch deck and
// products blueprint. Figures are illustrative / assumption-based per those
// source documents and should be reviewed before any investor-facing use.

export const site = {
  name: "Airmation",
  flagship: "Biscope",
  base: "Lucknow, Uttar Pradesh",
  tagline:
    "Synchronised drone-swarm light shows for the moments a state, a city or a family will remember.",
  shortDescription:
    "Airmation designs and performs Biscope: choreographed LED drone-swarm shows for government celebrations, temple-town festivals, weddings and corporate events — a fast-growing, eco-friendly alternative to fireworks.",
};

export const navLinks = [
  { href: "/biscope", label: "Biscope" },
  { href: "/about", label: "About" },
  { href: "/vision", label: "Vision" },
  { href: "/gallery", label: "Gallery" },
  { href: "/investors", label: "Investors" },
  { href: "/contact", label: "Contact" },
];

export const heroStats = [
  { value: "100 → 1,300", label: "Planned drone fleet, Year 1 to Year 5" },
  { value: "18%", label: "Share of global drone shows bought by governments — our core buyer" },
  { value: "Year 4", label: "Targeted EBITDA-positive milestone" },
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

export const productLines = [
  {
    tag: "Core · Year 1+",
    title: "Biscope",
    description:
      "Drone-swarm light shows for government, festival, wedding and corporate events. The revenue engine, and the reason Airmation exists.",
    href: "/biscope",
  },
  {
    tag: "Year 2+",
    title: "Airmation Academy",
    description:
      "A specialised academy for the advanced swarm-choreography and drone-show skills almost no one else can teach — built on what Biscope proves in the field.",
    href: "/vision",
  },
  {
    tag: "Year 4+",
    title: "UAV R&D",
    description:
      "Civilian drone-as-a-service and dual-use research — infrastructure inspection, government and smart-city work — funded largely by non-dilutive grants.",
    href: "/vision",
  },
];

export const founders = [
  {
    name: "Gaurav Tripathi",
    role: "CEO / CTO — Technology, R&D, Grant Strategy",
    background:
      "PhD in IoT, drones and machine learning (IIIT Lucknow); previously built an agricultural drone.",
  },
  {
    name: "Harshit Dixit",
    role: "COO — Operations, Business, Partnerships",
    background: "BTech (IIIT Lucknow); left a senior role at Tata to found Airmation.",
  },
  {
    name: "Anshuman",
    role: "Hardware Lead",
    background: "Hardware engineering — drone build and manufacturing liaison.",
  },
  {
    name: "Adarsh Shukla",
    role: "Software Lead",
    background: "Senior Software Engineer, Google — ground control and fleet management.",
  },
];

export const positioning = {
  incumbent: {
    name: "BotLab Dynamics",
    points: [
      "$14.3M raised, 10,000+ drones in the fleet",
      "500+ shows across 200+ cities and 15 countries",
      "Multiple Guinness World Records; largely in-house technology stack",
      "Wins national, scale- and record-driven contracts",
    ],
  },
  airmation: {
    points: [
      "Rooted in Uttar Pradesh, where no national player is based",
      "Wins the 100–500-drone regional event — government, temple-town, wedding, corporate",
      "Competes on presence, responsiveness and relationships, not on price",
      "Existing wedding-venue relationships act as a ready sales channel",
    ],
  },
  summary:
    "We do not fight BotLab Dynamics for national, record-driven contracts — we would lose that game. We win the regional, relationship-driven market in Uttar Pradesh that a Delhi-based national operator structurally cannot serve as well.",
};

export const marketFacts = [
  {
    stat: "18%",
    label: "of all drone shows worldwide are bought by city and local governments — the single largest customer segment, and Airmation's core buyer.",
  },
  {
    stat: "3.28 lakh",
    label: "villages already drone-surveyed under India's SVAMITVA scheme — a signal of how deep government drone adoption already runs.",
  },
  {
    stat: "₹100–250 cr",
    label: "estimated size of India's drone-show market today, on a path toward ₹300–500 cr by 2030.",
  },
];

export const investorHighlights = [
  { value: "₹15.4 cr", label: "Projected Year-5 revenue (base case)" },
  { value: "Year 4", label: "Targeted EBITDA-positive" },
  { value: "Year 6", label: "Targeted net-profit-positive" },
  { value: "100 → 1,300", label: "Fleet ramp, Year 1 to Year 5" },
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
  base: "Lucknow, Uttar Pradesh, India",
};

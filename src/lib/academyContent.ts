// Content for the internal "Academy" learning game (`/internal`). This is a
// separate, employee-facing knowledge base — not customer marketing copy —
// so facts here are written for clarity and completeness (technical
// nomenclature explained plainly, sources noted on anything time-sensitive)
// rather than for persuasion. Where this content duplicates something in
// `content.ts` (roadmap, founders, client segments), it imports from there
// directly rather than re-typing it, so the two can't drift out of sync.
//
// World-record figures were verified via web search in July 2026 and are
// dated/sourced inline — these change often, so re-check before reusing this
// content much later.

export const academyMeta = {
  title: "Airimation Academy",
  subtitle: "The internal one — learn the business, the tech, and the sky, one level at a time.",
  tagline:
    "Built for anyone joining Airimation, whatever your background. No drone experience required — just curiosity.",
};

// ---------------------------------------------------------------------------
// Chapter 1: What Airimation actually is, in the simplest possible terms.
// ---------------------------------------------------------------------------
export const missionPrimer = {
  simple:
    "Airimation is a company in New Delhi that flies hundreds of tiny flying robots — drones — in the night sky, together, in perfect formation, with colourful lights on them. From the ground it looks like a moving painting made of stars. That's a drone light show, and our version of it is called Biscope.",
  whyItMatters: [
    {
      title: "It replaces fireworks",
      detail:
        "Fireworks burn, pollute the air, scare animals, and leave litter. A drone show makes light without fire, smoke, or noise — and every drone flies home and gets used again next time.",
    },
    {
      title: "It's a story, not just lights",
      detail:
        "Every show is choreographed to tell something — a client's brand, a festival's meaning, a couple's story — the same way a film is edited to music, not just a collection of pretty shots.",
    },
    {
      title: "It's a real, fast-growing industry",
      detail:
        "Drone shows have gone from art-school experiments a decade ago to 30,000+ drone spectacles today (see Chapter 2) — and India is now setting world records too, not just watching them.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Chapter 2: History + Guinness World Records — the "wow, really?" chapter.
// ---------------------------------------------------------------------------
export type TimelineEvent = {
  year: string;
  title: string;
  detail: string;
  source?: string;
};

export const historyTimeline: TimelineEvent[] = [
  {
    year: "~2012",
    title: "The first \"Spaxels\"",
    detail:
      "Ars Electronica Futurelab, an Austrian art-and-technology lab, flew some of the earliest documented synchronised quadcopter light formations — they called the concept \"Spaxels\" (space pixels). A handful of drones, but the core idea of this entire industry starts here: a drone isn't a vehicle, it's a pixel you can fly.",
  },
  {
    year: "2015–16",
    title: "Intel enters, at scale",
    detail:
      "Intel's \"Shooting Star\" drones turned the art-project idea into an engineered, repeatable product, and set early Guinness World Records for most UAVs airborne at once — first around 100, then 500 drones within about a year.",
  },
  {
    year: "2018",
    title: "The Olympics moment",
    detail:
      "Ahead of the Winter Olympics opening ceremony in PyeongChang, South Korea, Intel quietly flew 1,218 drones in a practice flight (the footage aired during the broadcast) — the moment drone shows went from \"cool tech demo\" to something a global TV audience associated with the Olympics.",
  },
  {
    year: "Oct 2024",
    title: "India enters the record books",
    detail:
      "BotLab Dynamics, an IIT-Delhi-incubated Indian company, flew 5,500 indigenously built drones at the Amaravati Drone Summit in Andhra Pradesh — a 12-minute, seven-formation show that set five Guinness World Records in a single night. This is the single most important data point for Airimation: India can now compete at world-record scale, and the company doing it isn't based abroad.",
    source: "BotLab Dynamics / Guinness World Records, Oct 2024",
  },
  {
    year: "2025",
    title: "A tiger in the sky",
    detail:
      "BotLab Dynamics set a sixth Guinness World Record at the Mysuru Dasara festival: 2,983 drones forming the \"largest aerial display of a mammal\" — a tiger. Worth noting for us: the record wasn't about raw drone count, it was about a specific, recognisable, culturally meaningful formation — precision and story, not just scale.",
    source: "BotLab Dynamics, Mysuru Dasara 2025",
  },
  {
    year: "Feb 2026",
    title: "22,580 drones, one computer",
    detail:
      "At China Media Group's Spring Festival Gala in Hefei, EHang flew 22,580 drones simultaneously under the control of a single computer — a distinct Guinness World Record category from raw drone count, because coordinating that many aircraft from one control system is its own engineering problem.",
    source: "Guinness World Records / EHang, Feb 2026",
  },
  {
    year: "May 2026",
    title: "The current record: 33,615 drones",
    detail:
      "In Dujiangyan, Sichuan, China, 33,615 drones flew simultaneously in a single show — the current Guinness World Record for the most drones flown simultaneously, full stop. That's the number to know if anyone asks \"what's the world record.\"",
    source: "Guinness World Records, May 2026",
  },
];

export const funFacts = [
  "A single Biscope drone is, technically, just a flying pixel with a GPS chip — the light show is really a very large, very literal video screen made of individually flying LEDs.",
  "The record for \"largest aerial image formed by drones\" (11,787 drones, Chongqing) is a different category from \"most drones flown simultaneously\" — Guinness treats scale, precision-of-image, and single-computer control as separate records, because each is a different engineering challenge.",
  "Modern show drones don't fly themselves moment-to-moment — every position at every second of the show is pre-computed and simulated on the ground long before the show, then simply played back, with each drone's onboard flight controller handling only the moment-to-moment stability.",
  "Because every drone flies the same pre-validated show file, a well-run drone show is one of the most repeatable live spectacles that exists — the 500th performance can be as precise as the 1st, which is not true of fireworks.",
];

// ---------------------------------------------------------------------------
// Chapter 3: Quadcopter 101 — the physical machine, explained for anyone.
// ---------------------------------------------------------------------------
export type QuadPart = {
  id: string;
  name: string;
  nickname: string;
  simple: string;
  technical: string;
  position: { x: number; y: number }; // percentage-based hotspot position on the diagram
};

export const quadcopterParts: QuadPart[] = [
  {
    id: "frame",
    name: "Frame",
    nickname: "The skeleton",
    simple:
      "The arms and body that everything else bolts onto. Light but stiff, so the drone doesn't flex mid-air.",
    technical:
      "Usually carbon-fibre or reinforced plastic for a high stiffness-to-weight ratio — every gram here is a gram not spent on battery or payload.",
    position: { x: 50, y: 52 },
  },
  {
    id: "motors",
    name: "Brushless motors (×4)",
    nickname: "The muscles",
    simple:
      "One spinning motor at the end of each arm. Speed them up, the propeller pushes more air, the drone goes up.",
    technical:
      "Brushless DC motors — no physical brush contacts wearing down inside, so they're more efficient, run cooler, and last far longer at high RPM than brushed motors.",
    position: { x: 50, y: 15 },
  },
  {
    id: "propellers",
    name: "Propellers",
    nickname: "The air-pushers",
    simple:
      "Spinning blades that shove air downward. Push air down hard enough, and by simple physics (every push has an equal push back) the drone gets shoved up.",
    technical:
      "Two spin clockwise, two spin counter-clockwise — that's what cancels out the spinning motion (torque) so the drone's body doesn't just twirl in place.",
    position: { x: 50, y: 6 },
  },
  {
    id: "esc",
    name: "ESC (Electronic Speed Controller)",
    nickname: "The motor's translator",
    simple:
      "One tiny box per motor that takes a command like \"spin faster\" and actually delivers the electricity to make that motor obey, instantly.",
    technical:
      "Converts battery DC power into the precisely timed 3-phase AC signal each brushless motor needs, updated hundreds of times per second from the flight controller.",
    position: { x: 68, y: 30 },
  },
  {
    id: "fc",
    name: "Flight Controller (FC)",
    nickname: "The brain",
    simple:
      "A small onboard computer that decides, many times every second, exactly how fast each of the 4 motors should spin to keep the drone steady and on its planned path.",
    technical:
      "Runs a control loop (commonly 100s–1000s of times per second) that reads sensor data and outputs per-motor speed commands — the core of every autopilot ever built.",
    position: { x: 50, y: 40 },
  },
  {
    id: "imu",
    name: "IMU (Inertial Measurement Unit)",
    nickname: "The inner ear",
    simple:
      "Sensors that feel tilting, spinning, and speeding up — the same job your inner ear does when you close your eyes and still know which way is \"up.\"",
    technical:
      "A combined accelerometer + gyroscope (sometimes + magnetometer) feeding the flight controller's stabilisation loop.",
    position: { x: 42, y: 40 },
  },
  {
    id: "gnss",
    name: "GPS / RTK GNSS receiver",
    nickname: "The precise sense of place",
    simple:
      "Regular GPS on your phone knows which building you're in. RTK GPS knows which brick. That's the difference between drones that might bump each other and 500 drones flying one metre apart, safely.",
    technical:
      "RTK (Real-Time Kinematic) corrects standard GNSS positioning using a fixed ground reference station, taking accuracy from metres down to centimetres — essential for tight-formation swarm safety.",
    position: { x: 50, y: 25 },
  },
  {
    id: "battery",
    name: "LiPo battery",
    nickname: "The fuel tank",
    simple:
      "A lightweight rechargeable battery. It's swapped out and recharged between shows, not thrown away — part of why this is more eco-friendly than fireworks.",
    technical:
      "Lithium-polymer cells, chosen for their high energy density relative to weight — flight time is one of the tightest constraints in show design.",
    position: { x: 50, y: 65 },
  },
  {
    id: "radio",
    name: "Radio / telemetry link",
    nickname: "The phone line home",
    simple:
      "A constant two-way radio connection so the ground crew always knows this drone's battery level, position, and health — and can send it an emergency \"land now\" command.",
    technical:
      "A dedicated telemetry channel per drone (separate from the show-position data) streaming live health/GPS/battery to the ground control dashboard throughout the performance.",
    position: { x: 30, y: 25 },
  },
  {
    id: "led",
    name: "Programmable LED payload",
    nickname: "The actual product",
    simple:
      "The bright, full-colour light the audience actually watches. Everything else on this list exists purely to get this light to the right point in the sky at the right second.",
    technical:
      "High-brightness, individually addressable RGB LEDs — colour and brightness are programmed per-frame as part of the show file, exactly like a pixel in a video.",
    position: { x: 50, y: 75 },
  },
];

export const howItFlies = {
  intro:
    "One drone hovering steady looks simple. It isn't — the flight controller is making constant tiny corrections, far faster than a human could react, and it's doing four different kinds of movement at once:",
  moves: [
    {
      name: "Lift / descend",
      detail: "Speed up all 4 motors equally → more downward air → the drone rises. Slow them equally → it sinks.",
    },
    {
      name: "Pitch / roll (move forward, back, sideways)",
      detail:
        "Speed up the motors on one side, slow the opposite side → the drone tips slightly and \"falls\" sideways in a controlled way, which is how it actually moves horizontally.",
    },
    {
      name: "Yaw (spin left or right)",
      detail:
        "Speed up the two clockwise-spinning motors slightly more than the two counter-clockwise ones (or vice-versa) → the tiny leftover twisting force spins the whole drone.",
    },
    {
      name: "Hold still (the hard part)",
      detail:
        "Wind, tiny motor differences, and gravity are always nudging the drone off course. The IMU feels every nudge, and the flight controller counter-nudges the motors — hundreds of times a second — so it looks perfectly still to us.",
    },
  ],
};

// ---------------------------------------------------------------------------
// Chapter 4: Swarm science — how ONE drone becomes a choreographed HUNDRED.
// ---------------------------------------------------------------------------
export const swarmConcepts = [
  {
    title: "RTK GNSS positioning",
    simple:
      "Every drone knows exactly where it is, down to a few centimetres — that precision is the only reason hundreds of them can fly close together without a safety disaster.",
  },
  {
    title: "Telemetry radio link",
    simple:
      "Every drone constantly \"phones home\" its battery, position and health to the ground station — so if something's wrong with drone #212, the crew knows before the audience ever would.",
  },
  {
    title: "Choreography software",
    simple:
      "The show is animated in 3D on a computer first — like a film's VFX — then converted into an exact flight path and light cue for every single drone, all synced to music.",
  },
  {
    title: "Collision-free simulation",
    simple:
      "Before a single drone leaves the ground, the entire show is run in simulation to check no two drones ever get too close and every drone has enough battery margin — this gate is never skipped.",
  },
  {
    title: "Geofencing",
    simple:
      "An invisible, GPS-defined fence the software will not let a drone cross, no matter what — it's a safety net that doesn't rely on anyone reacting fast enough.",
  },
  {
    title: "Auto return-to-launch",
    simple:
      "If a drone loses its radio link or gets low on battery, it doesn't panic — it automatically flies itself back and lands, no human input needed.",
  },
  {
    title: "The kill-switch",
    simple:
      "One manual button that means \"everyone land, right now\" — the ultimate override, always staffed and always ready, for the situations no software anticipated.",
  },
  {
    title: "Digital Sky flight permission",
    simple:
      "India's drone shows fly under the Drone Rules, 2021, cleared through the DGCA's Digital Sky platform — plus local police, district and venue no-objection certificates for that specific event, every time.",
  },
];

export const showPipeline = [
  {
    step: "01 · Design",
    detail:
      "Storyboard → 3D animation → formation choreography. Formations, transitions, colour and music are synced into a single show file, the same way a film goes from script to final edit.",
  },
  {
    step: "02 · Validate",
    detail:
      "Collision-free flight paths, minimum drone-to-drone separation, and battery margin are verified in simulation. Never skipped, no matter the deadline.",
  },
  {
    step: "03 · Permit",
    detail:
      "Digital Sky flight permission, a temporary segregated airspace, and night/crowd/swarm clearances — plus local police, district and venue NOCs — secured for that specific date and place.",
  },
  {
    step: "04 · Perform",
    detail:
      "The swarm flies live under geofencing, auto return-to-launch, a manual kill-switch, and a dedicated safety officer watching the entire performance.",
  },
];

// ---------------------------------------------------------------------------
// Chapter 5: The business — who we serve, why now, and who else is playing.
// ---------------------------------------------------------------------------
export const opportunityPoints = [
  {
    title: "Fireworks are getting harder to justify",
    detail:
      "Air quality, fire risk, and noise complaints have pushed courts and city authorities across India toward tighter firecracker restrictions around festivals — a reusable, silent, smoke-free alternative solves a problem venues and governments already have.",
  },
  {
    title: "A calendar no outsider owns",
    detail:
      "Airimation is close to one of India's richest religious-tourism calendars — Ayodhya, Varanasi, Mathura, the Kumbh — recurring, high-visibility events a nationally-scaled competitor isn't regionally rooted in.",
  },
  {
    title: "It's a service business, not a drone-manufacturing business",
    detail:
      "Airimation sells the choreographed experience (Biscope), the way an event production company sells a show — not the hardware. That keeps the business closer to storytelling and client relationships than to manufacturing margins.",
  },
];

export const competitiveLandscape = {
  headline: "BotLab Dynamics — the domestic benchmark",
  detail:
    "BotLab Dynamics (IIT-Delhi-incubated) is India's current drone-show scale leader: 5,500 drones and five Guinness World Records at the Amaravati Drone Summit (Oct 2024), plus a sixth record at Mysuru Dasara (2025, a 2,983-drone tiger formation). They're the reference point for \"what's possible in India right now,\" not a company to imitate move-for-move.",
  takeaway:
    "Airimation's opening wedge isn't out-scaling the national leader on drone count — it's owning a regional calendar (UP's temple-towns, civic and wedding markets) with the same engineering discipline (Design → Validate → Permit → Perform) that any credible operator needs.",
};

// roadmap, founders, and clientSegments are intentionally NOT duplicated here
// — the Academy page imports them directly from `content.ts` so the business
// plan can only ever be edited in one place.

// ---------------------------------------------------------------------------
// Chapter 6: The knowledge check — a scored quiz over everything above.
// ---------------------------------------------------------------------------
export type QuizQuestion = {
  id: string;
  topic: string;
  question: string;
  options: string[];
  correct: number;
  explain: string;
};

export const quizQuestions: QuizQuestion[] = [
  {
    id: "q1",
    topic: "Flight physics",
    question: "What actually makes a drone go up?",
    options: [
      "The propellers push air downward, and the air pushes the drone back up",
      "A small internal balloon fills with helium",
      "Magnets in the frame repel the ground",
      "The LEDs generate lift when lit",
    ],
    correct: 0,
    explain:
      "Simple physics: pushing air down hard enough means the air pushes back up on the drone just as hard — that's lift.",
  },
  {
    id: "q2",
    topic: "Quadcopter parts",
    question: "What does the ESC (Electronic Speed Controller) actually do?",
    options: [
      "Stores the show's music",
      "Delivers precisely timed power to one motor, on the flight controller's command",
      "Talks to the GPS satellites",
      "Holds the drone's serial number",
    ],
    correct: 1,
    explain:
      "Each motor gets its own ESC — it's the translator between \"spin faster\" (a digital command) and actual electrical power.",
  },
  {
    id: "q3",
    topic: "Positioning",
    question: "Why does a show drone need RTK GPS instead of regular phone-grade GPS?",
    options: [
      "It's cheaper",
      "It works better indoors",
      "It's accurate to centimetres instead of metres — essential when drones fly close together",
      "It doesn't need satellites",
    ],
    correct: 2,
    explain:
      "Regular GPS might know which building you're in; RTK GPS knows which brick. That precision is what keeps hundreds of drones from colliding.",
  },
  {
    id: "q4",
    topic: "Safety",
    question: "What is the manual kill-switch for?",
    options: [
      "Turning off the show music",
      "An instant \"everyone land right now\" override, for situations software didn't anticipate",
      "Recharging all batteries at once",
      "Switching the LED colour scheme",
    ],
    correct: 1,
    explain: "It's the human override sitting above every automated safety system — always staffed, always ready.",
  },
  {
    id: "q5",
    topic: "Safety",
    question: "What does geofencing do?",
    options: [
      "Draws an invisible boundary the software will not let a drone cross",
      "Blocks other people's Wi-Fi near the show",
      "Paints a fence-shaped formation in the sky",
      "Limits how many drones can fly at once",
    ],
    correct: 0,
    explain: "It's a GPS-based safety boundary — a hard limit that doesn't depend on a human reacting fast enough.",
  },
  {
    id: "q6",
    topic: "Regulation",
    question: "Which platform issues India's drone flight permissions?",
    options: ["Google Maps", "The DGCA's Digital Sky platform", "A private drone insurance company", "NASA"],
    correct: 1,
    explain: "Every Biscope show flies under the Drone Rules, 2021, cleared through DGCA Digital Sky, plus local NOCs.",
  },
  {
    id: "q7",
    topic: "Business",
    question: "What does Airimation primarily sell?",
    options: [
      "Drones, to other companies",
      "A choreographed light-show experience for events (Biscope)",
      "GPS chips",
      "Firework replacement kits",
    ],
    correct: 1,
    explain: "It's a service business — the choreography and performance are the product, not the hardware itself.",
  },
  {
    id: "q8",
    topic: "World records",
    question: "How many drones did BotLab Dynamics fly at the Amaravati Drone Summit (Oct 2024), setting 5 Guinness World Records?",
    options: ["550", "1,218", "5,500", "22,580"],
    correct: 2,
    explain: "5,500 indigenously built drones, in a 12-minute, seven-formation show — India's entry into world-record territory.",
  },
  {
    id: "q9",
    topic: "World records",
    question: "As of mid-2026, what's the Guinness World Record for most drones flown simultaneously in one show, and where?",
    options: [
      "5,500 in Andhra Pradesh, India",
      "1,218 in PyeongChang, South Korea",
      "33,615 in Dujiangyan, China (May 2026)",
      "500 in Hamburg, Germany",
    ],
    correct: 2,
    explain: "33,615 drones in Dujiangyan, Sichuan — the current overall record. (EHang's 22,580 is a separate \"single computer\" category record.)",
  },
  {
    id: "q10",
    topic: "Show pipeline",
    question: "What are Biscope's four pipeline steps, in order?",
    options: [
      "Perform → Permit → Validate → Design",
      "Design → Validate → Permit → Perform",
      "Validate → Design → Perform → Permit",
      "Permit → Design → Perform → Validate",
    ],
    correct: 1,
    explain: "Storyboard/animate first, then simulate for safety, then get cleared to fly, then actually perform.",
  },
  {
    id: "q11",
    topic: "Business",
    question: "Which of these is NOT one of Airimation's four core client segments?",
    options: [
      "Government & public celebrations",
      "Temple-town festivals",
      "Premium weddings",
      "International airline advertising",
    ],
    correct: 3,
    explain: "The four are government/civic, temple-town festivals, weddings, and corporate launches — not airline advertising.",
  },
  {
    id: "q12",
    topic: "Roadmap",
    question: "According to the 5-year roadmap, what major milestone is planned for Year 2?",
    options: [
      "The R&D division opens",
      "Airimation Academy (the training line) goes live",
      "Net profit is reached",
      "1,000 drones in the fleet",
    ],
    correct: 1,
    explain: "Year 2 is \"Prove & diversify\" — 250 drones, 24 shows, and Airimation Academy launching.",
  },
  {
    id: "q13",
    topic: "Flight physics",
    question: "Why do two of a quadcopter's four propellers spin clockwise and two spin counter-clockwise?",
    options: [
      "It looks better",
      "It cancels out the twisting force, so the drone's body doesn't spin uncontrollably",
      "It's required by law",
      "It saves battery",
    ],
    correct: 1,
    explain: "Without opposite-spinning pairs, the whole drone would just twirl from the leftover rotational force (torque).",
  },
  {
    id: "q14",
    topic: "Safety",
    question: "True or false: a Biscope show ever flies directly over the audience.",
    options: ["True — that's the best angle", "False — audiences are always kept at a cordoned lateral standoff"],
    correct: 1,
    explain: "Biscope shows never fly over a crowd — a hard safety rule, not a preference.",
  },
  {
    id: "q15",
    topic: "World records",
    question: "What did BotLab Dynamics' 2025 Mysuru Dasara record (2,983 drones) actually demonstrate?",
    options: [
      "Sheer drone count above all else",
      "That a swarm can form a specific, recognisable image (a tiger) — precision and story, not just scale",
      "The fastest-ever drone show setup time",
      "The first-ever underwater drone show",
    ],
    correct: 1,
    explain: "The record category was \"largest aerial display of a mammal\" — about recognisable formation, not raw numbers.",
  },
];

export type BadgeTier = { min: number; name: string; blurb: string };

export const badgeTiers: BadgeTier[] = [
  {
    min: 0,
    name: "Ground Crew",
    blurb: "You've landed the basics. Rewatch a chapter or two and try again — this stuff clicks fast.",
  },
  {
    min: 7,
    name: "Flight Trainee",
    blurb: "Solid grasp of the fundamentals. A couple more passes and you'll know this cold.",
  },
  {
    min: 11,
    name: "Swarm Specialist",
    blurb: "You clearly know how this business and this machine actually work. Well done.",
  },
  {
    min: 14,
    name: "Chief Choreographer",
    blurb: "Near-perfect. You could explain Airimation to a stranger, a client, or a curious 8-year-old, equally well.",
  },
];

export function badgeForScore(score: number, total: number): BadgeTier {
  const pct = (score / total) * 100;
  const scaled = (pct / 100) * 15;
  let tier = badgeTiers[0];
  for (const t of badgeTiers) {
    if (scaled >= t.min) tier = t;
  }
  return tier;
}

// The standalone quiz page (/internal/quiz) draws a fresh random subset each
// time, rather than always asking the same 15 in the same order — a small
// gamification touch so retaking it doesn't feel identical.
export const QUIZ_ROUND_SIZE = 10;

export function pickRandomQuestions(
  pool: QuizQuestion[] = quizQuestions,
  count: number = QUIZ_ROUND_SIZE
): QuizQuestion[] {
  const shuffled = [...pool];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

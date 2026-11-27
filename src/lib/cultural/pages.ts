// Copy for the formation pages, /design-your-show/<id> (docs/seo/PLAN.md §2).
//
// PLAIN DATA ONLY. This module is imported by client components (the copy
// under the sky follows the visitor's pick without a page load), so it must
// never import src/lib/cultural (three.js-free but heavy: scan code, the
// manifest) — `formationFacts()` in ./facts.ts joins it to the library on the
// server instead. A unit test checks every library formation has an entry
// here and every entry is a real formation.
//
// Rules for the copy (DECISIONS.md): concept renders, never "flown" or
// "delivered"; no client, temple, trust or civic body named as a customer;
// none of the retired words (scripts/check-brand-spelling.mjs) — say "civic" or "public".

export type FormationPage = {
  /** The H1 / title subject, e.g. "Ganesha drone light show". */
  heading: string;
  /** Two or three sentences: what the figure is and what it suits. Unique per page. */
  about: string;
  /** Occasions it suits, short phrases. */
  occasions: string[];
};

export const FORMATION_PAGES: Record<string, FormationPage> = {
  tiranga: {
    heading: "Tiranga drone light show",
    about:
      "The national flag in drones, drawn to the Flag Code of India's proportions: saffron, white and green bands waving in the wind, and the Ashoka Chakra's 24 spokes turning at its heart. It reads from 200 drones; a larger fleet flies a bigger flag with a crisper chakra.",
    occasions: ["Republic Day", "Independence Day", "Civic celebrations", "School and college annual days", "Sports events"],
  },
  diya: {
    heading: "Diya drone light show",
    about:
      "A clay oil lamp with a flickering flame, drawn from a 3D model of a real diya. One of the simplest figures in the library — it reads from just 100 drones — and one of the most fitting to open or close a festival night.",
    occasions: ["Diwali", "Dev Deepawali", "Deepotsav", "Weddings", "Temple festivals"],
  },
  dil: {
    heading: "Heart (dil) drone light show",
    about:
      "A heart that beats in light, made from a museum scan of a heart-shaped snuffbox, so it has real depth when you walk round it. It needs only 100 drones, which makes it one of the most affordable figures for a proposal or a wedding moment.",
    occasions: ["Weddings", "Proposals", "Anniversaries", "Valentine's Day", "Sangeet nights"],
  },
  damru: {
    heading: "Damru drone light show",
    about:
      "Shiva's two-headed drum, turning slowly, its heads flashing in rhythm as if it is being played. Made from a 3D model of a real damru, it reads from 100 drones and pairs naturally with a drum-led soundtrack.",
    occasions: ["Mahashivratri", "Sawan and Kanwar festivals", "Temple festivals", "Cultural evenings"],
  },
  "dhanush-baan": {
    heading: "Dhanush-baan (bow and arrow) drone light show",
    about:
      "A bow drawn and an arrow loosed: the arrow flies off across the sky as a streak of light and returns, dark, to the string. Made from a 3D bow-and-arrow model with the arrow nocked by Airimation, it reads from 100 drones.",
    occasions: ["Dussehra", "Ram Navami", "Ramlila evenings", "Sports events"],
  },
  shankh: {
    heading: "Shankh (conch) drone light show",
    about:
      "The conch, spire up — the shankh sounded at the start of every puja. Modelled by Airimation in Blender for this library; its spiral needs 500 drones or more to read cleanly.",
    occasions: ["Temple festivals", "Aarti evenings", "Diwali", "Inaugurations"],
  },
  trishul: {
    heading: "Trishul drone light show",
    about:
      "Shiva's trident with a damru tied below its head, modelled by Airimation. A tall, slim figure that reads from 100 drones and holds its shape from any seat in a crowd.",
    occasions: ["Mahashivratri", "Sawan", "Temple festivals", "Cultural evenings"],
  },
  kalash: {
    heading: "Kalash drone light show",
    about:
      "A full kalash — the pot, mango leaves and a coconut — the sign of a blessed beginning. Modelled by Airimation, it reads from 100 drones and suits the opening moment of an event.",
    occasions: ["Griha pravesh", "Weddings", "Inaugurations and launches", "Navratri"],
  },
  om: {
    heading: "Om drone light show",
    about:
      "The Om symbol in light, turning slowly so it faces every part of the audience in turn. Modelled by Airimation from the Om glyph of an open-licence Devanagari typeface; it reads from 200 drones.",
    occasions: ["Temple festivals", "Yoga Day", "Spiritual gatherings", "Ganga aarti evenings"],
  },
  kamal: {
    heading: "Kamal (lotus) drone light show",
    about:
      "A lotus in bloom, its petals opening to the sky. Modelled by Airimation, it reads from 200 drones; larger fleets give each petal its own shading.",
    occasions: ["Weddings", "Temple festivals", "Diwali", "Cultural evenings", "Corporate events"],
  },
  "taj-mahal": {
    heading: "Taj Mahal drone light show",
    about:
      "The Taj Mahal — the dome and its four minarets — in white and gold, made from a 3D model of the monument. It reads from 200 drones; at 5,000 the marble detail comes through. A favourite for a wedding night.",
    occasions: ["Weddings", "Anniversaries", "Tourism events in Agra and UP", "Destination weddings"],
  },
  "ram-mandir": {
    heading: "Ram Mandir drone light show",
    about:
      "Ayodhya's Ram Mandir in the Nagara style: five mandapas rising to the shikhara over the sanctum. Modelled by Airimation in Blender for this library; the temple's detail needs 800 drones or more.",
    occasions: ["Ram Navami", "Diwali and Deepotsav", "Temple-town festivals", "Cultural evenings"],
  },
  nandi: {
    heading: "Nandi drone light show",
    about:
      "Nandi, Shiva's bull, seated — made from a 3D model of a Chola-period sculpture in the Dallas Museum of Art. It needs 500 drones or more for the sculpture's form to read.",
    occasions: ["Mahashivratri", "Temple festivals", "Cultural evenings", "Heritage events"],
  },
  ganesha: {
    heading: "Ganesha drone light show",
    about:
      "Ganesha from a thousand-year-old stone sculpture in the Minneapolis Institute of Art, scanned in the round — drag the sky and you can walk all the way round him. A sculpture this detailed needs 500 drones or more.",
    occasions: ["Ganesh Chaturthi", "Weddings", "Griha pravesh and inaugurations", "Diwali"],
  },
  dragon: {
    heading: "Dragon drone light show",
    about:
      "A winged dragon, from a scanned statuette — a dramatic figure for a launch or a themed night. It needs 500 drones or more for the wings and scales to read.",
    occasions: ["Product launches", "Gaming and esports events", "Theme nights", "New Year's Eve"],
  },
  "vishnu-garuda": {
    heading: "Vishnu on Garuda drone light show",
    about:
      "Vishnu riding Garuda, wings spread, from a 12th-century bronze in the Minneapolis Institute of Art. One of the most detailed figures in the library; it needs 800 drones or more.",
    occasions: ["Temple festivals", "Janmashtami", "Heritage and museum events", "Cultural evenings"],
  },
  "cma-nataraja": {
    heading: "Nataraja drone light show",
    about:
      "Shiva as Lord of the Dance, in his ring of fire, from the Cleveland Museum of Art's open-access scan of a Chola bronze. The ring and the raised leg need 800 drones or more to read.",
    occasions: ["Mahashivratri", "Classical dance festivals", "Cultural evenings", "Heritage events"],
  },
  "mia-nataraja": {
    heading: "Dancing Shiva drone light show",
    about:
      "Shiva mid-dance, from a bronze in the Minneapolis Institute of Art, scanned in the round. A second Nataraja with a different stance from the Cleveland figure; it needs 800 drones or more.",
    occasions: ["Mahashivratri", "Classical dance festivals", "Cultural evenings"],
  },
  somaskanda: {
    heading: "Somaskanda drone light show",
    about:
      "Shiva, Uma and the child Skanda seated together — a family in bronze, from the Minneapolis Institute of Art. Three figures side by side make it the largest sculpture in the library; it needs 1,500 drones.",
    occasions: ["Temple festivals", "Family celebrations", "Heritage events"],
  },
  charminar: {
    heading: "Charminar drone light show",
    about:
      "Hyderabad's Charminar — four minarets around the great arch — from a 3D model of the monument. It needs 500 drones or more for the arches to read.",
    occasions: ["City celebrations", "Tourism events", "Corporate events in Hyderabad", "Heritage festivals"],
  },
  "india-gate": {
    heading: "India Gate drone light show",
    about:
      "New Delhi's India Gate, in buff stone with its red base, from a 3D model of the memorial. It reads from 200 drones.",
    occasions: ["Republic Day", "Independence Day", "Civic celebrations in Delhi NCR", "Tributes and remembrance"],
  },
  "qutub-minar": {
    heading: "Qutub Minar drone light show",
    about:
      "Delhi's Qutub Minar, its five storeys rising — red sandstone below, marble above — from a 3D model of the tower. A tall, slim figure that reads from 100 drones.",
    occasions: ["Civic celebrations in Delhi NCR", "Tourism events", "Heritage festivals"],
  },
  sikhara: {
    heading: "Temple tower (shikhara) drone light show",
    about:
      "A temple tower, from the Cleveland Museum of Art's model of a shikhara — the curved spire that crowns a North Indian temple. It reads from 200 drones.",
    occasions: ["Temple festivals", "Temple-town events", "Heritage events"],
  },
  "ganesha-standing": {
    heading: "Standing Ganesha drone light show",
    about:
      "Ganesha standing, from a bronze in the Cleveland Museum of Art, scanned in the round — a taller, slimmer figure than the seated Ganesha. It needs 500 drones or more.",
    occasions: ["Ganesh Chaturthi", "Inaugurations", "Weddings", "Diwali"],
  },
  sitar: {
    heading: "Sitar drone light show",
    about:
      "The sitar, laid diagonally across the sky, from a 3D model of the instrument. It reads from 200 drones and suits a music-led evening.",
    occasions: ["Music festivals", "Sangeet nights", "Cultural evenings", "Classical concerts"],
  },
  violin: {
    heading: "Violin drone light show",
    about:
      "A violin and its bow, from a museum model of the instrument in the Virtual Museums of Małopolska. It reads from 200 drones and pairs with a string-led soundtrack.",
    occasions: ["Music festivals", "Concerts", "School and college annual days"],
  },
  rose: {
    heading: "Rose drone light show",
    about:
      "A single red rose on a green stem, with its leaves, from a 3D model of a real rose. It reads from 200 drones — a quiet, romantic figure.",
    occasions: ["Proposals", "Weddings", "Anniversaries", "Valentine's Day"],
  },
  "eiffel-tower": {
    heading: "Eiffel Tower drone light show",
    about:
      "The Eiffel Tower, from a 3D model of the landmark. It reads from 200 drones — a figure for a Paris-themed night or a travel brand.",
    occasions: ["Theme nights", "Travel and tourism events", "Anniversaries", "Corporate events"],
  },
  "burj-khalifa": {
    heading: "Burj Khalifa drone light show",
    about:
      "The Burj Khalifa, the tallest tower in the world, from a 3D model of the building. A tall, slim figure that reads from 100 drones.",
    occasions: ["Real-estate launches", "Corporate events", "New Year's Eve", "Theme nights"],
  },
  "statue-of-liberty": {
    heading: "Statue of Liberty drone light show",
    about:
      "The Statue of Liberty, torch raised, from a 3D model of the statue. It needs 500 drones or more for the figure to read.",
    occasions: ["Theme nights", "Travel and education events", "Corporate events"],
  },
  "big-ben": {
    heading: "Big Ben drone light show",
    about:
      "Big Ben's clock tower, from a 3D model of the London landmark. A tall, slim figure that reads from 100 drones — a natural centrepiece for a New Year countdown.",
    occasions: ["New Year's Eve countdowns", "Theme nights", "Travel events"],
  },
  tiger: {
    heading: "Tiger drone light show",
    about:
      "A tiger on the prowl, flown as an orange tiger with dark stripes, from a 3D model of the animal. It reads from 200 drones.",
    occasions: ["Wildlife and conservation events", "Sports events", "Product launches", "School annual days"],
  },
  elephant: {
    heading: "Elephant drone light show",
    about:
      "An elephant with its trunk raised, from a 3D model of the animal. It reads from 200 drones and suits a baraat, a royal-themed wedding or a wildlife evening.",
    occasions: ["Weddings (baraat)", "Wildlife events", "Tourism events", "Cultural evenings"],
  },
  lion: {
    heading: "Lion drone light show",
    about:
      "A seated lion, from a 3D model of a lion sculpture. It needs 500 drones or more for the mane and the sculpted form to read — a figure of strength for a launch or a stadium.",
    occasions: ["Sports events", "Corporate events", "Product launches"],
  },
  horse: {
    heading: "Horse drone light show",
    about:
      "A horse at full gallop, from a 3D model of the animal in motion. It reads from 200 drones; a baraat favourite, and a strong figure for sports and launches.",
    occasions: ["Weddings (baraat)", "Sports and polo events", "Product launches"],
  },
  eagle: {
    heading: "Eagle drone light show",
    about:
      "A golden eagle, wings spread, from a museum model of a real specimen. It needs 500 drones or more for the feathers to read.",
    occasions: ["Sports events", "Corporate events", "Defence and aviation exhibitions"],
  },
  owl: {
    heading: "Owl drone light show",
    about:
      "A barn owl on its branch, from a museum model of a real specimen. It needs 500 drones or more for the face and feathers to read — a quiet figure for a school or college night.",
    occasions: ["School and college events", "Wildlife events", "Theme nights"],
  },
  butterfly: {
    heading: "Butterfly drone light show",
    about:
      "A butterfly with its wings open, from an open-licence 3D scan of a real Common Tiger butterfly. It reads from 100 drones — light, colourful and easy to love.",
    occasions: ["Weddings", "Children's events", "Spring festivals", "Garden events"],
  },
  dolphin: {
    heading: "Dolphin drone light show",
    about:
      "A dolphin mid-leap, from a 3D model of the animal. It reads from 200 drones and suits waterfront venues, where the figure can seem to jump from the water.",
    occasions: ["Waterfront events", "Children's events", "Conservation events"],
  },
  whale: {
    heading: "Whale drone light show",
    about:
      "A blue whale gliding across the sky, from a 3D model of the animal. A long, low figure that reads from 200 drones — made for conservation nights and science festivals.",
    occasions: ["Conservation events", "Waterfront events", "Science festivals"],
  },
  koi: {
    heading: "Koi drone light show",
    about:
      "A koi with its fins trailing, from a 3D model of the fish. It reads from 200 drones and suits a garden or waterfront night.",
    occasions: ["Weddings", "Garden and waterfront events", "Theme nights"],
  },
  "classic-car": {
    heading: "Classic car drone light show",
    about:
      "A classic car, from a 3D model of the Hindustan Ambassador — made for the wedding drive-away. It reads from 200 drones.",
    occasions: ["Weddings (vidaai)", "Automobile launches", "Vintage car rallies"],
  },
  "auto-rickshaw": {
    heading: "Auto-rickshaw drone light show",
    about:
      "The Indian auto-rickshaw, side on, in green and yellow, from a 3D model of the vehicle. It reads from 200 drones — a playful figure for a brand or a city.",
    occasions: ["Brand activations", "City celebrations", "Tourism events"],
  },
  bicycle: {
    heading: "Bicycle drone light show",
    about:
      "A bicycle with a basket, from a 3D model. It reads from 200 drones — a light, friendly figure for a cycling rally, a city wellness drive or a brand activation.",
    occasions: ["Cycling events and rallies", "Fitness and wellness events", "Brand activations"],
  },
  biplane: {
    heading: "Biplane drone light show",
    about:
      "A First World War biplane, from Ingenium Canada's open-access museum scan of a Bristol F.2B. It reads from 200 drones.",
    occasions: ["Aviation events", "Air shows", "Heritage events"],
  },
  "space-shuttle": {
    heading: "Space Shuttle drone light show",
    about:
      "The Space Shuttle Discovery, from the Smithsonian's open-access scan. It reads from 200 drones — a figure for a science night.",
    occasions: ["Science festivals", "Space and technology events", "School and college events"],
  },
  "hot-air-balloon": {
    heading: "Hot-air balloon drone light show",
    about:
      "A hot-air balloon, from a 3D model, in bright stripes of colour. It reads from just 100 drones — a cheerful, simple figure for children's events and weddings.",
    occasions: ["Children's events", "Weddings", "Tourism events", "Balloon festivals"],
  },
  "shape-globe": {
    heading: "Globe drone light show",
    about:
      "A solid globe of light that reads as a sphere from every seat. Modelled by Airimation; it reads from 200 drones.",
    occasions: ["Corporate events", "Conferences", "Earth Day", "Science festivals"],
  },
  "shape-helix": {
    heading: "Double helix drone light show",
    about:
      "A double helix — two solid strands and their rungs. Modelled by Airimation; it needs 500 drones or more. The shape of DNA, for a science or healthcare evening.",
    occasions: ["Science festivals", "Healthcare and pharma events", "University events"],
  },
  "shape-atom": {
    heading: "Atom drone light show",
    about:
      "A nucleus, three orbit rings and their electrons. Modelled by Airimation; it needs 500 drones or more — the classic symbol of science, made solid.",
    occasions: ["Science festivals", "Technology launches", "University events"],
  },
  "shape-knot": {
    heading: "Torus knot drone light show",
    about:
      "A torus knot — one solid rope, endlessly looping. Modelled by Airimation; it needs 500 drones or more, and reads differently from every side as you orbit it.",
    occasions: ["Corporate events", "Technology launches", "Art and design festivals"],
  },
  "shape-cube": {
    heading: "Cube drone light show",
    about:
      "A solid cube with six faces, each lit differently. Modelled by Airimation; it needs 500 drones or more — a clean, technical figure for a product or tech launch.",
    occasions: ["Technology launches", "Corporate events", "Gaming events"],
  },
  "shape-spiral": {
    heading: "Rising spiral drone light show",
    about:
      "A rising spiral, its arms opening upward. Modelled by Airimation; it needs 500 drones or more — a good opening or finale shape.",
    occasions: ["Show openings and finales", "Corporate events", "New Year's Eve"],
  },
  "shape-diamond": {
    heading: "Diamond drone light show",
    about:
      "A solid brilliant-cut diamond — table, crown and pavilion. Modelled by Airimation; it needs 500 drones or more.",
    occasions: ["Jewellery launches", "Weddings and engagements", "Anniversaries"],
  },
  "shape-pyramid": {
    heading: "Pyramid drone light show",
    about:
      "A solid pyramid with four faces on a square base. Modelled by Airimation; it needs 500 drones or more — a strong, simple shape for an opening or a theme night.",
    occasions: ["Theme nights", "Corporate events", "Technology launches"],
  },
  "shape-starburst": {
    heading: "Starburst drone light show",
    about:
      "Rays of light bursting from a glowing core — the drone-show answer to a firework. Modelled by Airimation; it needs 500 drones or more.",
    occasions: ["Show finales", "New Year's Eve", "Diwali", "Corporate events"],
  },
};

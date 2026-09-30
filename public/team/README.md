# Team photos

Drop real founder headshots here, then set the matching `photo` path in
`src/lib/content.ts`'s `founders` array — nothing else needs to change,
`FounderAvatar` will pick it up automatically and stop showing the initials
placeholder.

Suggested naming (matches each founder, in order):

- gaurav-tripathi.jpg
- harshit-dixit.jpg
- anshuman.jpg
- adarsh-shukla.jpg

Sizing: portrait orientation, at least 800x1000px, JPG or PNG. The site
crops to a 4:5 box on the /team page and a square box on the homepage, so a
centered headshot with some room above the shoulders works best.

## Current files (updated 2026-09-29)

rajeev.jpg, deepak.jpg, vishal.jpg (advisors) and neeraj.jpg, madhuri.png,
harshit.jpg, gaurav.jpg (core team).

rajeev.jpg and vishal.jpg were replaced on 2026-09-29 (evening) with better
source images: rajeev.jpg is cropped to 4:5 from a conference photo, with the
bottom nameplate band deliberately cropped out; vishal.jpg is a centre crop of
a square headshot. Both were upscaled modestly (2.2x and 1.8x).

The other two added on 2026-09-29 were supplied at low resolution (216–591px) and
have been cropped to 4:5 and upscaled modestly — capped at 2.2x, because
pushing them further only invents soft pixels. They are noticeably softer
than madhuri.png and harshit.jpg. Replace them with originals from each
person when available; drop the file here and update the `photo` path in
src/lib/content.ts, nothing else changes.

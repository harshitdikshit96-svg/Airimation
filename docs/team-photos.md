# Team photos

Real headshots only: no generated or stock photos of real people (see
DECISIONS.md §2).

Drop the photo in `public/team/`, then set the matching `photo` path on that person in
`src/lib/content.ts` (`directors` or `advisors`). Nothing else changes;
`FounderAvatar` shows initials until a photo is set.

Sizing: portrait, at least 800x1000px, JPG or PNG. Pages crop to a 4:5 box
on /team, a square on the home page (112–144 px) and a round thumbnail on
/about, so a centred headshot with room above the shoulders works best.

## Current files (as of 9 Nov 2026)

| File | Person | Shown on the site |
|---|---|---|
| harshit.jpg | Harshit Dixit, Director | yes |
| madhuri.png | Madhuri Mishra, Director | yes |
| gaurav.jpg | Dr. Gaurav Tripathi, Advisor | yes |
| neeraj.jpg | Dr. Neeraj Jain, Advisor | yes |
| rajeev.jpg, deepak.jpg, vishal.jpg | advisors | no (`hidden: true`) |

Some photos were supplied at low resolution and upscaled modestly (capped
at 2.2x); they look softer than madhuri.png and harshit.jpg. Replace them
with originals when available.

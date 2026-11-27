# TODO — finish the GTM + GA4 setup (handover to another Claude session)

> **Delete this file once every step below is done** (and say so in the DECISIONS.md change
> log). It is a handover note, not documentation — the lasting record is
> `docs/analytics-setup.md`.

Written 27 Nov 2026 by the session that built the analytics code. That session couldn't
reach Chrome (the Claude extension wasn't connected), so the browser half is left for you.

## Where things stand

- **Done in code** (branch `seo-formation-pages`, **not committed yet** — check
  `git status`; ask the user before committing): GTM loader, dataLayer wrapper, all events
  from the approved plan, Consent Mode v2 + banner, `/privacy`, lead attribution, Clash
  Display font. Lint, 563 unit tests, build and 96/96 e2e passed. Read
  `docs/analytics-setup.md` first — §3–§4 are the plan, §7 is the checklist you're executing.
- **Done on Neon:** the 7 attribution columns were added to `leads` (owner said yes).
- **Done 28 Nov 2026 (steps 1–5, 7):** GA4 property "Airimation" `G-E6GF8L77GF` and GTM
  container `GTM-5XBZ5K5M`, both in the **harshitcreates** accounts (owner's choice). Container
  imported into workspace "Analytics plan import" (unpublished), consent overview on. GA4
  admin §7.5 done except BigQuery (owner to decide). Details: `docs/analytics-setup.md` §7.
- **Left:** step 6 (Vercel env var + commit/push + deploy), 8 (Preview/DebugView), 9 (publish),
  10 (delete this file).

## Decisions already made by the owner (don't re-ask)

- All markets → Consent Mode v2 (EEA/UK/CH denied + banner, granted elsewhere). No ads.
- GA4 only (Vercel Web Analytics was removed). The plan is approved; privacy copy approved.
- Use the **second Google account in Chrome: `authuser=2`** (e.g.
  `https://tagmanager.google.com/?authuser=2`, `https://analytics.google.com/analytics/web/?authuser=2`).

## Steps (Claude in Chrome — run `/chrome`, load the `claude-in-chrome` skill first)

1. **Check what exists** under authuser=2 in GA4 and GTM before creating anything.
2. **GA4:** create the property "Airimation" (time zone India / Asia-Kolkata, currency INR)
   and a web data stream for `https://airimation.in`. Note the `G-…` measurement ID.
3. **GTM:** create a web container for `airimation.in`. Note the `GTM-…` ID.
   - Creating an account or container means **accepting Google's terms**: stop, show the
     user the terms screen, and only accept after their explicit OK.
4. **Generate the container** from the plan: put both IDs into
   `docs/analytics-plan.json` (`gtmId`, `measurementId`), then run
   `node ~/.claude/skills/gtm-ga4-analytics/scripts/build-gtm-container.mjs docs/analytics-plan.json --out docs/gtm-container.json --checklist docs/gtm-manual-steps.md`
5. **Import** it: GTM → Admin → Import Container → `docs/gtm-container.json` → **New
   workspace** → **Merge** → Rename conflicting. (File upload: the file must be shared with
   the session; fallback is `docs/gtm-manual-steps.md`.) Admin → Container settings →
   enable **consent overview**.
6. **Vercel:** Project → Settings → Environment Variables → `NEXT_PUBLIC_GTM_ID` =
   the GTM ID, **Production only**. A redeploy is needed for it to take effect — ask the user
   before deploying (and the code must be committed/pushed first).
7. **GA4 admin** (`docs/analytics-setup.md` §7.5): register the 23 event-scoped custom
   dimensions + the `metric_value` custom metric from §4; key event `generate_lead`; data
   retention 14 months; Enhanced Measurement (history page changes on, **form interactions
   off**); internal-traffic filter `traffic_type = internal` (Testing → Active); link Search
   Console; BigQuery export if the user wants it.
8. **Verify** with GTM Preview / Tag Assistant on the live site using the action table in
   §7.3, and GA4 DebugView. A real test enquiry creates a row in the live `leads` table —
   ask first, and delete it afterwards.
9. **Publish the GTM workspace only after the user says yes** to what Preview showed.
10. Update `docs/analytics-setup.md` (IDs, status, what was done), add a DECISIONS.md change
    log entry, then **delete this TODO.md**.

## Rules that still apply

- Never publish GTM, change GA4 settings beyond this list, or deploy without the user's yes.
- No personal data in the dataLayer; the only key event is `generate_lead`.
- If the GA4/GTM UI differs from these steps, follow the live UI and tell the user.

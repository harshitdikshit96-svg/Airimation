/**
 * Consent Mode v2 (docs/analytics-setup.md; the skill's references/consent-mode.md, checked
 * against Google's "Set up consent mode on websites" guide, Nov 2026).
 *
 * All markets: EEA / UK / Switzerland start DENIED (Google applies the region default from the
 * visitor's IP) and are shown a banner; everyone else starts GRANTED. Ads storage is denied
 * everywhere — Airimation runs no ads. A stored choice (the banner, or "Cookie settings" in the
 * footer) is restored before GTM loads. Every default sets all four v2 parameters.
 */
export const CONSENT_KEY = "consent_v1";

export const CONSENT_REGIONS = [
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IS", "IE", "IT", "LV",
  "LI", "LT", "LU", "MT", "NL", "NO", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "GB", "CH",
];

/** Inline, before the GTM bootstrap. Plain ES5; gtag pushes `arguments` objects, as GTM expects. */
export const CONSENT_DEFAULTS = `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}
gtag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied',wait_for_update:500,region:${JSON.stringify(CONSENT_REGIONS)}});
gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
try{var c=localStorage.getItem('${CONSENT_KEY}');if(c==='granted'||c==='denied')gtag('consent','update',{analytics_storage:c});}catch(e){}`;

export type Choice = "granted" | "denied";

export function storedChoice(): Choice | null {
  try {
    const c = localStorage.getItem(CONSENT_KEY);
    return c === "granted" || c === "denied" ? c : null;
  } catch {
    return null;
  }
}

/** Saves the choice and tells GTM (works before or after GTM has loaded). */
export function saveChoice(choice: Choice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice);
  } catch {
    /* private mode: the choice lasts this page only */
  }
  try {
    window.dataLayer = window.dataLayer || [];
    // gtag must push the `arguments` object itself — GTM ignores a plain array for consent.
    const gtag = function () {
      // eslint-disable-next-line prefer-rest-params
      window.dataLayer!.push(arguments);
    } as unknown as (...a: unknown[]) => void;
    gtag("consent", "update", { analytics_storage: choice });
  } catch {
    /* best-effort */
  }
}

/**
 * Should this visitor see the banner? Pages are static, so the country isn't known here; a
 * European time zone stands in for it. Errs safe both ways: a European IP with a non-European
 * clock stays in Google's "denied" default (cookieless) and can still use Cookie settings.
 */
export function inConsentRegion(timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone): boolean {
  return /^Europe\//.test(timeZone) || /^Atlantic\/(Canary|Madeira|Azores|Reykjavik|Faroe)$/.test(timeZone) || timeZone === "Arctic/Longyearbyen";
}

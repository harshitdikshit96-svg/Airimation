/**
 * Inline GTM bootstrap: decides WHEN Google Tag Manager loads (gtm-ga4-analytics skill,
 * references/lessons.md §1–2). Rendered as a plain inline <script> in the root layout.
 *
 * Not next/script or @next/third-parties: both load GTM during or right after hydration, and
 * GTM + GA4 cost ~850 ms of CPU on a throttled phone — on a page already running a 3D scene.
 *
 * GTM loads at the FIRST of:
 *  - immediately, if the URL carries a campaign (utm_*, gclid…, _gl) — so the first page_view
 *    keeps its source before any client-side navigation rewrites the URL;
 *  - the first page scroll / pointerdown / touchstart / keydown (bubble phase, so scenes and
 *    rails that scroll themselves don't count);
 *  - 6 s after window load;
 *  - window.__loadGtm(), called by lib/analytics when a deliberate event is tracked.
 * Never on excluded paths (/internal, /api).
 *
 * Queue order: consent commands first, then the gtm.js start event, then events queued before
 * load — otherwise GTM handles early events before the Google tag is configured.
 */
export function gtmBootstrap(gtmId: string, opts: { fallbackMs?: number; excludePaths?: string } = {}): string {
  if (!/^GTM-[A-Z0-9]+$/.test(gtmId)) throw new Error(`Invalid GTM id: ${gtmId}`);
  const fallbackMs = opts.fallbackMs ?? 6000;
  const exclude = opts.excludePaths ?? "^/(internal|api)(/|$)";
  const clickIds = ["gclid", "gbraid", "wbraid", "dclid", "fbclid", "msclkid"].join("|");
  return `(function(w,d){
if(new RegExp(${JSON.stringify(exclude)}).test(location.pathname))return;
var loaded=false,evs=['scroll','pointerdown','touchstart','keydown'],o={passive:true};
function isCmd(x){return x&&typeof x==='object'&&typeof x.length==='number'&&(x[0]==='consent'||x[0]==='set');}
function load(){if(loaded)return;loaded=true;
evs.forEach(function(e){w.removeEventListener(e,load,o)});
var q=w.dataLayer||[],head=[],tail=[];
for(var i=0;i<q.length;i++){(isCmd(q[i])?head:tail).push(q[i]);}
w.dataLayer=head.concat([{'gtm.start':Date.now(),event:'gtm.js'}],tail);
var s=d.createElement('script');s.async=true;s.src='https://www.googletagmanager.com/gtm.js?id=${gtmId}';d.head.appendChild(s);}
w.__loadGtm=load;
if(/[?&](${clickIds}|utm_[a-z]+|_gl)=/.test(location.search)){load();return;}
evs.forEach(function(e){w.addEventListener(e,load,o)});
function later(){setTimeout(load,${fallbackMs})}
if(d.readyState==='complete')later();else w.addEventListener('load',later,{once:true});
})(window,document);`;
}

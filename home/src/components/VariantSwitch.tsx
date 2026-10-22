import { useSyncExternalStore } from 'react';

/* ── PROTOTYPE VARIANT SWITCH (review-only; strip before any port) ──────────
   A = the approved page, B / C = experiments (B is still a copy of A;
   C = the showcase crawl; D = C's crawl + the closing band fades into the footer; E = D with the coverflow showcase).
   experiments branch on it either in CSS (html[data-variant="b"] …) or in a
   component (const v = useVariant(); v === 'b' ? … : …). The choice comes
   from ?variant=a|b|c|d|e, else the last one picked (localStorage), else B. */
export type Variant = 'a' | 'b' | 'c' | 'd' | 'e';
const KEY = 'hm-variant';

function initial(): Variant {
  const q = new URLSearchParams(window.location.search).get('variant');
  if (q === 'a' || q === 'b' || q === 'c' || q === 'd' || q === 'e') return q;
  /* new visitors (nothing saved) land on B (Gary, 2026-10-21) */
  try { const v = localStorage.getItem(KEY); return v === 'a' || v === 'b' || v === 'c' || v === 'd' || v === 'e' ? v : 'b'; } catch { return 'b'; }
}

let current: Variant = initial();
document.documentElement.dataset.variant = current;
const listeners = new Set<() => void>();

export function setVariant(v: Variant) {
  current = v;
  document.documentElement.dataset.variant = v;
  try { localStorage.setItem(KEY, v); } catch { /* review-only */ }
  listeners.forEach((l) => l());
}

export function useVariant(): Variant {
  return useSyncExternalStore((l) => { listeners.add(l); return () => listeners.delete(l); }, () => current);
}

/* ?showcase=1 hides the switch (the portfolio links here with ?variant=d&showcase=1 to show one
   variant cleanly); the staging page without the flag keeps it */
const hideSwitch = new URLSearchParams(window.location.search).get('showcase') === '1';

export function VariantSwitch() {
  const v = useVariant();
  if (hideSwitch) return null;
  return (
    <div className="hm-variant-switch" role="group" aria-label="Page variant">
      <span className="hm-variant-label">Variant</span>
      {(['a', 'b', 'c', 'd', 'e'] as const).map((x) => (
        <button key={x} type="button" aria-pressed={v === x} onClick={() => setVariant(x)}>{x.toUpperCase()}</button>
      ))}
    </div>
  );
}

import { useSyncExternalStore } from 'react';

/* ── PROTOTYPE VARIANT SWITCH (review-only; strip before any port) ──────────
   A = the approved page, B / C = experiments (B is still a copy of A;
   C = the showcase crawl; D = the closing band fades into the footer).
   experiments branch on it either in CSS (html[data-variant="b"] …) or in a
   component (const v = useVariant(); v === 'b' ? … : …). The choice comes
   from ?variant=a|b|c|d, else the last one picked (localStorage), else B. */
export type Variant = 'a' | 'b' | 'c' | 'd';
const KEY = 'hm-variant';

function initial(): Variant {
  const q = new URLSearchParams(window.location.search).get('variant');
  if (q === 'a' || q === 'b' || q === 'c' || q === 'd') return q;
  /* new visitors (nothing saved) land on B (Gary, 2026-10-21) */
  try { const v = localStorage.getItem(KEY); return v === 'a' || v === 'b' || v === 'c' || v === 'd' ? v : 'b'; } catch { return 'b'; }
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

export function VariantSwitch() {
  const v = useVariant();
  return (
    <div className="hm-variant-switch" role="group" aria-label="Page variant">
      <span className="hm-variant-label">Variant</span>
      {(['a', 'b', 'c', 'd'] as const).map((x) => (
        <button key={x} type="button" aria-pressed={v === x} onClick={() => setVariant(x)}>{x.toUpperCase()}</button>
      ))}
    </div>
  );
}

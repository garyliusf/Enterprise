import { useSyncExternalStore } from 'react';

/* ── PROTOTYPE VARIANT SWITCH (review-only; strip before any port) ──────────
   A = the approved page, B = the experiment. B starts as an exact copy of A;
   experiments branch on it either in CSS (html[data-variant="b"] …) or in a
   component (const v = useVariant(); v === 'b' ? … : …). The choice comes
   from ?variant=a|b, else the last one picked (localStorage), else A. */
export type Variant = 'a' | 'b';
const KEY = 'hm-variant';

function initial(): Variant {
  const q = new URLSearchParams(window.location.search).get('variant');
  if (q === 'a' || q === 'b') return q;
  try { return localStorage.getItem(KEY) === 'b' ? 'b' : 'a'; } catch { return 'a'; }
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
      {(['a', 'b'] as const).map((x) => (
        <button key={x} type="button" aria-pressed={v === x} onClick={() => setVariant(x)}>{x.toUpperCase()}</button>
      ))}
    </div>
  );
}

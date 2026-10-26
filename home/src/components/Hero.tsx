import { useEffect, useState, type FormEvent, type KeyboardEvent, type ReactNode } from 'react';
import { hero } from '../config';
import { BgVideo } from './ui';

/* Carries the prompt into Bolt's composer and submits it there (the
   use-case pages' goToBolt). Opens in a new tab. */
export function goToBolt(prompt: string, instruction?: string) {
  let text = prompt.trim() || hero.promptExample;
  /* the app prepends the selected intent's instruction the same way */
  if (instruction) text = `${instruction}\n\n${text}`;
  window.open('https://bolt.new/?autosubmit=true#prompt=' + encodeURIComponent(text), '_blank', 'noopener');
}

/* The hero prompt box: white card, textarea, suggestion pills, Build now. */
/* The example prompts, typed out in the empty box (Gary, 2026-10-26: a
   typewriter instead of the fade): type → hold → erase → next. Stops the
   moment there is text; under reduced motion the first one simply sits there.
   `full` is always the whole example, so submitting an empty box mid-typing
   still sends a complete prompt. */
const EXAMPLES = hero.promptPills.map((p) => p.prompt);
function useTypewriter(active: boolean) {
  const [idx, setIdx] = useState(0);
  const [len, setLen] = useState(0);
  const [erasing, setErasing] = useState(false);
  const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const full = EXAMPLES[idx];
  useEffect(() => {
    if (!active || reduce) return;
    let t: number;
    if (!erasing && len < full.length) t = window.setTimeout(() => setLen(len + 1), 34 + Math.random() * 30);
    else if (!erasing) t = window.setTimeout(() => setErasing(true), 1800);
    else if (len > 0) t = window.setTimeout(() => setLen(len - 1), 14);
    else t = window.setTimeout(() => { setErasing(false); setIdx((i) => (i + 1) % EXAMPLES.length); }, 350);
    return () => window.clearTimeout(t);
  }, [active, reduce, erasing, len, full]);
  return { full, shown: reduce ? full : full.slice(0, len) };
}

/* bolt.new's project-type row: outline icons, 1.5px stroke, 24px */
const TYPE_ICONS: Record<'globe' | 'devices' | 'slides' | 'flask', ReactNode> = {
  globe: <><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c2.6 2.8 3.9 5.8 3.9 9s-1.3 6.2-3.9 9c-2.6-2.8-3.9-5.8-3.9-9S9.4 5.8 12 3z" /></>,
  devices: <><rect x="2.5" y="5" width="14" height="10" rx="1.5" /><path d="M6.5 19h5" /><rect x="15" y="8.5" width="6.5" height="11" rx="1.5" /></>,
  slides: <><path d="M3 4.5h18M4.5 4.5v10h15v-10M12 14.5v2.5M8.5 21l3.5-4 3.5 4" /><path d="M9 11.5v-1M12 11.5v-3M15 11.5v-4.5" /></>,
  flask: <><path d="M9 3h6M10 3v6.2L4.6 18.4A1.8 1.8 0 0 0 6.2 21h11.6a1.8 1.8 0 0 0 1.6-2.6L14 9.2V3" /><path d="M7.2 15h9.6" /></>,
};

export function PromptBox({ id = 'hero', compact = false, types = false }: { id?: string; compact?: boolean; types?: boolean }) {
  const [text, setText] = useState('');
  const [intent, setIntent] = useState<string | undefined>();
  const picked = hero.projectTypes.find((t) => t.id === intent);
  const { full: example, shown } = useTypewriter(text === '');
  const send = () => goToBolt(text || example, picked?.instruction);
  const submit = (e: FormEvent) => {
    e.preventDefault();
    send();
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  };
  return (
    <>
      <form className={`hm-prompt${compact ? ' hm-prompt--compact' : ''}`} onSubmit={submit}>
        <label className="fw-sr" htmlFor={`${id}-prompt`}>Describe what you want to build</label>
        <div className="hm-prompt-field">
          {/* the example sits under a transparent textarea so it can fade; the
              native placeholder stays for screen readers / no-JS */}
          <span className={`hm-prompt-example${text ? ' is-hidden' : ''}`} aria-hidden="true">
            {shown}<span className="hm-prompt-caret" />
          </span>
          <textarea
            id={`${id}-prompt`}
            className="hm-prompt-input"
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={onKey}
            placeholder={hero.promptExample}
            rows={2}
          />
        </div>
        <div className="hm-prompt-foot">
          {/* the selected intent, as the app shows it: icon + label + × (the
              suggestion pills are gone, Gary 2026-10-26) */}
          {picked ? (
            <span className="hm-intent-chip">
              <svg viewBox="0 0 24 24" aria-hidden="true">{TYPE_ICONS[picked.icon]}</svg>
              {picked.label}
              <button type="button" className="hm-intent-clear" onClick={() => setIntent(undefined)} aria-label={`Remove ${picked.label}`}>
                <svg viewBox="0 0 12 12" aria-hidden="true"><path d="M3 3l6 6M9 3l-6 6" /></svg>
              </button>
            </span>
          ) : <span />}
          <button type="submit" className="hm-prompt-submit">
            {hero.promptCta}
            {/* filled send arrowhead (Gary, 2026-10-16), not the thin link arrow */}
            <svg className="hm-prompt-send" viewBox="0 0 16 16" aria-hidden="true">
              <path d="M1.5 2.2c0-.9.95-1.5 1.75-1.1l11.4 6.1a1 1 0 0 1 0 1.76L3.25 15.1c-.8.42-1.75-.18-1.75-1.08V9.7L9 8 1.5 6.3V2.2z" />
            </svg>
          </button>
        </div>
      </form>
      {types && (
        <div className="hm-types" role="group" aria-label="What do you want to build?">
          {hero.projectTypes.map((t) => (
            <button key={t.id} type="button" className="hm-type" aria-pressed={intent === t.id} onClick={() => setIntent((v) => (v === t.id ? undefined : t.id))}>
              <span className="hm-type-tile">
                {t.isNew && <span className="hm-type-new">New</span>}
                <svg viewBox="0 0 24 24" aria-hidden="true">{TYPE_ICONS[t.icon]}</svg>
              </span>
              <span className="hm-type-label">{t.label}</span>
            </button>
          ))}
        </div>
      )}
    </>
  );
}

export function TrustPills({ items }: { items: string[] }) {
  return (
    <ul className="hm-trust" aria-label="Good to know">
      {items.map((t) => (
        <li key={t} className="hm-trust-pill">
          <span className="hm-trust-dot" aria-hidden="true" />
          {t}
        </li>
      ))}
    </ul>
  );
}

export function Hero() {
  return (
    <section className="fw-hero hm-hero" id="top">
      {/* BoltGrad03 */}
      <BgVideo name="hero" className="fw-hero-video" />
      <span className="fw-grain" aria-hidden="true" />
      <div className="fw-hero-inner sc-on-dark">
        {/* Above the fold: no scroll reveal on the H1 (CLAUDE.md). Serif first
            line = the solutions hero pattern. */}
        <h1 className="fw-hero-h1">
          <span className="fw-serif">{hero.titleSerif}</span>
          <span>{hero.titleSans}</span>
        </h1>
        {/* no subtitle (Gary, 2026-10-26): H1 straight to the prompt */}
        <PromptBox types />
      </div>
    </section>
  );
}

import { useEffect, useState, type FormEvent, type KeyboardEvent } from 'react';
import { hero } from '../config';
import { BgVideo } from './ui';

/* Carries the prompt into Bolt's composer and submits it there (the
   use-case pages' goToBolt). Opens in a new tab. */
export function goToBolt(prompt: string) {
  const text = prompt.trim() || hero.promptExample;
  window.open('https://bolt.new/?autosubmit=true#prompt=' + encodeURIComponent(text), '_blank', 'noopener');
}

/* The hero prompt box: white card, textarea, suggestion pills, Build now. */
/* The example prompts, rotated through the empty box: each fades out, the
   next fades in. Stops the moment there is text, and under reduced motion. */
const EXAMPLES = [hero.promptExample, ...hero.promptPills.map((p) => p.prompt).filter((p) => p !== hero.promptExample)];
function useRotatingExample(active: boolean) {
  const [idx, setIdx] = useState(0);
  const [shown, setShown] = useState(true);
  useEffect(() => {
    if (!active || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const id = window.setInterval(() => {
      setShown(false);
      window.setTimeout(() => {
        setIdx((i) => (i + 1) % EXAMPLES.length);
        setShown(true);
      }, 350);
    }, 2800); /* faster (Gary): ~2.8s a prompt, 0.35s fade */
    return () => window.clearInterval(id);
  }, [active]);
  return { example: EXAMPLES[idx], shown };
}

export function PromptBox({ id = 'hero', compact = false }: { id?: string; compact?: boolean }) {
  const [text, setText] = useState('');
  const { example, shown } = useRotatingExample(text === '');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    goToBolt(text || example);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      goToBolt(text || example);
    }
  };
  return (
    <form className={`hm-prompt${compact ? ' hm-prompt--compact' : ''}`} onSubmit={submit}>
      <label className="fw-sr" htmlFor={`${id}-prompt`}>Describe what you want to build</label>
      <div className="hm-prompt-field">
        {/* the example sits under a transparent textarea so it can fade; the
            native placeholder stays for screen readers / no-JS */}
        <span className={`hm-prompt-example${shown ? '' : ' is-out'}${text ? ' is-hidden' : ''}`} aria-hidden="true">
          {example}
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
        {!compact && (
          <div className="hm-prompt-pills" aria-label="Example prompts">
            {hero.promptPills.map((p) => (
              <button key={p.label} type="button" className="hm-prompt-pill" onClick={() => setText(p.prompt)}>
                {p.label}
              </button>
            ))}
          </div>
        )}
        <button type="submit" className="hm-prompt-submit">
          {hero.promptCta}
          {/* filled send arrowhead (Gary, 2026-10-16), not the thin link arrow */}
          <svg className="hm-prompt-send" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M1.5 2.2c0-.9.95-1.5 1.75-1.1l11.4 6.1a1 1 0 0 1 0 1.76L3.25 15.1c-.8.42-1.75-.18-1.75-1.08V9.7L9 8 1.5 6.3V2.2z" />
          </svg>
        </button>
      </div>
    </form>
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
        <p className="fw-hero-sub">{hero.subtitle}</p>
        <PromptBox />
        <TrustPills items={hero.trust} />
      </div>
    </section>
  );
}

import { useState, type FormEvent, type KeyboardEvent } from 'react';
import { hero } from '../config';
import { BgVideo } from './ui';

/* Carries the prompt into Bolt's composer and submits it there (the
   use-case pages' goToBolt). Opens in a new tab. */
export function goToBolt(prompt: string) {
  const text = prompt.trim() || hero.promptExample;
  window.open('https://bolt.new/?autosubmit=true#prompt=' + encodeURIComponent(text), '_blank', 'noopener');
}

/* The hero prompt box: white card, textarea, suggestion pills, Build now. */
export function PromptBox({ id = 'hero', compact = false }: { id?: string; compact?: boolean }) {
  const [text, setText] = useState('');
  const submit = (e: FormEvent) => {
    e.preventDefault();
    goToBolt(text);
  };
  const onKey = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      goToBolt(text);
    }
  };
  return (
    <form className={`hm-prompt${compact ? ' hm-prompt--compact' : ''}`} onSubmit={submit}>
      <label className="fw-sr" htmlFor={`${id}-prompt`}>Describe what you want to build</label>
      <textarea
        id={`${id}-prompt`}
        className="hm-prompt-input"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={onKey}
        placeholder={hero.promptExample}
        rows={2}
      />
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
          <i className="fw-arrow" aria-hidden="true" />
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

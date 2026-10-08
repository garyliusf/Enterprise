import { useEffect, useState } from 'react';
import { BOLT_URL } from '../config';
import { BoltLogo, Btn } from './ui';

const LINKS = [
  { href: '#weekend', label: 'Build Weekend' },
  { href: '#schedule', label: 'Sessions' },
  { href: '#compete', label: 'Contest' },
  { href: '#faq', label: 'FAQ' },
];

/* Slim campaign bar. Sits over the hero transparent at rest and turns solid
   once scrolled — the same behaviour as the site's over-hero nav. */
export function Nav({ overHero = true }: { overHero?: boolean }) {
  const [scrolled, setScrolled] = useState(!overHero);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!overHero) return;
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [overHero]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const solid = scrolled || open;
  return (
    <header className={`fw-nav${solid ? ' is-solid' : ''}${open ? ' is-open' : ''}`}>
      <div className="fw-nav-bar">
        <a className="fw-nav-brand" href={overHero ? '#top' : '/'} aria-label="Builder’s Week home">
          <BoltLogo className="fw-nav-logo" />
          <span className="fw-nav-divider" aria-hidden="true" />
          <span className="fw-nav-campaign">Builder’s Week</span>
        </a>
        {overHero && (
          <nav className="fw-nav-links" aria-label="Sections">
            {LINKS.map((l) => (
              <a key={l.href} href={l.href}>
                {l.label}
              </a>
            ))}
          </nav>
        )}
        <div className="fw-nav-actions">
          <a className="fw-nav-bolt" href={BOLT_URL} target="_blank" rel="noopener">
            Open Bolt
          </a>
          {overHero && (
            <Btn href="#compete" className="fw-nav-cta">
              Enter to Win $10k
            </Btn>
          )}
          {overHero && (
            <button
              className="fw-nav-burger"
              aria-label={open ? 'Close menu' : 'Open menu'}
              aria-expanded={open}
              onClick={() => setOpen(!open)}
            >
              <span />
              <span />
            </button>
          )}
        </div>
      </div>
      {overHero && (
        <div className="fw-nav-drawer" hidden={!open}>
          {LINKS.map((l) => (
            <a key={l.href} href={l.href} onClick={() => setOpen(false)}>
              {l.label}
              <i className="fw-arrow" aria-hidden="true" />
            </a>
          ))}
          <a href="#compete" onClick={() => setOpen(false)}>
            Enter to Win $10k
            <i className="fw-arrow" aria-hidden="true" />
          </a>
        </div>
      )}
    </header>
  );
}

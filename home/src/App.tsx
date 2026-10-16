import { useEffect } from 'react';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Competition, Faq, FooterCta, FooterZone, Schedule, SiteFooter, Templates, Timeline, Weekend } from './components/Sections';
import { Terms } from './components/Terms';
import { ThemeSwitch } from './components/ThemeSwitch';
import { TERMS_PATH, THANKS_PATH } from './config';
import { Thanks } from './components/Thanks';

export default function App() {
  const path = window.location.pathname.replace(/\/$/, '');
  const isTerms = path === TERMS_PATH.replace(/\/$/, '');
  const isThanks = path === THANKS_PATH.replace(/\/$/, '');

  /* shared-components.js scans the DOM once when it runs (pixel-fill button
     hovers, FAQ open-state canvases, eyebrow scramble, heading word reveal),
     so it is loaded after the first render, not from index.html. */
  useEffect(() => {
    import('./vendor/shared-components.js');
  }, []);

  if (isThanks) {
    return (
      <>
        <Nav overHero={false} />
        <Thanks />
        <FooterZone compact>
          <SiteFooter />
        </FooterZone>
        <ThemeSwitch />
      </>
    );
  }

  if (isTerms) {
    return (
      <>
        <Nav overHero={false} />
        <Terms />
        <FooterZone compact>
          <SiteFooter />
        </FooterZone>
        <ThemeSwitch />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Weekend />
        <Timeline />
        <Schedule />
        <Competition />
        <Templates />
        <Faq />
      </main>
      <FooterZone>
        <FooterCta />
        <SiteFooter />
      </FooterZone>
      <ThemeSwitch />
    </>
  );
}

import { useEffect } from 'react';
import { Hero } from './components/Hero';
import { Nav } from './components/Nav';
import { Competition, Faq, FooterCta, Join, Schedule, SiteFooter, Templates, Timeline, Weekend } from './components/Sections';
import { Terms } from './components/Terms';
import { ThemeSwitch } from './components/ThemeSwitch';
import { TERMS_PATH } from './config';

export default function App() {
  const isTerms = window.location.pathname.replace(/\/$/, '') === TERMS_PATH;

  /* shared-components.js scans the DOM once when it runs (pixel-fill button
     hovers, FAQ open-state canvases, eyebrow scramble, heading word reveal),
     so it is loaded after the first render, not from index.html. */
  useEffect(() => {
    import('./vendor/shared-components.js');
  }, []);

  if (isTerms) {
    return (
      <>
        <Nav overHero={false} />
        <Terms />
        <SiteFooter />
        <ThemeSwitch />
      </>
    );
  }

  return (
    <>
      <Nav />
      <main>
        <Hero />
        <Timeline />
        <Join />
        <Weekend />
        <Schedule />
        <Templates />
        <Competition />
        <Faq />
        <FooterCta />
      </main>
      <SiteFooter />
      <ThemeSwitch />
    </>
  );
}

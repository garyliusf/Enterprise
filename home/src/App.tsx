import { useEffect } from 'react';
import { Hero } from './components/Hero';
import { SiteFooterStd, SiteNav } from './components/SiteChrome';
import { FooterZone } from './components/Sections';
import { Closing, Enterprise, Showcase, Stats, Steps, Stories, TemplatesHome, UseCases, WhatsNew } from './components/Home';
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
        <SiteNav overHero={false} />
        <Thanks />
        <SiteFooterStd />
        <ThemeSwitch />
      </>
    );
  }

  if (isTerms) {
    return (
      <>
        <SiteNav overHero={false} />
        <Terms />
        <SiteFooterStd />
        <ThemeSwitch />
      </>
    );
  }

  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <Showcase />
        <Stats />
        <UseCases />
        <Stories />
        <Steps />
        <TemplatesHome />
        <WhatsNew />
        <Enterprise />
      </main>
      <FooterZone>
        <Closing />
      </FooterZone>
      <SiteFooterStd />
      <ThemeSwitch />
    </>
  );
}

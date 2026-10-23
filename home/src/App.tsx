import { useEffect } from 'react';
import { ThemeSwitch } from './components/ThemeSwitch';
import { Hero } from './components/Hero';
import { SiteFooterStd, SiteNav } from './components/SiteChrome';
import { FooterZone } from './components/Sections';
import './components/VariantSwitch'; /* stamps html[data-variant] (E unless ?variant=) before first paint of the sections */
import { Closing, Enterprise, Showcase, Stats, Steps, Stories, Platform, TemplatesHome, UseCases } from './components/Home';

export default function App() {
  /* shared-components.js scans the DOM once when it runs (pixel-fill button
     hovers, FAQ open-state canvases, eyebrow scramble, heading word reveal),
     so it is loaded after the first render, not from index.html. */
  useEffect(() => {
    import('./vendor/shared-components.js');
  }, []);

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
        <Platform />
        <Enterprise />
      </main>
      <FooterZone>
        <Closing />
      </FooterZone>
      <SiteFooterStd />
      <ThemeSwitch /> {/* review-only light/dark switch, back for testing (Gary, 2026-10-23) */}
    </>
  );
}

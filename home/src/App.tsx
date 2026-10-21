import { useEffect } from 'react';
import { Hero } from './components/Hero';
import { SiteFooterStd, SiteNav } from './components/SiteChrome';
import { FooterZone } from './components/Sections';
import { Closing, Enterprise, Showcase, Stats, Steps, Stories, Platform, TemplatesHome, UseCases } from './components/Home';
import { ThemeSwitch } from './components/ThemeSwitch';
import { VariantSwitch } from './components/VariantSwitch';

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
      <VariantSwitch />
      <ThemeSwitch />
    </>
  );
}

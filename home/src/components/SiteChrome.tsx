import { useEffect } from 'react';
import navHtml from '../chrome/nav.html?raw';
import footerHtml from '../chrome/footer.html?raw';
import { asset } from '../config';

/* The standard marketing navbar + site footer (marketing/shared-nav-footer.*),
   rendered from the verbatim markup in src/chrome/. The shared script binds
   to the DOM when it runs, so it is imported once after the first render. */
let chromeJs: Promise<unknown> | null = null;
function useChromeScript() {
  useEffect(() => {
    chromeJs ??= import('../vendor/shared-nav-footer.js');
  }, []);
}

export function SiteNav({ overHero = true }: { overHero?: boolean }) {
  useChromeScript();
  const html = overHero ? navHtml : navHtml.replace('class="mkt-nav mkt-nav--over-hero"', 'class="mkt-nav"');
  /* display: contents — the wrapper is not a box, so the nav's own
     positioning (sticky / over-hero) is unaffected */
  return (
    <div
      className={`home-chrome${overHero ? '' : ' home-chrome--solid'}`}
      style={{ display: 'contents' }}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export function SiteFooterStd() {
  const html = footerHtml.replace(/__WORDMARK__/g, asset('/footer/bolt-bottom-dark.webp')); // dark footer in both themes (Gary)
  /* the wordmark shimmer scans for its canvas when shared-components.js runs,
     which is before this footer mounts: kick it once the canvas exists */
  useEffect(() => {
    const w = window as unknown as { __scShimmer?: () => void; __scWordmark?: { light: string; dark: string } };
    w.__scWordmark = { light: asset('/footer/bolt-bottom-light.webp'), dark: asset('/footer/bolt-bottom-dark.webp') };
    import('../vendor/wordmark-shimmer.js').then(() => w.__scShimmer?.());
  }, []);
  /* sc-on-dark: the footer + wordmark read the dark tokens in either theme */
  return <div className="home-chrome sc-on-dark" style={{ display: 'contents' }} dangerouslySetInnerHTML={{ __html: html }} />;
}

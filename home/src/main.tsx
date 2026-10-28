import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
/* page first, shared LAST — the brand rule: shared-components.css is the
   canonical source and wins the cascade (it carries the tablet/phone header
   rhythm, subtitle leading and button sizes that page rules must not undo) */
import './styles/page.css';
import './styles/shared-nav-footer.css';
import './styles/shared-components.css';

/* REVIEW-ONLY diagnostic (hero hover flicker, 2026-10-28): ?fx=noshimmer,noring
   switches hero effects off one at a time so the culprit can be found on a
   real GPU. Strip before any port. */
const fx = new URLSearchParams(location.search).get('fx');
if (fx) document.documentElement.setAttribute('data-fx', fx.replace(/,/g, ' '));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

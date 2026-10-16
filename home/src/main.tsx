import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
/* page first, shared LAST — the brand rule: shared-components.css is the
   canonical source and wins the cascade (it carries the tablet/phone header
   rhythm, subtitle leading and button sizes that page rules must not undo) */
import './styles/page.css';
import './styles/shared-components.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

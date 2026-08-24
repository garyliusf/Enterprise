/* ═══════════════════════════════════════════════════════════════════════════
   SHARED NAVBAR JS  —  mega-menu + mobile drawer
   ───────────────────────────────────────────────────────────────────────────
   Extracted verbatim (2026-08-06) from marketing/templates/index.html.
   Every block self-guards (`if (!nav) return;`), so this file is safe to load
   on pages that don't render the navbar markup.

   NOTE: the two marketing/templates pages still carry inline copies — mirror
   changes there until they're migrated. Pair with shared-nav-footer.css.
   ═══════════════════════════════════════════════════════════════════════════ */

/* ── Navbar mega-menu — hover to preview, click to lock, outside-click/ESC closes ─── */
(function () {
  var nav = document.querySelector('.mkt-nav');
  if (!nav) return;
  var scrim = document.querySelector('.mkt-nav-scrim');
  var triggers = nav.querySelectorAll('.mkt-nav-link[data-menu]');
  var panels = nav.querySelectorAll('.mkt-nav-panel');
  var openKey = null;         /* which menu is currently open, if any */
  var hoverTimer = null;

  function setOpen(key) {
    openKey = key;
    triggers.forEach(function (t) {
      var active = t.getAttribute('data-menu') === key;
      t.classList.toggle('is-open', active);
      t.setAttribute('aria-expanded', active ? 'true' : 'false');
    });
    panels.forEach(function (p) {
      var active = p.getAttribute('data-panel') === key;
      p.classList.toggle('is-open', active);
      p.setAttribute('aria-hidden', active ? 'false' : 'true');
    });
    if (scrim) scrim.classList.toggle('is-open', !!key);
    nav.classList.toggle('has-menu-open', !!key);
  }

  /* Hover listener lives on the parent <li> (which fills the full 68px nav height) rather than the button itself — small vertical cursor movements above/below the button text no longer exit the hover zone and don't cause the dropdown to flicker. Click stays on the button for accessibility. */
  var hoverZones = nav.querySelectorAll('.mkt-nav-items li[data-menu]');
  triggers.forEach(function (t) {
    t.addEventListener('click', function (e) {
      e.stopPropagation();
      var key = t.getAttribute('data-menu');
      setOpen(openKey === key ? null : key);
    });
  });
  hoverZones.forEach(function (z) {
    var key = z.getAttribute('data-menu');
    z.addEventListener('mouseenter', function () {
      clearTimeout(hoverTimer);
      /* If a menu is already open, switch instantly — no delay. Fresh open uses a short defer to avoid triggering on incidental mouseovers. */
      if (openKey) setOpen(key);
      else hoverTimer = setTimeout(function () { setOpen(key); }, 80);
    });
  });
  /* Plain items (Templates, Pricing) and the right-hand actions have no
     data-menu, so nothing fired when the pointer moved onto them and an open
     panel just stayed up: the nav's own mouseleave can't help because the
     cursor is still inside the nav. Moving onto a non-dropdown item is a
     deliberate move away, so close immediately — same instant feel as
     switching between two dropdowns. */
  var closeZones = nav.querySelectorAll('.mkt-nav-items li:not([data-menu]), .mkt-nav-right');
  closeZones.forEach(function (z) {
    z.addEventListener('mouseenter', function () {
      clearTimeout(hoverTimer);
      if (openKey) setOpen(null);
    });
  });

  /* Keep the menu open when the pointer is inside the panel, close when both trigger + panel are left. */
  panels.forEach(function (p) {
    p.addEventListener('mouseenter', function () { clearTimeout(hoverTimer); });
    p.addEventListener('mouseleave', function () {
      hoverTimer = setTimeout(function () { setOpen(null); }, 120);
    });
  });
  nav.addEventListener('mouseleave', function () {
    hoverTimer = setTimeout(function () { setOpen(null); }, 120);
  });

  /* Outside-click + Escape close. */
  document.addEventListener('click', function (e) {
    if (openKey && !nav.contains(e.target)) setOpen(null);
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && openKey) setOpen(null);
  });
  if (scrim) scrim.addEventListener('click', function () { setOpen(null); });
})();

/* ── Mobile drawer — hamburger toggles the sheet + morphs into an X; drill-down navigation for Platform / Solutions / Resources with a Back button; Escape exits. The drawer sits below the sticky nav so the hamburger stays visible + interactive as the persistent close control. ─── */
(function () {
  var drawer = document.getElementById('mkt-nav-mobile');
  if (!drawer) return;
  var navEl = document.querySelector('.mkt-nav');
  var burger = document.querySelector('.mkt-nav-burger');
  /* Back button now lives in the sticky nav bar (data-mobile-back) — the drawer's own header back button is legacy DOM that stays for a safety net if the nav one isn't found. */
  var backBtns = document.querySelectorAll('[data-mobile-back], .mkt-nav-mobile-back');
  var views = drawer.querySelectorAll('.mkt-nav-mobile-view');
  var drills = drawer.querySelectorAll('[data-drill]');

  function openDrawer() {
    drawer.classList.add('is-open');
    drawer.setAttribute('aria-hidden', 'false');
    document.body.classList.add('mkt-nav-mobile-open');
    if (navEl) navEl.classList.add('has-menu-open');
    if (burger) {
      burger.classList.add('is-open');
      burger.setAttribute('aria-expanded', 'true');
      burger.setAttribute('aria-label', 'Close menu');
    }
    setView('home');
  }
  function closeDrawer() {
    drawer.classList.remove('is-open');
    drawer.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('mkt-nav-mobile-open');
    if (navEl) navEl.classList.remove('has-menu-open');
    /* Reset submenu state so the next open lands on home. */
    if (navEl) navEl.classList.remove('is-on-submenu');
    if (burger) {
      burger.classList.remove('is-open');
      burger.setAttribute('aria-expanded', 'false');
      burger.setAttribute('aria-label', 'Open menu');
    }
  }
  function toggleDrawer() {
    if (drawer.classList.contains('is-open')) closeDrawer();
    else openDrawer();
  }
  function setView(key) {
    views.forEach(function (v) {
      v.classList.toggle('is-active', v.getAttribute('data-view') === key);
    });
    var onSubmenu = key !== 'home';
    drawer.classList.toggle('is-on-submenu', onSubmenu);
    /* Also flip .is-on-submenu on the sticky nav so the nav-bar Back button appears (and the logo hides) in the same header row. */
    if (navEl) navEl.classList.toggle('is-on-submenu', onSubmenu);
  }

  if (burger) burger.addEventListener('click', toggleDrawer);
  backBtns.forEach(function (b) { b.addEventListener('click', function () { setView('home'); }); });
  drills.forEach(function (btn) {
    btn.addEventListener('click', function () {
      setView(btn.getAttribute('data-drill'));
    });
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && drawer.classList.contains('is-open')) closeDrawer();
  });
})();

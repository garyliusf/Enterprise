/* ============================================================================
   SHARED COMPONENTS JS — behaviors for standardized components.
   Loaded at the end of <body> on each page.
   Currently: FAQ open-state pixel animation (the dotted field that fades in
   on the right of an open FAQ item) · Hero video card → fullscreen modal.
   ============================================================================ */
(function () {
  var items = document.querySelectorAll('.ms-faq-item');
  if (!items.length) return;
  var dpr = window.devicePixelRatio || 1;
  var canvasObjs = [];

  items.forEach(function (item, idx) {
    var canvas = document.createElement('canvas');
    canvas.className = 'ms-faq-open-canvas';
    item.insertBefore(canvas, item.firstChild);
    canvasObjs.push({ canvas: canvas, item: item, phase: idx * 1.7 });
  });

  function resizeAll() {
    canvasObjs.forEach(function (obj) {
      obj.canvas.width = obj.item.offsetWidth * dpr;
      obj.canvas.height = obj.item.offsetHeight * dpr;
    });
  }
  resizeAll();
  window.addEventListener('resize', resizeAll);

  function draw(t) {
    canvasObjs.forEach(function (obj) {
      if (!obj.item.classList.contains('is-open')) return;
      var canvas = obj.canvas;
      var h = obj.item.offsetHeight;
      if (canvas.height !== h * dpr) {
        canvas.width = obj.item.offsetWidth * dpr;
        canvas.height = h * dpr;
      }
      var ctx = canvas.getContext('2d');
      var W = canvas.width, H = canvas.height;
      ctx.clearRect(0, 0, W, H);

      var sp = 7 * dpr, maxR = 2.2 * dpr;
      var cols = Math.ceil(W / sp) + 1, rows = Math.ceil(H / sp) + 1;

      for (var r = 0; r < rows; r++) {
        for (var c = 0; c < cols; c++) {
          var px = c * sp, py = r * sp;
          var hFade = Math.max(0, Math.min(1, (px / W - 0.2) / 0.5));
          var fade = hFade;
          if (fade < 0.02) continue;

          var angle1 = t * 0.00012 + obj.phase;
          var u1 = (px * Math.cos(angle1) + py * Math.sin(angle1)) / (350 * dpr);
          var v1 = (-px * Math.sin(angle1) + py * Math.cos(angle1)) / (220 * dpr);
          var angle2 = t * 0.00022 + obj.phase + 1.5;
          var u2 = (px * Math.cos(angle2) + py * Math.sin(angle2)) / (180 * dpr);
          var v2 = (-px * Math.sin(angle2) + py * Math.cos(angle2)) / (120 * dpr);

          var wave = (Math.sin(u1 * Math.PI * 2 + t * 0.00030) * Math.cos(v1 * Math.PI * 1.5))
                   * 0.55 + (Math.sin(u2 * Math.PI * 2 + t * 0.00060) * 0.45);
          var density = Math.pow(Math.max(0, wave * 0.5 + 0.5), 0.8) * fade;
          var rand = (Math.sin(c * 127.1 + r * 311.7 + obj.phase * 50) * 0.5 + 0.5) * 0.9;
          if (density > rand) {
            var alpha = density * 0.25;
            ctx.beginPath();
            ctx.arc(px, py, maxR * density, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(180,185,195,' + alpha.toFixed(2) + ')';
            ctx.fill();
          }
        }
      }
    });
    requestAnimationFrame(draw);
  }
  requestAnimationFrame(draw);
})();

/* ============================================================================
   HERO VIDEO COMPONENT — card click → fullscreen modal (tella embed)
   Markup hooks: #hero-video-card, #hero-play-btn, #video-modal,
   #video-modal-close, #modal-video[data-tella]. No-ops if absent.
   The tella slug comes from #modal-video's data-tella attribute. Clicks on the
   bottom strip (.hero-card-strip) are ignored so the CTA/form still works.
   ============================================================================ */
(function () {
  var card = document.getElementById('hero-video-card');
  var playBtn = document.getElementById('hero-play-btn');
  var modal = document.getElementById('video-modal');
  var closeBtn = document.getElementById('video-modal-close');
  var modalVideo = document.getElementById('modal-video');
  if (!card || !modal) return;
  var ytId = modalVideo ? modalVideo.getAttribute('data-youtube') : null;
  var tellaId = modalVideo ? modalVideo.getAttribute('data-tella') : null;

  card.addEventListener('click', function (e) {
    if (e.target.closest('.hero-card-strip')) return; /* let strip CTA/form work */
    modal.classList.add('open');
    if (modalVideo && ytId) {
      modalVideo.innerHTML = '<iframe src="https://www.youtube-nocookie.com/embed/' + ytId +
        '?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen></iframe>';
    } else if (modalVideo && tellaId) {
      modalVideo.innerHTML = '<iframe src="https://www.tella.tv/video/' + tellaId +
        '/embed?b=0&title=0&a=1&loop=0&t=0&muted=0&wt=0&o=0" allow="autoplay; fullscreen" allowtransparency></iframe>';
    }
    var ifr = modalVideo ? modalVideo.querySelector('iframe') : null;
    if (ifr) ifr.addEventListener('load', function () { ifr.classList.add('is-loaded'); });
    if (playBtn) {
      playBtn.classList.add('clicked');
      setTimeout(function () {
        playBtn.classList.remove('clicked');
        playBtn.classList.add('returning');
        setTimeout(function () { playBtn.classList.remove('returning'); }, 400);
      }, 550);
    }
  });

  function closeModal() {
    modal.classList.remove('open');
    if (modalVideo) modalVideo.innerHTML = '';
  }
  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  modal.addEventListener('click', function (e) { if (e.target === modal) closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
})();

/* ============================================================================
   PIXEL-FILL BUTTON HOVER — canonical, byte-for-byte port of the page-local
   implementation on solutions/ai-for-real-estate. Auto-runs on every
   .hero-btn-primary / .hero-btn-ghost / .footer-cta-btn on the page. The
   matching .btn-pixel-canvas + .btn-pixelized CSS lives in shared-components.css.
   ============================================================================ */
(function () {
  function attach(btn, color) {
    if (btn.__pixelized) return;
    btn.__pixelized = true;
    btn.classList.add('btn-pixelized');
    var canvas = document.createElement('canvas');
    canvas.className = 'btn-pixel-canvas';
    btn.insertBefore(canvas, btn.firstChild);
    var ctx = canvas.getContext('2d');
    var spacing = 4, dot = 2, cols = 0, rows = 0, noise = [];
    function resize() {
      var r = btn.getBoundingClientRect();
      if (!r.width || !r.height) return;
      canvas.width = Math.round(r.width);
      canvas.height = Math.round(r.height);
      cols = Math.ceil(canvas.width / spacing);
      rows = Math.ceil(canvas.height / spacing);
      noise = [];
      for (var y = 0; y < rows; y++) {
        noise[y] = [];
        for (var x = 0; x < cols; x++) {
          var bias = 1 - (y / Math.max(1, rows - 1));
          noise[y][x] = bias * 0.55 + Math.random() * 0.55;
        }
      }
      draw();
    }
    try { new ResizeObserver(resize).observe(btn); } catch (e) {}
    window.addEventListener('resize', resize);
    requestAnimationFrame(resize);
    var progress = 0, target = 0, raf = null, last = 0;
    function tick(t) {
      if (!last) last = t;
      var dt = Math.min(0.05, (t - last) / 1000); last = t;
      progress += (target - progress) * Math.min(1, dt * 8);
      if (Math.abs(target - progress) < 0.003) progress = target;
      draw();
      if (progress !== target) { raf = requestAnimationFrame(tick); }
      else { raf = null; last = 0; if (target === 1) flickerLoop(); }
    }
    function flickerLoop() {
      requestAnimationFrame(function step() {
        if (target !== 1) return;
        draw(true);
        setTimeout(function () { requestAnimationFrame(step); }, 120);
      });
    }
    function draw(flicker) {
      if (!canvas.width) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = color;
      var threshold = progress * 1.3;
      for (var y = 0; y < rows; y++) {
        for (var x = 0; x < cols; x++) {
          var n = noise[y][x];
          if (n < threshold) {
            if (flicker && target === 1 && Math.random() < 0.015) continue;
            var edge = threshold - n;
            if (edge < 0.08 && Math.random() < 0.45) continue;
            ctx.fillRect(x * spacing, y * spacing, dot, dot);
          }
        }
      }
    }
    btn.addEventListener('mouseenter', function () { target = 1; if (!raf) { last = 0; raf = requestAnimationFrame(tick); } });
    btn.addEventListener('mouseleave', function () { target = 0; if (!raf) { last = 0; raf = requestAnimationFrame(tick); } });
  }
  function init() {
    document.querySelectorAll('.hero-btn-primary').forEach(function (b) { attach(b, '#0a5aa8'); });
    document.querySelectorAll('.hero-btn-ghost').forEach(function (b) { attach(b, 'rgba(255,255,255,0.18)'); });
    document.querySelectorAll('.footer-cta-btn').forEach(function (b) { attach(b, '#0a5aa8'); });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

/* ============================================================================
   BOLT WORDMARK SHIMMER — animates light strips across the BOLT wordmark
   image at the bottom of marketing/solutions pages. Auto-initializes on any
   page that includes a #bolt-shimmer-canvas inside a parent <img>. The image
   must be loaded same-origin (or with crossorigin="anonymous") so getImageData
   can sample bright vertical strips from the wordmark.
   ============================================================================ */
(function () {
  var canvas = document.getElementById('bolt-shimmer-canvas');
  if (!canvas || !canvas.getContext) return;
  var wrap = canvas.parentElement;
  var img  = wrap && wrap.querySelector('img');
  if (!img) return;
  var ctx = canvas.getContext('2d');
  var W, H, strips = [], t = 0;
  var hoverT = 0, isHovered = false, splashT = 0, splashStart = null, splashDuration = 300;

  var observer = new IntersectionObserver(function (entries) {
    if (entries[0].isIntersecting && !splashStart) { splashStart = Date.now(); observer.disconnect(); }
  }, { threshold: 0.1 });
  observer.observe(wrap);

  function sampleStrips() {
    var SW = 400, SH = 200;
    var s = document.createElement('canvas');
    s.width = SW; s.height = SH;
    var sc = s.getContext('2d');
    try { sc.drawImage(img, 0, 0, SW, SH); } catch (e) { return; }
    var data;
    try { data = sc.getImageData(0, 0, SW, SH).data; } catch (e) { return; }
    strips = [];
    var inStrip = false, stripStart = 0;
    for (var x = 0; x < SW; x++) {
      var b = 0;
      for (var y = 20; y < SH - 20; y++) {
        var idx = (y * SW + x) * 4;
        b += (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      }
      b /= (SH - 40);
      if (b > 28 && !inStrip) { inStrip = true; stripStart = x; }
      else if (b <= 28 && inStrip) {
        inStrip = false;
        var cx = (stripStart + x) / 2 / SW;
        var w = (x - stripStart) / SW;
        strips.push({
          cx: cx, w: w,
          phase: Math.random() * Math.PI * 2,
          freq: 0.5 + Math.random() * 1.2,
          yPhase: Math.random() * Math.PI * 2,
          yFreq: 0.35 + Math.random() * 0.7,
          speedMult: 0.6 + Math.random() * 0.8,
        });
      }
    }
  }

  function init() {
    var r = wrap.getBoundingClientRect();
    W = canvas.width = r.width; H = canvas.height = r.height;
    t = Math.random() * 80;
    sampleStrips();
    var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
    if (isTouch) splashDuration = 1500;
    else {
      wrap.addEventListener('mouseenter', function () { isHovered = true; });
      wrap.addEventListener('mouseleave', function () { isHovered = false; });
    }
    requestAnimationFrame(tick);
  }

  function tick() {
    var splashRaw = splashStart ? Math.max(0, 1 - (Date.now() - splashStart) / splashDuration) : 0;
    splashT = splashRaw * splashRaw * splashRaw;
    t += 0.012 + hoverT * 0.008;  /* canonical: matches ai-for-real-estate / bolt-cli.html — enterprise-v2's 0.028 was an outlier */
    hoverT += ((isHovered ? 1 : 0) - hoverT) * (isHovered ? 0.07 : 0.025);

    ctx.clearRect(0, 0, W, H);
    for (var i = 0; i < strips.length; i++) {
      var st = strips[i];
      var brightness = (Math.sin(t * st.freq * st.speedMult + st.phase) * 0.5 + 0.5);
      if (brightness < 0.01) continue;
      var x = st.cx * W;
      var w = Math.max(st.w * W, 3);
      var centerY = (Math.sin(t * st.yFreq * st.speedMult + st.yPhase) * 0.5 + 0.5) * H;
      var spread = H * (0.55 + hoverT * 0.25);

      var baseA  = brightness * 0.11;
      var peakA  = brightness * 0.28;
      var boost  = Math.max(hoverT, splashT);
      var a  = (baseA + (peakA - baseA) * boost).toFixed(3);
      var a2 = (parseFloat(a) * 1.4).toFixed(3);

      var grad = ctx.createLinearGradient(0, centerY - spread, 0, centerY + spread);
      grad.addColorStop(0,   'rgba(220,225,240,0)');
      grad.addColorStop(0.3, 'rgba(220,225,240,' + a + ')');
      grad.addColorStop(0.5, 'rgba(255,255,255,' + a2 + ')');
      grad.addColorStop(0.7, 'rgba(220,225,240,' + a + ')');
      grad.addColorStop(1,   'rgba(220,225,240,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - w / 2, 0, w, H);
    }
    requestAnimationFrame(tick);
  }

  if (img.complete && img.naturalWidth) init();
  else img.addEventListener('load', init, { once: true });
  window.addEventListener('resize', function () {
    var r = wrap.getBoundingClientRect();
    W = canvas.width = r.width; H = canvas.height = r.height;
  });
})();

/* ============================================================================
   SCROLL ANIMATIONS — eyebrow scramble + word reveal
   Canonical across every marketing page. Triggers when an element scrolls
   into view (50% threshold):
   - .eyebrow-scramble → letter-by-letter scramble entrance, re-fires every 6s
   - .dsa-reveal       → per-word blur+slide reveal on the h1/h2 inside
   ============================================================================ */
(function () {
  /* Pages that ship their OWN word-reveal + scramble (microsoft, bolt-cli,
     platform, pricing — all complete before shared-components.js existed; they
     link this file for the FAQ/button components only) set
     `window.__pageOwnsScrollAnims = true` before this script loads. Running
     both implementations on the same elements is a race that corrupts text —
     each captures "final" text at run time, so whichever starts second locks
     in the other's mid-animation garbage. One owner per page, never two. */
  if (window.__pageOwnsScrollAnims) return;
  if (typeof IntersectionObserver === 'undefined') return;
  var scrambleChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';

  function scrambleEl(el) {
    /* Guard 1: never scramble an element that contains child elements. This
       animation assigns to textContent, which would delete them — e.g. the
       Microsoft logo <svg> inside the "Now available in..." badge. */
    if (el.children.length) return;
    /* Guard 2: prefer the snapshot taken at bind() time. Reading textContent
       here is unsafe on pages that ALSO run their own scramble: if theirs is
       mid-animation we'd capture garbled text and lock it in as "final". */
    var final = el.dataset.sf || el.textContent.trim();
    el.dataset.sf = final;
    var chars = final.split('');
    var locked = chars.map(function () { return false; });
    var cur = chars.map(function (c) { return c === ' ' ? ' ' : scrambleChars[Math.floor(Math.random() * scrambleChars.length)]; });
    var start = null, dur = 600;
    (function tick(ts) {
      if (!start) start = ts;
      var p = Math.min((ts - start) / dur, 1);
      chars.forEach(function (ch, i) {
        if (ch === ' ') { locked[i] = true; cur[i] = ' '; return; }
        if (!locked[i] && p > (i / chars.length) * 0.75 + Math.random() * 0.1) { locked[i] = true; cur[i] = ch; }
        else if (!locked[i]) cur[i] = scrambleChars[Math.floor(Math.random() * scrambleChars.length)];
      });
      el.textContent = cur.join('');
      if (p < 1 || locked.some(function (l) { return !l; })) requestAnimationFrame(tick);
      else el.textContent = final;
    })(performance.now());
  }

  function wrapWords(el) {
    /* Guard 3: bail if the words are already wrapped. Several pages
       (microsoft, bolt-cli, platform, pricing) ship their own word-reveal that
       wraps via DOM nodes without setting data-wrapped. Running this after
       theirs would regex over the markup THEY produced — `<span`, `class="word"`
       and `style="--i:0;">What` each get wrapped again — and the attribute text
       renders as visible copy in the heading. */
    if (el.querySelector('.word')) return;
    var i = 0;
    el.innerHTML = el.innerHTML.replace(/\S+/g, function (w) {
      return '<span class="word" style="--i:' + (i++) + '">' + w + '</span>';
    });
  }

  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (entry) {
      if (!entry.isIntersecting) return;
      var el = entry.target;
      if (el.classList.contains('dsa-reveal')) {
        el.querySelectorAll('h1, h2').forEach(function (h) {
          if (!h.dataset.wrapped) { wrapWords(h); h.dataset.wrapped = '1'; }
        });
        el.classList.add('is-revealed');
      } else if (el.classList.contains('eyebrow-scramble')) {
        scrambleEl(el);
        if (!el.dataset.scrambleLoop) {
          el.dataset.scrambleLoop = '1';
          setInterval(function () { scrambleEl(el); }, 6000);
        }
      }
      io.unobserve(el);
    });
  }, { threshold: 0.5 });

  /* ── Subtitle block-reveal ───────────────────────────────────────────────
     Section subtitles get a whole-element fade/blur-up when their heading's
     reveal container gains .is-revealed. Crucially this does NOT observe
     scroll itself — it reacts (via MutationObserver) to the class added by
     whichever implementation owns the container (shared's .dsa-reveal IO, or
     a page-local .reveal-h implementation). Single-owner rule holds: only
     this code writes .sc-sub-* classes, and nothing else animates these
     elements. Subtitles containing child elements are still fine — this is a
     class toggle, not an innerHTML rewrite. */
  var SUB_SEL = '.section-sub, .builtin-sub, .detail-sub, .controls-sub, .compliance-sub, .hiw-sub, .agent-desc, .run-callout-sub, .success-sub, .feat-subheadline, .footer-subtitle';   /* only classes that actually sit in/after a reveal container */
  /* DOM-based word wrapper (microsoft.html's proven approach): splits text
     nodes into .word spans and wraps element children whole. Never touches
     innerHTML with a regex, so nested markup cannot be corrupted. The --i
     index continues from startIdx so the subtitle's cascade picks up where
     the heading's words left off — the same rhythm as microsoft. */
  function wrapSubWords(el, startIdx) {
    if (el.querySelector('.word')) return startIdx;
    var idx = startIdx;
    var children = [].slice.call(el.childNodes);
    el.textContent = '';
    children.forEach(function (node) {
      if (node.nodeType === 3) {
        node.textContent.split(/(\s+)/).forEach(function (p) {
          if (!p.trim().length) { if (p.length) el.appendChild(document.createTextNode(p)); return; }
          var s = document.createElement('span'); s.className = 'word'; s.style.setProperty('--i', idx++); s.textContent = p; el.appendChild(s);
        });
      } else if (node.nodeName === 'BR') { el.appendChild(node); }
      else { var w = document.createElement('span'); w.className = 'word'; w.style.setProperty('--i', idx++); w.appendChild(node); el.appendChild(w); }
    });
    return idx;
  }
  function bindSubtitleReveals() {
    document.querySelectorAll('.dsa-reveal, .reveal-h').forEach(function (c) {
      if (c.dataset.scSubBound) return;
      c.dataset.scSubBound = '1';
      var subs = [].slice.call(c.querySelectorAll(SUB_SEL));
      var n = c.nextElementSibling;
      while (n && n.matches && n.matches(SUB_SEL)) { subs.push(n); n = n.nextElementSibling; }
      if (!subs.length) return;
      if (c.classList.contains('is-revealed')) return;   // already fired — leave visible
      /* Start the subtitle's --i after the HEADING's word count so the
         cascade flows heading → subtitle in one continuous sequence. Count
         only the heading — the whole container's text would include the
         eyebrow and the subtitle itself, delaying the subtitle's first word
         by the full total and leaving a dead pause (caught by review on
         bolt-public-pages#250; same code, same bug). */
      var heading = c.querySelector('h1, h2');
      var idx = heading && heading.textContent.trim() ? heading.textContent.trim().split(/\s+/).length : 0;
      subs.forEach(function (s) { s.classList.add('sc-sub-words'); idx = wrapSubWords(s, idx); });
      var mo = new MutationObserver(function () {
        if (!c.classList.contains('is-revealed')) return;
        subs.forEach(function (s) { s.classList.add('sc-sub-go'); });
        mo.disconnect();
      });
      mo.observe(c, { attributes: true, attributeFilter: ['class'] });
    });
  }

  function bind() {
    /* Snapshot each eyebrow's true text BEFORE any animation can run, so a
       page-local scramble can never cause us to capture garbled text as final. */
    document.querySelectorAll('.eyebrow-scramble').forEach(function (el) {
      if (!el.dataset.sf && !el.children.length) el.dataset.sf = el.textContent.trim();
    });
    document.querySelectorAll('.dsa-reveal, .eyebrow-scramble').forEach(function (el) { io.observe(el); });
    bindSubtitleReveals();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', bind);
  else bind();
})();

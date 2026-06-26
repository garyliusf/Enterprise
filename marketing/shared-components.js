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
   PIXEL-FILL BUTTON HOVER — canonical "latest" hover for primary/ghost/footer
   CTAs across all marketing pages. Each button gets a <canvas> child + the
   .btn-pixelized class; on mouseenter the canvas fills with brand-blue dots
   (with a subtle flicker when fully filled), on mouseleave it fades back.
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

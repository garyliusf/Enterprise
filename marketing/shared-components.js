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

/* NOTE: a pixel-fill hover canvas variant exists page-local on
   solutions/ai-for-real-estate, smb, microsoft.html, etc. It's been
   intentionally NOT promoted to shared here because the cross-page
   version was producing visual leakage. The canonical slide-up
   .btn-bg-hover + .btn-text-inner translate in shared-components.css
   is the official hover for any page that only links the shared files
   (e.g. /marketing/integrations). */

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
    t += 0.028 + hoverT * 0.016;
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
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(0.45, 'rgba(255,255,255,' + a + ')');
      grad.addColorStop(0.5, 'rgba(255,255,255,' + a2 + ')');
      grad.addColorStop(0.55, 'rgba(255,255,255,' + a + ')');
      grad.addColorStop(1, 'rgba(255,255,255,0)');
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

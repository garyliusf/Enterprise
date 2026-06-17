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
  var tellaId = modalVideo ? modalVideo.getAttribute('data-tella') : null;

  card.addEventListener('click', function (e) {
    if (e.target.closest('.hero-card-strip')) return; /* let strip CTA/form work */
    modal.classList.add('open');
    if (modalVideo && tellaId) {
      modalVideo.innerHTML = '<iframe src="https://www.tella.tv/video/' + tellaId +
        '/embed?b=0&title=0&a=1&loop=0&t=0&muted=0&wt=0&o=0" allow="autoplay; fullscreen" allowtransparency></iframe>';
    }
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

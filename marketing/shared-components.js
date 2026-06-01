/* ============================================================================
   SHARED COMPONENTS JS — behaviors for standardized components.
   Loaded at the end of <body> on each page.
   Currently: FAQ open-state pixel animation (the dotted field that fades in
   on the right of an open FAQ item).
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

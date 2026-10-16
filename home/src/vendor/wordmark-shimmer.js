/* BOLT WORDMARK SHIMMER — the theme-aware version from marketing/solutions.html
   (2026-10-16): samples the ink-on-white light art inverted, swaps the image
   per theme and sets the blend mode (multiply on light, screen on dark). The
   shared-components.js shimmer only understands the dark art and never drew
   on light. Exposed as a re-callable init because the footer is React-
   rendered and mounts after this script runs. Image URLs come from
   window.__scWordmark = { light, dark }, set by SiteChrome before calling. */
function __scShimmerInit() {
  var canvas = document.getElementById('bolt-shimmer-canvas');
  if (!canvas || canvas.__shimmer) return;
  canvas.__shimmer = true;

  var wrap = canvas.parentElement;
  var img = wrap.querySelector('img');
  var ctx = canvas.getContext('2d');
  if (!ctx) return;

  var WORDMARK_SRC = window.__scWordmark && window.__scWordmark.dark;
  var WORDMARK_LIGHT_SRC = window.__scWordmark && window.__scWordmark.light;
  var SAMPLE_WIDTH = 400, SAMPLE_HEIGHT = 200, SAMPLE_WIDTH_FINE = 1600;
  var STRIP_BRIGHTNESS_THRESHOLD = 28;
  var HOVER_SPLASH_DURATION_MS = 300, TOUCH_SPLASH_DURATION_MS = 1500;

  /* production bails entirely under reduced motion */
  if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  var isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  var splashDuration = isTouch ? TOUCH_SPLASH_DURATION_MS : HOVER_SPLASH_DURATION_MS;

  var strips = [], inView = false, width = 0, height = 0;
  var time = Math.random() * 80, hoverAmount = 0, isHovered = false;
  var splashStart, frame, light = false, frames = 0, lastError = null;

  function isLight() { return document.documentElement.getAttribute('data-theme') !== 'dark'; }

  function sampleStrips(image) {
    var sampleWidth = light ? SAMPLE_WIDTH_FINE : SAMPLE_WIDTH;
    var scratch = document.createElement('canvas');
    scratch.width = sampleWidth; scratch.height = SAMPLE_HEIGHT;
    var c = scratch.getContext('2d', { willReadFrequently: true });
    if (!c) return [];
    c.drawImage(image, 0, 0, sampleWidth, SAMPLE_HEIGHT);
    var data = c.getImageData(0, 0, sampleWidth, SAMPLE_HEIGHT).data;
    var out = [], inStrip = false, stripStart = 0;
    for (var x = 0; x < sampleWidth; x++) {
      var brightness = 0;
      for (var y = 20; y < SAMPLE_HEIGHT - 20; y++) {
        var i = (y * sampleWidth + x) * 4;
        var lum = (data[i] + data[i + 1] + data[i + 2]) / 3;
        brightness += light ? 255 - lum : lum;   /* light art is ink-on-white */
      }
      brightness /= SAMPLE_HEIGHT - 40;
      if (brightness > STRIP_BRIGHTNESS_THRESHOLD && !inStrip) { inStrip = true; stripStart = x; }
      else if (brightness <= STRIP_BRIGHTNESS_THRESHOLD && inStrip) {
        inStrip = false;
        out.push({ centerX: (stripStart + x) / 2 / sampleWidth, width: (x - stripStart) / sampleWidth,
                   phase: Math.random() * Math.PI * 2, frequency: 0.5 + Math.random() * 1.2,
                   yPhase: Math.random() * Math.PI * 2, yFrequency: 0.35 + Math.random() * 0.7,
                   speedMultiplier: 0.6 + Math.random() * 0.8 });
      }
    }
    return out;
  }

  function resize() {
    var rect = wrap.getBoundingClientRect();
    width = canvas.width = Math.round(rect.width);
    height = canvas.height = Math.round(rect.height);
  }

  function tick() {
    if (!inView) { frame = undefined; return; }
    frames++;
    try {
      var splashRaw = splashStart ? Math.max(0, 1 - (Date.now() - splashStart) / splashDuration) : 0;
      var splash = splashRaw * splashRaw * splashRaw;
      time += 0.028 + hoverAmount * 0.016;
      hoverAmount += ((isHovered ? 1 : 0) - hoverAmount) * (isHovered ? 0.07 : 0.025);
      ctx.clearRect(0, 0, width, height);
      for (var i = 0; i < strips.length; i++) {
        var strip = strips[i];
        var brightness = Math.sin(time * strip.frequency * strip.speedMultiplier + strip.phase) * 0.5 + 0.5;
        if (brightness < 0.01) continue;
        var x = strip.centerX * width;
        var stripWidth = Math.max(strip.width * width, light ? 2 : 3);
        var centerY = (Math.sin(time * strip.yFrequency * strip.speedMultiplier + strip.yPhase) * 0.5 + 0.5) * height;
        var spread = height * (0.55 + hoverAmount * 0.25);
        var boost = Math.max(hoverAmount, splash);
        var alpha = brightness * 0.11 + (brightness * 0.28 - brightness * 0.11) * boost;
        var peakAlpha = alpha * 1.4;
        var edge = light ? '35,40,55' : '220,225,240';
        var peak = light ? '10,12,20' : '255,255,255';
        var g = ctx.createLinearGradient(0, centerY - spread, 0, centerY + spread);
        g.addColorStop(0, 'rgba(' + edge + ',0)');
        g.addColorStop(0.3, 'rgba(' + edge + ',' + alpha.toFixed(3) + ')');
        g.addColorStop(0.5, 'rgba(' + peak + ',' + peakAlpha.toFixed(3) + ')');
        g.addColorStop(0.7, 'rgba(' + edge + ',' + alpha.toFixed(3) + ')');
        g.addColorStop(1, 'rgba(' + edge + ',0)');
        ctx.fillStyle = g;
        ctx.fillRect(x - stripWidth / 2, 0, stripWidth, height);
      }
    } catch (e) { lastError = (e && e.message) || String(e); }
    frame = requestAnimationFrame(tick);
  }

  /* Production gates the loop on inView from an IntersectionObserver. That is
     correct but it is also a single point of failure: if the observer has not
     reported by the time the art decodes, nothing ever starts. Compute
     visibility directly as a fallback so start() can never be stranded. */
  function computeInView() {
    var r = wrap.getBoundingClientRect();
    var vh = window.innerHeight || document.documentElement.clientHeight;
    return r.bottom > 0 && r.top < vh;
  }
  function run() { if (frame === undefined && inView) frame = requestAnimationFrame(tick); }
  function start() {
    resize();
    strips = sampleStrips(img);
    if (!inView && computeInView()) { inView = true; if (!splashStart) splashStart = Date.now(); }
    run();
  }

  /* Theme art. Production picks this once; we re-apply on the preview toggle.
     NOTE: mix-blend-mode is set HERE, never authored in the markup — `screen`
     on a white ground is invisible, so an authored default is a trap. */
  var appliedTheme = null;
  function applyTheme() {
    light = isLight();
    var now = light ? 'light' : 'dark';
    if (now === appliedTheme) return;
    appliedTheme = now;
    canvas.style.mixBlendMode = light ? 'multiply' : 'screen';
    img.style.opacity = light ? '0.32' : '0.20';
    var want = light ? WORDMARK_LIGHT_SRC : WORDMARK_SRC;
    if (img.getAttribute('src') !== want) {
      img.setAttribute('src', want);
      img.addEventListener('load', start, { once: true });
    } else if (img.complete && img.naturalWidth) {
      start();
    } else {
      /* src already correct but the image hasn't finished loading — without
         this branch the shimmer never starts on pages that ship the themed
         asset statically (the press race, Gary's "not animating") */
      img.addEventListener('load', start, { once: true });
    }
  }
  document.addEventListener('sc-themechange', applyTheme);

  new ResizeObserver(resize).observe(wrap);
  new IntersectionObserver(function (entries) {
    setInView(entries[0].isIntersecting);
  }, { threshold: 0.1 }).observe(wrap);

  /* The observer is the efficient path, but it is not the only one: it can fail
     to report (nested browsing contexts, some restored-scroll cases), and then
     the loop never starts at all — which is exactly the failure mode being
     chased here. A throttled scroll/resize check keeps inView honest
     regardless, and costs one getBoundingClientRect per frame while scrolling. */
  function setInView(v) {
    if (v === inView) return;
    inView = v;
    if (inView) { if (!splashStart) splashStart = Date.now(); run(); }
  }
  var pending = false;
  function onScroll() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; setInView(computeInView()); });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);

  if (!isTouch) {
    wrap.addEventListener('mouseenter', function () { isHovered = true; });
    wrap.addEventListener('mouseleave', function () { isHovered = false; });
  }

  window.__shimmer = {
    get strips()  { return strips.length; },
    get light()   { return light; },
    get running() { return frame !== undefined; },
    get inView()  { return inView; },
    get frames()  { return frames; },
    get err()     { return lastError; },
    get t()       { return Math.round(time * 100) / 100; },
    get src()     { return (img.currentSrc || img.getAttribute('src') || '').split('/').pop(); },
    get canvas()  { return canvas.width + 'x' + canvas.height; },
    get blend()   { return getComputedStyle(canvas).mixBlendMode; }
  };

  applyTheme();
  if (img.complete && img.naturalWidth) start(); else img.addEventListener('load', start, { once: true });
}
window.__scShimmer = __scShimmerInit;
export {};

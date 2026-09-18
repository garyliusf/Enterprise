/* Bolt Hero Background — Figma plugin
   ---------------------------------------------------------------------------
   Rebuilds marketing/solutions.html's light hero inside Figma:

     · the ramp as a REAL Figma linear gradient fill, so it stays editable
       (drag stops, recolour) rather than arriving as a flat picture
     · the ordered-dither texture as an image layer on top, rasterised in the
       UI's canvas because a vector version would be ~10,000 rectangles at the
       default 5px pitch and would make the file miserable to work in

   Values default to what the page ships; the UI can change them.
   --------------------------------------------------------------------------- */

figma.showUI(__html__, { width: 340, height: 560, themeColors: true });

function hexToRgb(hex) {
  const h = hex.replace('#', '');
  const n = h.length === 3 ? h.split('').map(c => c + c).join('') : h;
  return {
    r: parseInt(n.slice(0, 2), 16) / 255,
    g: parseInt(n.slice(2, 4), 16) / 255,
    b: parseInt(n.slice(4, 6), 16) / 255
  };
}

figma.ui.onmessage = async (msg) => {
  if (msg.type !== 'create') return;

  const { width, height, stops, dither } = msg;

  const frame = figma.createFrame();
  frame.name = 'Bolt hero background';
  frame.resize(width, height);
  frame.clipsContent = true;
  frame.fills = [];

  /* 1. the ramp — a real gradient fill, top to bottom */
  const ramp = figma.createRectangle();
  ramp.name = 'Gradient ramp';
  ramp.resize(width, height);
  ramp.fills = [{
    type: 'GRADIENT_LINEAR',
    /* [[xx, xy, x0], [yx, yy, y0]] — identity scaled to run straight down */
    gradientTransform: [[0, 1, 0], [-1, 0, 1]],
    gradientStops: stops.map(s => ({
      position: s.pos / 100,
      color: Object.assign(hexToRgb(s.hex), { a: 1 })
    }))
  }];
  frame.appendChild(ramp);

  /* 2. the dither — rasterised in the UI and dropped in as an image fill */
  if (dither && dither.bytes) {
    const image = figma.createImage(new Uint8Array(dither.bytes));
    const tex = figma.createRectangle();
    tex.name = 'Ordered dither (Bayer 4x4)';
    tex.resize(width, height);
    tex.fills = [{ type: 'IMAGE', imageHash: image.hash, scaleMode: 'FILL' }];
    frame.appendChild(tex);
  }

  frame.x = figma.viewport.center.x - width / 2;
  frame.y = figma.viewport.center.y - height / 2;
  figma.currentPage.appendChild(frame);
  figma.currentPage.selection = [frame];
  figma.viewport.scrollAndZoomIntoView([frame]);

  figma.notify(`Hero background created — ${width}x${height}`);
  figma.closePlugin();
};

(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var poster = document.querySelector('.poster');
  var canvas = document.getElementById('scene');

  var renderer = new THREE.WebGLRenderer({ canvas: canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.outputEncoding = THREE.sRGBEncoding;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.0;

  var scene = new THREE.Scene();
  var camera = new THREE.PerspectiveCamera(40, 1, 0.1, 100);
  camera.position.set(0, 0, 4.2);

  var ASPECT = B_SHAPE.aspect; // width / height of source image

  // ---- reflection environment for the metal side walls ----
  function makeEnv() {
    var c = document.createElement('canvas'); c.width = 512; c.height = 256;
    var ctx = c.getContext('2d');
    ctx.fillStyle = '#050507'; ctx.fillRect(0, 0, c.width, c.height);
    var g = ctx.createLinearGradient(0, 0, c.width, c.height);
    g.addColorStop(0.00, '#123a9e');
    g.addColorStop(0.25, '#2f7ff0');
    g.addColorStop(0.45, '#060609');
    g.addColorStop(0.62, '#060609');
    g.addColorStop(0.82, '#e07a1e');
    g.addColorStop(1.00, '#ffb347');
    ctx.fillStyle = g; ctx.fillRect(0, 0, c.width, c.height);
    var tex = new THREE.CanvasTexture(c);
    tex.mapping = THREE.EquirectangularReflectionMapping;
    var pm = new THREE.PMREMGenerator(renderer);
    pm.compileEquirectangularShader();
    var rt = pm.fromEquirectangular(tex);
    tex.dispose(); pm.dispose();
    return rt.texture;
  }
  var envMap = makeEnv();

  // ---- build the extruded shape from the traced silhouette ----
  function toShape(loop) {
    var s = new THREE.Path();
    loop.forEach(function (p, i) {
      var x = p[0] * ASPECT;      // u * aspect  (height-normalized world width)
      var y = 1 - p[1];           // flip v so image-top is up
      if (i === 0) s.moveTo(x, y); else s.lineTo(x, y);
    });
    s.closePath();
    return s;
  }
  var shape = new THREE.Shape(B_SHAPE.outer.map(function (p) { return new THREE.Vector2(p[0] * ASPECT, 1 - p[1]); }));
  B_SHAPE.holes.forEach(function (h) {
    shape.holes.push(new THREE.Path(h.map(function (p) { return new THREE.Vector2(p[0] * ASPECT, 1 - p[1]); })));
  });

  // cap UVs map straight back onto the source image
  var uvgen = {
    generateTopUV: function (g, verts, a, b, c) {
      function uv(i) { return new THREE.Vector2(verts[i * 3] / ASPECT, verts[i * 3 + 1]); }
      return [uv(a), uv(b), uv(c)];
    },
    generateSideWallUV: function () {
      return [new THREE.Vector2(0, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 0), new THREE.Vector2(0, 0)];
    }
  };

  var geo = new THREE.ExtrudeGeometry(shape, {
    depth: 0.11,
    bevelEnabled: true,
    bevelThickness: 0.02,
    bevelSize: 0.016,
    bevelSegments: 4,
    curveSegments: 12,
    UVGenerator: uvgen
  });
  geo.center();
  geo.computeVertexNormals();

  // ---- textures / materials ----
  var loader = new THREE.TextureLoader();
  var faceTex = loader.load(B_TEX);
  faceTex.encoding = THREE.sRGBEncoding;
  faceTex.anisotropy = renderer.capabilities.getMaxAnisotropy ? renderer.capabilities.getMaxAnisotropy() : 4;

  // front/back caps = the actual PNG render
  var capMat = new THREE.MeshBasicMaterial({ map: faceTex, transparent: true });
  // side walls = brushed blue->orange metal
  var sideMat = new THREE.MeshStandardMaterial({
    color: 0x4a3a2c, metalness: 1.0, roughness: 0.3,
    envMap: envMap, envMapIntensity: 1.3
  });

  var mesh = new THREE.Mesh(geo, [capMat, sideMat]);
  mesh.scale.setScalar(3.1);

  var pivot = new THREE.Group();
  pivot.rotation.x = 0.12;
  pivot.add(mesh);
  scene.add(pivot);

  scene.add(new THREE.AmbientLight(0xffffff, 0.65));
  var blue = new THREE.DirectionalLight(0x6f9bff, 1.4); blue.position.set(-4, 3, 4); scene.add(blue);
  var orange = new THREE.DirectionalLight(0xffa24a, 1.4); orange.position.set(5, -2, 3); scene.add(orange);

  function resize() {
    var w = poster.clientWidth, h = poster.clientHeight;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', resize); resize();

  if (reduce) {
    mesh.rotation.y = -0.35;
    renderer.render(scene, camera);
  } else {
    var t = 0;
    (function loop() {
      requestAnimationFrame(loop);
      t += 0.016;
      mesh.rotation.y += 0.012;
      pivot.position.y = Math.sin(t * 0.9) * 0.06;
      renderer.render(scene, camera);
    })();
  }
})();

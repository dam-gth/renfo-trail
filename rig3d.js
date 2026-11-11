/* rig3d.js — mannequin 3D (Three.js) piloté par les poses de exercises.js.
   Mêmes paramètres que rig.js (angles sagittaux en degrés, hanche = racine, sol automatique) plus :
     abN/abF : abduction des jambes (écartement latéral, + = vers l'extérieur)
     aaN/aaF : abduction des bras
     roll    : roulis du corps entier autour de l'axe avant (−90 = allongé sur le côté gauche, côté droit en haut)
     tilt    : inclinaison latérale du tronc        hz : décalage latéral (px)
   « near » (n) = côté droit, « far » (f) = côté gauche. Le bonhomme regarde vers +x. */
import * as THREE from './vendor/three.module.min.js';

const S = 0.01, GROUND = 200, D = Math.PI / 180;
const L = { torso: .58, thigh: .5, shin: .46, foot: .2, ua: .36, fa: .32, head: .11, neck: .07, hipW: .09, shW: .17 };
const v = (p, k, d = 0) => (p[k] === undefined ? d : p[k]);
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);

function dir(theta, phi, s) { const t = theta * D, f = phi * D; return V3(Math.sin(t) * Math.cos(f), -Math.cos(t) * Math.cos(f), s * Math.sin(f)); }

export function joints(p) {
  const hip = V3((v(p, 'hx', 100) - 100) * S, 0, v(p, 'hz') * S);
  const tor = v(p, 'tor') * D, tilt = v(p, 'tilt') * D;
  const up = V3(Math.sin(tor), Math.cos(tor) * Math.cos(tilt), Math.cos(tor) * Math.sin(tilt));
  const lat = V3(0, -Math.sin(tilt), Math.cos(tilt));
  const neck = hip.clone().addScaledVector(up, L.torso);
  const head = neck.clone().addScaledVector(up, L.neck + L.head);
  const J = { hip, neck, head };
  for (const [side, s, th, kn, ft, ab, ua, el, aa] of [['N', 1, 'tn', 'kn', 'fn', 'abN', 'un', 'en', 'aaN'], ['F', -1, 'tf', 'kf', 'ff', 'abF', 'uf', 'ef', 'aaF']]) {
    const hj = hip.clone().addScaledVector(V3(0, 0, 1), s * L.hipW);
    const knee = hj.clone().addScaledVector(dir(v(p, th), v(p, ab), s), L.thigh);
    const ank = knee.clone().addScaledVector(dir(v(p, th) - v(p, kn), v(p, ab), s), L.shin);
    const f = v(p, ft) * D;
    const toe = ank.clone().add(V3(L.foot * Math.cos(f), -L.foot * Math.sin(f) - .05, 0));
    const heel = ank.clone().add(V3(-.06 * Math.cos(f), .06 * Math.sin(f) - .05, 0));
    const sh = neck.clone().addScaledVector(lat, s * L.shW).addScaledVector(up, -.03);
    const elb = sh.clone().addScaledVector(dir(v(p, ua), v(p, aa), s), L.ua);
    const hand = elb.clone().addScaledVector(dir(v(p, ua) + v(p, el), v(p, aa), s), L.fa);
    Object.assign(J, { ['hip' + side]: hj, ['knee' + side]: knee, ['ank' + side]: ank, ['toe' + side]: toe, ['heel' + side]: heel, ['sh' + side]: sh, ['el' + side]: elb, ['hand' + side]: hand });
  }
  const roll = v(p, 'roll') * D;
  if (roll) { const c = Math.cos(roll), s = Math.sin(roll); for (const k in J) { const q = J[k]; const y = q.y * c - q.z * s, z = q.y * s + q.z * c; q.y = y; q.z = z; } }
  let minY = Infinity;
  for (const k in J) { const r = k === 'head' ? L.head : (k.startsWith('toe') || k.startsWith('heel') ? .02 : .045); minY = Math.min(minY, J[k].y - r); }
  const dy = p.hy !== undefined ? (GROUND - p.hy) * S - J.hip.y : -minY + v(p, 'lift') * S;
  for (const k in J) J[k].y += dy;
  return J;
}

// ---------- scène ----------
const ACCENT = 0xff7a3d, IRON = 0x2b2f3a, PROP = 0x3a3d47;
function capsule(r, len, mat) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(r, Math.max(0.001, len - 2 * r), 6, 14), mat); m.castShadow = true; m.receiveShadow = true; return m; }
const UP = V3(0, 1, 0);
function place(mesh, a, b) { mesh.position.copy(a).add(b).multiplyScalar(.5); const d = b.clone().sub(a); mesh.quaternion.setFromUnitVectors(UP, d.normalize()); }

export function createFigure(scene) {
  const skin = new THREE.MeshStandardMaterial({ color: 0xece3d6, roughness: .48, metalness: .04 });
  const dark = new THREE.MeshStandardMaterial({ color: 0x2a2a30, roughness: .55, metalness: .1 });
  const g = new THREE.Group(); scene.add(g);
  const seg = (r, len, mat = skin) => { const m = capsule(r, len, mat); g.add(m); return m; };
  const F = {
    torso: seg(.11, L.torso + .1), pelvis: seg(.1, L.hipW * 2 + .08), shoulders: seg(.065, L.shW * 2 + .02),
    head: new THREE.Mesh(new THREE.SphereGeometry(L.head, 24, 18), skin),
    thighN: seg(.075, L.thigh + .06), shinN: seg(.058, L.shin + .04), thighF: seg(.075, L.thigh + .06), shinF: seg(.058, L.shin + .04),
    uaN: seg(.05, L.ua + .03), faN: seg(.044, L.fa + .02), uaF: seg(.05, L.ua + .03), faF: seg(.044, L.fa + .02),
    handN: new THREE.Mesh(new THREE.SphereGeometry(.045, 16, 12), skin), handF: new THREE.Mesh(new THREE.SphereGeometry(.045, 16, 12), skin),
    footN: new THREE.Mesh(new THREE.BoxGeometry(.27, .06, .09), dark), footF: new THREE.Mesh(new THREE.BoxGeometry(.27, .06, .09), dark),
  };
  for (const k of ['head', 'handN', 'handF', 'footN', 'footF']) { F[k].castShadow = true; F[k].receiveShadow = true; g.add(F[k]); }
  const FX = V3(1, 0, 0);
  function foot(mesh, heel, toe) { mesh.position.copy(heel).add(toe).multiplyScalar(.5).add(V3(0, .03, 0)); const d = toe.clone().sub(heel); mesh.quaternion.setFromUnitVectors(FX, d.normalize()); }
  return {
    group: g,
    apply(J) {
      place(F.torso, J.hip, J.neck); place(F.pelvis, J.hipF, J.hipN); place(F.shoulders, J.shF, J.shN); F.head.position.copy(J.head);
      place(F.thighN, J.hipN, J.kneeN); place(F.shinN, J.kneeN, J.ankN); place(F.thighF, J.hipF, J.kneeF); place(F.shinF, J.kneeF, J.ankF);
      place(F.uaN, J.shN, J.elN); place(F.faN, J.elN, J.handN); place(F.uaF, J.shF, J.elF); place(F.faF, J.elF, J.handF);
      F.handN.position.copy(J.handN); F.handF.position.copy(J.handF); foot(F.footN, J.heelN, J.toeN); foot(F.footF, J.heelF, J.toeF);
    },
  };
}

function propsGroup(scene) { const g = new THREE.Group(); scene.add(g); return g; }
const matProp = new THREE.MeshStandardMaterial({ color: PROP, roughness: .7, metalness: .05 });
const matIron = new THREE.MeshStandardMaterial({ color: IRON, roughness: .35, metalness: .7 });
const matAccent = new THREE.MeshStandardMaterial({ color: ACCENT, roughness: .4, metalness: .2, emissive: ACCENT, emissiveIntensity: .25 });
const to2 = (q) => ({ x: q.x / S + 100, y: GROUND - q.y / S });
function box(w, h, d, mat = matProp) { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.castShadow = true; m.receiveShadow = true; return m; }
function cyl(r, len, mat) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, len, 20), mat); m.castShadow = true; return m; }

function buildProps(g, props, hold, J, roll) {
  while (g.children.length) g.remove(g.children[0]);
  for (const pr of props || []) {
    const anc = pr.anchor ? J[pr.anchor] : null;
    const a2 = anc ? to2(anc) : { x: 0, y: 0 };
    const z = (anc ? anc.z : 0) + (pr.z || 0) * S;
    if (pr.type === 'rect') {
      const x0 = a2.x + (pr.x || 0), y0 = a2.y + (pr.y || 0), h = pr.h === 'ground' ? Math.max(0, GROUND - y0) : pr.h;
      if (h <= 0) continue;
      const m = box(pr.w * S, h * S, (pr.d || 50) * S); m.position.set((x0 + pr.w / 2 - 100) * S, (GROUND - y0 - h / 2) * S, z); g.add(m);
    } else if (pr.type === 'circle') {
      const m = cyl(pr.r * S, .3, matProp); m.rotation.x = Math.PI / 2; m.position.set((a2.x + (pr.x || 0) - 100) * S, (GROUND - a2.y - (pr.y || 0)) * S, z); g.add(m);
    } else if (pr.type === 'line' || pr.type === 'band') {
      const A = pr.from ? J[pr.from].clone() : V3(-1, 0, 0), B = pr.to ? J[pr.to].clone() : V3(-1, 0, 0);
      A.add(V3((pr.fx || 0) * S, -(pr.fy || 0) * S, 0)); B.add(V3((pr.tx || 0) * S, -(pr.ty || 0) * S, 0));
      if (!pr.from) A.set(((pr.fx || 0) - 100) * S, (GROUND - (pr.fy || 0)) * S, z); if (!pr.to) B.set(((pr.tx || 0) - 100) * S, (GROUND - (pr.ty || 0)) * S, z);
      const len = A.distanceTo(B); const m = cyl(pr.type === 'band' ? .012 : .03, len, pr.type === 'band' ? matAccent : matProp); place(m, A, B); g.add(m);
    }
  }
  const rollQ = new THREE.Quaternion().setFromAxisAngle(V3(1, 0, 0), (roll || 0) * D);
  const dumbbell = (at) => { const d = new THREE.Group(); const h = cyl(.016, .2, matIron); h.rotation.x = Math.PI / 2; d.add(h); for (const s of [-1, 1]) { const p = cyl(.05, .045, matIron); p.rotation.x = Math.PI / 2; p.position.z = s * .09; d.add(p); } d.position.copy(at); d.quaternion.copy(rollQ); g.add(d); };
  const barbell = (at, len = 1.7) => { const b = new THREE.Group(); const h = cyl(.014, len, matIron); h.rotation.x = Math.PI / 2; b.add(h); for (const s of [-1, 1]) for (const k of [0, 1]) { const p = cyl(.14 - k * .03, .03, k ? matAccent : matIron); p.rotation.x = Math.PI / 2; p.position.z = s * (len / 2 - .12 - k * .035); b.add(p); } b.position.copy(at); b.quaternion.copy(rollQ); g.add(b); };
  if (hold === 'db') { dumbbell(J.handN); dumbbell(J.handF); }
  else if (hold === 'db1') dumbbell(J.handN);
  else if (hold === 'bb-back') barbell(J.neck.clone().add(V3(-.04, .04, 0)));
  else if (hold === 'bb-hands') barbell(J.handN.clone().add(J.handF).multiplyScalar(.5));
  else if (hold === 'bb-hip') barbell(J.hip.clone().add(V3(0, .11, 0)), 1.5);
  else if (hold === 'kb') { const at = J.handN.clone().add(J.handF).multiplyScalar(.5); const b = new THREE.Mesh(new THREE.SphereGeometry(.075, 20, 14), matIron); b.position.copy(at).add(V3(.02, -.1, 0)); b.castShadow = true; g.add(b); const t = new THREE.Mesh(new THREE.TorusGeometry(.05, .012, 10, 20), matIron); t.position.copy(at).add(V3(.02, -.02, 0)); t.rotation.y = Math.PI / 2; g.add(t); }
}

function makeScene(alpha = true) {
  const scene = new THREE.Scene();
  scene.add(new THREE.HemisphereLight(0xffffff, 0x3a3540, .85));
  const sun = new THREE.DirectionalLight(0xfff2e6, 2.2); sun.position.set(2.4, 4.2, 2.8); sun.castShadow = true;
  sun.shadow.mapSize.set(1024, 1024); sun.shadow.camera.left = sun.shadow.camera.bottom = -2.2; sun.shadow.camera.right = sun.shadow.camera.top = 2.2; sun.shadow.camera.near = .5; sun.shadow.camera.far = 12; sun.shadow.radius = 4; sun.shadow.bias = -.0008;
  scene.add(sun);
  const fill = new THREE.DirectionalLight(0xff9a62, .5); fill.position.set(-3, 1.5, -2); scene.add(fill);
  const rim = new THREE.DirectionalLight(0x7fd7ff, .45); rim.position.set(-1, 2.5, 3.5); scene.add(rim);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(2.3, 48), new THREE.MeshStandardMaterial({ color: 0x16161b, roughness: 1, transparent: true, opacity: alpha ? .85 : 1 }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = -.002; disc.receiveShadow = true; scene.add(disc);
  const sh = new THREE.Mesh(new THREE.CircleGeometry(2.3, 48), new THREE.ShadowMaterial({ opacity: .45 })); sh.rotation.x = -Math.PI / 2; sh.receiveShadow = true; scene.add(sh);
  return scene;
}
function makeRenderer(canvas, w, h) {
  const r = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  r.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); r.setSize(w, h, false); r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.05; r.outputColorSpace = THREE.SRGBColorSpace;
  return r;
}
const VIEWS = { tq: { az: 38, el: 16 }, front: { az: 80, el: 14 }, side: { az: 4, el: 12 }, back: { az: 140, el: 16 } };
function frame(J) { let min = V3(Infinity, Infinity, Infinity), max = V3(-Infinity, -Infinity, -Infinity); for (const k in J) { min.min(J[k]); max.max(J[k]); } min.y = 0; return { c: min.clone().add(max).multiplyScalar(.5), ext: Math.max(max.x - min.x, max.y - min.y, max.z - min.z) }; }

export function mount(el, anim, opts = {}) {
  const canvas = document.createElement('canvas'); canvas.className = 'c3d'; el.querySelectorAll('canvas.c3d').forEach(c => c.remove()); el.prepend(canvas);
  const scene = makeScene(true), fig = createFigure(scene), pg = propsGroup(scene);
  const cam = new THREE.PerspectiveCamera(30, 1, .1, 40);
  let w = el.clientWidth || 300, h = el.clientHeight || 300; const r = makeRenderer(canvas, w, h); cam.aspect = w / h; cam.updateProjectionMatrix();
  const ro = new ResizeObserver(() => { w = el.clientWidth; h = el.clientHeight; if (w && h) { r.setSize(w, h, false); cam.aspect = w / h; cam.updateProjectionMatrix(); } }); ro.observe(el);
  const view = VIEWS[anim.view || 'tq']; let az = view.az, elv = view.el, dAz = 0, dEl = 0, dragging = false, lastX = 0, lastY = 0, idle = 0;
  const target = V3(0, .9, 0); let dist = 3.2;
  canvas.addEventListener('pointerdown', e => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); idle = 0; });
  canvas.addEventListener('pointermove', e => { if (!dragging) return; dAz += (e.clientX - lastX) * .5; dEl = Math.max(-25, Math.min(40, dEl - (e.clientY - lastY) * .3)); lastX = e.clientX; lastY = e.clientY; });
  canvas.addEventListener('pointerup', () => { dragging = false; }); canvas.addEventListener('pointercancel', () => { dragging = false; });
  let raf, running = true; const t0 = performance.now();
  function tick(now) {
    if (!running) return;
    const t = (now - t0) / 1000;
    const pose = RIG.interpolate(anim.frames, t); const J = joints(pose); fig.apply(J); buildProps(pg, anim.props, anim.hold, J, pose.roll);
    const fr = frame(J); target.lerp(V3(fr.c.x, Math.max(.45, fr.c.y), fr.c.z), .06); dist += ((opts.dist || 1) * Math.max(2.6, fr.ext * 2.1 + 1.1) - dist) * .06;
    if (!dragging) idle += 1 / 60; const sway = dragging ? 0 : Math.sin(t * .35) * 7;
    const A = (az + dAz + sway) * D, E = (elv + dEl) * D;
    cam.position.set(target.x + dist * Math.cos(E) * Math.sin(A), target.y + dist * Math.sin(E), target.z + dist * Math.cos(E) * Math.cos(A)); cam.lookAt(target);
    r.render(scene, cam); raf = requestAnimationFrame(tick);
  }
  raf = requestAnimationFrame(tick);
  return () => { running = false; cancelAnimationFrame(raf); ro.disconnect(); r.dispose(); r.forceContextLoss(); };
}

// Vignettes : rendu unique hors écran, mis en cache.
let thumbCtx = null; const thumbCache = new Map();
export function thumb(anim, key) {
  if (thumbCache.has(key)) return thumbCache.get(key);
  if (!thumbCtx) { const canvas = document.createElement('canvas'); const r = makeRenderer(canvas, 220, 220); r.setPixelRatio(1.5); const scene = makeScene(true); thumbCtx = { r, scene, fig: createFigure(scene), pg: propsGroup(scene), cam: new THREE.PerspectiveCamera(30, 1, .1, 40), canvas }; }
  const { r, scene, fig, pg, cam, canvas } = thumbCtx;
  const f = anim.frames; const t = f.length > 1 ? f[0].d + f[1].d * .999 : f[0].d * .999;
  const pose = RIG.interpolate(f, t); const J = joints(pose); fig.apply(J); buildProps(pg, anim.props, anim.hold, J, pose.roll);
  const fr = frame(J); const view = VIEWS[anim.view || 'tq']; const dist = Math.max(2.6, fr.ext * 2.1 + 1.1), A = view.az * D, E = view.el * D;
  const target = V3(fr.c.x, Math.max(.45, fr.c.y), fr.c.z);
  cam.position.set(target.x + dist * Math.cos(E) * Math.sin(A), target.y + dist * Math.sin(E), target.z + dist * Math.cos(E) * Math.cos(A)); cam.lookAt(target);
  r.render(scene, cam); const url = canvas.toDataURL('image/png'); thumbCache.set(key, url); return url;
}
window.RIG3D = { mount, thumb, joints };

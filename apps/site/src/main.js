// Rivers website. One WebGL scene sits behind the page and changes with each section:
//   hero       three rivers of light (green, white, green, as in the Rivers mark) meet in one core
//   RVRB       the rivers are forged into a metal RVRB coin that turns as you scroll
//   wallet     a storm of particles behind giant moving words
//   network    a globe with Nigeria lit and payment arcs leaving it
// GSAP ScrollTrigger drives every pinned and scrubbed moment; Lenis smooths the scroll.
import * as THREE from 'three';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { wireLinks } from './links.js';

gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const small = innerWidth < 820;
const fine = matchMedia('(pointer: fine)').matches;
const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* ================================================================== smooth scroll */
let lenis = null;
if (!reduce) {
  lenis = new Lenis({ duration: 1.15, smoothWheel: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((t) => lenis.raf(t * 1000));
  gsap.ticker.lagSmoothing(0);
  lenis.stop();
}

/* ================================================================== renderer */
const canvas = $('#scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: !small, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, small ? 1.5 : 2));
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
const scene = new THREE.Scene();
// A Color made from a CSS string is converted to linear space, so the page and the canvas match.
scene.background = new THREE.Color('#020d08');
scene.fog = new THREE.FogExp2(new THREE.Color('#020d08'), 0.035);
const camera = new THREE.PerspectiveCamera(small ? 55 : 40, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 0, 16);
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

const composer = new EffectComposer(renderer);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(innerWidth, innerHeight), small ? 0.65 : 0.85, 0.5, 0.55);
composer.addPass(bloom);
composer.addPass(new OutputPass());

const GREEN = new THREE.Color('#1FE58C'), DEEP = new THREE.Color('#008751'), WHITE = new THREE.Color('#ffffff');
const U = { time: { value: 0 } };

/* ================================================================== rivers */
// Three streams start far apart behind the left of the screen, meet at the core, and leave as one.
const streams = [
  { y: 5.2, z: -9, color: GREEN }, { y: 0.4, z: -12, color: WHITE }, { y: -5.2, z: -8, color: GREEN },
].map((s, i) => new THREE.CatmullRomCurve3([
  new THREE.Vector3(-20, s.y * 1.25, s.z - 4), new THREE.Vector3(-11, s.y, s.z), new THREE.Vector3(-5, s.y * 0.42, s.z * 0.35),
  new THREE.Vector3(-1.6, s.y * 0.08, -0.4), new THREE.Vector3(0, 0, 0), new THREE.Vector3(4.5, -0.35, 1.2),
  new THREE.Vector3(12, -1.1, -1.5), new THREE.Vector3(22, -2.2, -6),
], false, 'catmullrom', 0.4));
const riverGroup = new THREE.Group();
scene.add(riverGroup);

const tubeVS = `
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){ vUv = uv; vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }`;
const tubeFS = `
  uniform float time; uniform vec3 color; uniform float alpha; uniform float power; uniform float speed; uniform float gain; uniform float seed;
  varying vec2 vUv; varying vec3 vN; varying vec3 vV;
  void main(){
    float t = vUv.x;
    float face = pow(abs(dot(normalize(vN), normalize(vV))), power);
    // Pulses of light travel along the river; more of them after the streams have met.
    float pulse = pow(fract(t * 7.0 - time * speed + seed), 14.0) * 2.6 + pow(fract(t * 3.0 - time * speed * 0.6 + seed * 2.0), 30.0) * 3.5;
    float ends = smoothstep(0.0, 0.12, t) * (1.0 - smoothstep(0.86, 1.0, t));
    float joined = smoothstep(0.45, 0.6, t);
    vec3 c = mix(color, vec3(1.0), joined * 0.35);
    gl_FragColor = vec4(c * (0.45 + pulse) * gain, face * ends * alpha);
  }`;
const riverMats = [];
streams.forEach((curve, i) => {
  const color = [GREEN, WHITE, GREEN][i];
  for (const [r, power, gain, op] of [[0.04, 0.5, 1.5, 1], [0.26, 4.0, 0.45, 0.16]]) {
    const m = new THREE.ShaderMaterial({
      uniforms: { time: U.time, color: { value: color }, alpha: { value: op }, power: { value: power }, speed: { value: 0.32 }, gain: { value: gain }, seed: { value: i * 0.31 } },
      vertexShader: tubeVS, fragmentShader: tubeFS, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    m.userData.base = op;
    riverMats.push(m);
    riverGroup.add(new THREE.Mesh(new THREE.TubeGeometry(curve, 420, r, 14, false), m));
  }
});

// Spray: particles that flow along each river and spread apart where the water is wide.
const LUT = streams.map((c) => c.getSpacedPoints(1200));
const SPRAY = small ? 1800 : 4200;
const sprayPos = new Float32Array(SPRAY * 3), sprayCol = new Float32Array(SPRAY * 3), sprayData = [];
for (let i = 0; i < SPRAY; i++) {
  const s = i % 3, c = [GREEN, WHITE, GREEN][s];
  sprayData.push({ s, t: Math.random(), v: 0.03 + Math.random() * 0.05, a: Math.random() * Math.PI * 2, r: Math.random() });
  sprayCol.set([c.r, c.g, c.b], i * 3);
}
const sprayGeo = new THREE.BufferGeometry();
sprayGeo.setAttribute('position', new THREE.BufferAttribute(sprayPos, 3));
sprayGeo.setAttribute('color', new THREE.BufferAttribute(sprayCol, 3));
const dotTex = (() => {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, 'rgba(255,255,255,1)'); gr.addColorStop(0.25, 'rgba(255,255,255,.7)'); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
})();
const sprayMat = new THREE.PointsMaterial({ size: small ? 0.08 : 0.055, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0.9 });
riverGroup.add(new THREE.Points(sprayGeo, sprayMat));

// The core where the rivers meet.
const core = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xc8ffe6, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
core.scale.setScalar(1.6);
riverGroup.add(core);

function updateSpray(dt, speed) {
  for (let i = 0; i < SPRAY; i++) {
    const d = sprayData[i];
    d.t += d.v * dt * speed;
    if (d.t > 1) d.t -= 1;
    const p = LUT[d.s][Math.floor(d.t * 1199)];
    // Wide and loose before the meeting point, tight after it.
    const spread = (d.t < 0.5 ? 0.15 + (0.5 - d.t) * 1.6 : 0.08 + (d.t - 0.5) * 0.5) * d.r;
    sprayPos[i * 3] = p.x + Math.cos(d.a + d.t * 9) * spread * 0.3;
    sprayPos[i * 3 + 1] = p.y + Math.sin(d.a + d.t * 11) * spread;
    sprayPos[i * 3 + 2] = p.z + Math.cos(d.a * 1.7 + d.t * 7) * spread;
  }
  sprayGeo.attributes.position.needsUpdate = true;
}

/* ================================================================== coin */
const MARK_TURN = Math.PI / 2;
function coinFace() {
  const S = 1024, c = document.createElement('canvas'); c.width = c.height = S;
  const g = c.getContext('2d');
  const bg = g.createRadialGradient(S * 0.4, S * 0.35, 40, S / 2, S / 2, S / 2);
  bg.addColorStop(0, '#1b8f5f'); bg.addColorStop(0.6, '#0a4a30'); bg.addColorStop(1, '#063322');
  g.fillStyle = bg; g.fillRect(0, 0, S, S);
  g.strokeStyle = 'rgba(190,255,225,.55)'; g.lineWidth = 6;
  g.beginPath(); g.arc(S / 2, S / 2, S * 0.46, 0, Math.PI * 2); g.stroke();
  g.lineWidth = 2; g.beginPath(); g.arc(S / 2, S / 2, S * 0.4, 0, Math.PI * 2); g.stroke();
  // Lettering around the rim.
  g.fillStyle = 'rgba(210,255,235,.8)'; g.font = '600 34px Unbounded, sans-serif'; g.textAlign = 'center';
  const text = 'RIVERS BLOCKCHAIN  ·  RVRB  ·  BUILT IN NIGERIA  ·  ';
  for (let i = 0; i < text.length; i++) {
    const a = (i / text.length) * Math.PI * 2 - Math.PI / 2;
    g.save(); g.translate(S / 2 + Math.cos(a) * S * 0.43, S / 2 + Math.sin(a) * S * 0.43); g.rotate(a + Math.PI / 2); g.fillText(text[i], 0, 12); g.restore();
  }
  // The Rivers mark, from the 40-unit logo drawing, turned to read upright on the coin face.
  g.save(); g.translate(S / 2, S / 2); g.rotate(MARK_TURN); g.translate(-20 * 15, -20 * 15); g.scale(15, 15); g.lineCap = 'round'; g.lineWidth = 2.8;
  const gr = g.createLinearGradient(7, 0, 33, 0); gr.addColorStop(0, '#7dffc4'); gr.addColorStop(1, '#ffffff');
  g.strokeStyle = gr; g.stroke(new Path2D('M7 11c10 0 11 9 21 9h5')); g.stroke(new Path2D('M7 29c10 0 11-9 21-9'));
  g.strokeStyle = '#ffffff'; g.stroke(new Path2D('M7 20h26'));
  g.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  // Emissive map: only the mark and the lettering glow.
  const e = document.createElement('canvas'); e.width = e.height = S; const h = e.getContext('2d');
  h.fillStyle = '#000'; h.fillRect(0, 0, S, S);
  h.save(); h.translate(S / 2, S / 2); h.rotate(MARK_TURN); h.translate(-20 * 15, -20 * 15); h.scale(15, 15); h.lineCap = 'round'; h.lineWidth = 2.8; h.strokeStyle = '#9dffd0';
  h.stroke(new Path2D('M7 11c10 0 11 9 21 9h5')); h.stroke(new Path2D('M7 29c10 0 11-9 21-9')); h.strokeStyle = '#fff'; h.stroke(new Path2D('M7 20h26')); h.restore();
  const et = new THREE.CanvasTexture(e); et.colorSpace = THREE.SRGBColorSpace;
  return [t, et];
}
const [faceMap, faceGlow] = coinFace();
const coinOuter = new THREE.Group(), coin = new THREE.Group();
coinOuter.add(coin); scene.add(coinOuter);
const edgeMat = new THREE.MeshPhysicalMaterial({ color: 0x14915c, metalness: 1, roughness: 0.22, clearcoat: 1, clearcoatRoughness: 0.08, transparent: true });
const faceMat = new THREE.MeshPhysicalMaterial({ map: faceMap, emissiveMap: faceGlow, emissive: 0xffffff, emissiveIntensity: 0.85, metalness: 0.75, roughness: 0.3, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true });
const disc = new THREE.Mesh(new THREE.CylinderGeometry(2.3, 2.3, 0.3, 160, 1), [edgeMat, faceMat, faceMat]);
disc.rotation.x = Math.PI / 2;
coin.add(disc);
// Ridged rim, like a minted coin.
const rim = new THREE.Mesh(new THREE.TorusGeometry(2.3, 0.07, 16, 220), new THREE.MeshPhysicalMaterial({ color: 0x3dffa8, emissive: 0x1fe58c, emissiveIntensity: 0.35, metalness: 1, roughness: 0.2, transparent: true }));
coin.add(rim);
const coinLight = new THREE.PointLight(0x7dffc4, 22, 20); coinLight.position.set(3, 3, 6); scene.add(coinLight);
coinOuter.scale.setScalar(0.001);

/* ================================================================== particle storm */
const DUST = small ? 3000 : 7000;
const dustGeo = new THREE.BufferGeometry();
const dp = new Float32Array(DUST * 3), dc = new Float32Array(DUST * 3);
for (let i = 0; i < DUST; i++) {
  const r = 4 + Math.pow(Math.random(), 0.6) * 14, th = Math.random() * Math.PI * 2, y = (Math.random() - 0.5) * 9;
  dp.set([Math.cos(th) * r, y * (0.4 + r / 18), Math.sin(th) * r - 6], i * 3);
  const c = Math.random() < 0.18 ? WHITE : Math.random() < 0.5 ? GREEN : DEEP;
  dc.set([c.r, c.g, c.b], i * 3);
}
dustGeo.setAttribute('position', new THREE.BufferAttribute(dp, 3));
dustGeo.setAttribute('color', new THREE.BufferAttribute(dc, 3));
const dustMat = new THREE.PointsMaterial({ size: 0.06, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, opacity: 0 });
const dust = new THREE.Points(dustGeo, dustMat);
scene.add(dust);

/* ================================================================== globe */
const globe = new THREE.Group();
scene.add(globe);
const R = 2.7;
const ll = (lat, lon, r = R) => { const a = lat * Math.PI / 180, b = lon * Math.PI / 180; return new THREE.Vector3(r * Math.cos(a) * Math.sin(b), r * Math.sin(a), r * Math.cos(a) * Math.cos(b)); };
{
  const N = small ? 5000 : 12000, gp = new Float32Array(N * 3), gc = new Float32Array(N * 3), gold = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) {
    const y = 1 - (i / (N - 1)) * 2, rr = Math.sqrt(1 - y * y), th = gold * i;
    gp.set([Math.cos(th) * rr * R, y * R, Math.sin(th) * rr * R], i * 3);
    const v = 0.35 + Math.random() * 0.45; gc.set([DEEP.r * v * 2, DEEP.g * v * 2, DEEP.b * v * 2], i * 3);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute('position', new THREE.BufferAttribute(gp, 3)); g.setAttribute('color', new THREE.BufferAttribute(gc, 3));
  globe.add(new THREE.Points(g, new THREE.PointsMaterial({ size: 0.035, map: dotTex, vertexColors: true, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending })));
  // Nigeria glows.
  const ng = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0x9dffd0, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
  ng.position.copy(ll(9.08, 8.68, R * 1.01)); ng.scale.setScalar(0.55); globe.add(ng);
  // Atmosphere.
  const atm = new THREE.Mesh(new THREE.SphereGeometry(R * 1.12, 64, 64), new THREE.ShaderMaterial({
    uniforms: {}, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.BackSide,
    vertexShader: 'varying vec3 vN; varying vec3 vV; void main(){ vec4 mv = modelViewMatrix*vec4(position,1.); vN = normalize(normalMatrix*normal); vV = normalize(-mv.xyz); gl_Position = projectionMatrix*mv; }',
    fragmentShader: 'varying vec3 vN; varying vec3 vV; void main(){ float f = pow(1.0 - abs(dot(vN, vV)), 2.5); gl_FragColor = vec4(vec3(0.12,0.9,0.55)*f*1.4, f); }',
  }));
  globe.add(atm);
  // Payment arcs from Nigeria to cities around the world.
  const cities = [[51.5, -0.1], [40.7, -74], [25.2, 55.3], [-1.3, 36.8], [-26.2, 28], [5.6, -0.2], [-23.5, -46.6], [1.35, 103.8], [39.9, 116.4], [50.1, 8.7], [43.7, -79.4], [30.0, 31.2], [14.7, -17.4], [48.9, 2.35]];
  const from = ll(9.08, 8.68);
  cities.forEach(([la, lo], i) => {
    const to = ll(la, lo), mid = from.clone().add(to).multiplyScalar(0.5);
    mid.normalize().multiplyScalar(R * (1.25 + from.distanceTo(to) / 12));
    const m = new THREE.ShaderMaterial({
      uniforms: { time: U.time, off: { value: i * 0.17 } }, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
      vertexShader: 'varying float t; void main(){ t = uv.x; gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.); }',
      fragmentShader: 'uniform float time; uniform float off; varying float t; void main(){ float p = fract(time*0.28 + off); float head = smoothstep(p-0.25, p, t) * step(t, p); gl_FragColor = vec4(vec3(0.4,1.0,0.75)*(0.3+head*1.2), 0.16 + head*0.6); }',
    });
    globe.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(from, mid, to), 80, 0.012, 6, false), m));
    const dot = new THREE.Sprite(new THREE.SpriteMaterial({ map: dotTex, color: 0xffffff, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending }));
    dot.position.copy(ll(la, lo, R * 1.01)); dot.scale.setScalar(0.11); globe.add(dot);
  });
}
globe.rotation.set(0.25, -1.25, 0);
globe.scale.setScalar(0.001);
const globeMats = [];
globe.traverse((o) => { if (o.material) { o.material.transparent = true; globeMats.push([o.material, o.material.opacity ?? 1]); } });

/* ================================================================== light and dark */
// On a light page, glowing additive light would vanish, so the scene switches to normal blending,
// darker greens and no bloom.
const INK = new THREE.Color('#0B2117'), DEEP_L = new THREE.Color('#007A49');
const additive = [];
scene.traverse((o) => { const ms = Array.isArray(o.material) ? o.material : o.material ? [o.material] : []; ms.forEach((m) => { if (m.blending === THREE.AdditiveBlending) additive.push(m); }); });
function applyTheme(t) {
  const light = t === 'light';
  scene.background = new THREE.Color(light ? '#F3FAF6' : '#020d08');
  scene.fog.color = scene.background.clone();
  bloom.enabled = !light;
  additive.forEach((m) => { m.blending = light ? THREE.NormalBlending : THREE.AdditiveBlending; m.needsUpdate = true; });
  riverMats.forEach((m) => { const c = m.uniforms.color.value; if (c === WHITE || c === INK) m.uniforms.color.value = light ? INK : WHITE; else m.uniforms.color.value = light ? DEEP_L : GREEN; });
  sprayMat.color.set(light ? '#0a6b42' : '#ffffff');
  dustMat.color.set(light ? '#0a6b42' : '#ffffff');
  core.material.color.set(light ? '#00915A' : '#c8ffe6');
  // Tone mapping would grey the light background, so the light theme renders colors as they are.
  renderer.toneMapping = light ? THREE.NoToneMapping : THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = light ? 1 : 1.05;
  additive.forEach((m) => { m.needsUpdate = true; });
}
applyTheme(document.documentElement.getAttribute('data-theme'));
addEventListener('rvtheme', (e) => applyTheme(e.detail));

/* ================================================================== scene state */
// Each section sets weights; the frame loop eases toward them.
const W = { rivers: 0, coin: 0, dust: 0, globe: 0, cx: 0, cy: 0, cz: 16, gx: small ? 0 : 3.6, gy: small ? 3.3 : 0, speed: 1 };
const T = { rivers: 1, coin: 0, dust: 0.15, globe: 0, cx: 0, cy: 0, cz: 10, gx: W.gx, gy: W.gy, speed: 1 };
const SCENES = {
  hero: { rivers: 1, coin: 0, dust: 0.15, globe: 0, cz: 10, cx: 0 },
  rvrb: { rivers: 0.2, coin: 1, dust: 0.3, globe: 0, cz: 12.5, cx: 0 },
  wallet: { rivers: 0, coin: 0, dust: 1, globe: 0, cz: 11, cx: 0 },
  scan: { rivers: 0.55, coin: 0, dust: 0.45, globe: 0, cz: 13, cx: 2 },
  private: { rivers: 0, coin: 0, dust: 0.7, globe: 0, cz: 15, cx: 0 },
  network: { rivers: 0, coin: 0, dust: 0.25, globe: small ? 0.6 : 1, cz: 9.5, cx: 0 },
  connect: { rivers: 0, coin: 0, dust: 0.35, globe: 0, cz: 12, cx: 0 },
  products: { rivers: 0.35, coin: 0, dust: 0.3, globe: 0, cz: 14, cx: 0 },
  supply: { rivers: 0.15, coin: 0, dust: 0.25, globe: 0, cz: 14, cx: 0 },
  start: { rivers: 0.6, coin: 0, dust: 0.25, globe: 0, cz: 12, cx: 0 },
};
function size() {
  renderer.setSize(innerWidth, innerHeight, false);
  composer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
}
size();
addEventListener('resize', size);
const mouse = new THREE.Vector2(), smooth = new THREE.Vector2();
addEventListener('pointermove', (e) => { mouse.set(e.clientX / innerWidth * 2 - 1, -(e.clientY / innerHeight * 2 - 1)); });

const clock = new THREE.Clock();
const coinSpin = { v: 0 };
let heroP = 0;
function frame() {
  const dt = Math.min(clock.getDelta(), 0.05);
  const k = 1 - Math.pow(0.0015, dt);
  for (const key of Object.keys(T)) W[key] += (T[key] - W[key]) * k;
  U.time.value += reduce ? 0 : dt * W.speed;
  smooth.lerp(mouse, 0.04);

  // Rivers.
  riverGroup.visible = W.rivers > 0.01;
  if (riverGroup.visible) {
    riverMats.forEach((m) => { m.uniforms.alpha.value = m.userData.base * W.rivers; m.uniforms.speed.value = 0.32 + heroP * 0.9; });
    sprayMat.opacity = 0.7 * W.rivers;
    core.material.opacity = W.rivers * (0.45 + Math.sin(U.time.value * 2) * 0.1);
    core.scale.setScalar(1.4 + heroP * 2.2);
    if (!reduce) updateSpray(dt, 1 + heroP * 2);
  }
  // Coin.
  coinOuter.visible = W.coin > 0.01;
  if (coinOuter.visible) {
    coinOuter.scale.setScalar(Math.max(0.001, W.coin * (small ? 0.85 : 1)));
    coin.rotation.y = coinSpin.v + (reduce ? 0 : U.time.value * 0.15);
    coin.rotation.x = smooth.y * 0.25;
    coinOuter.rotation.z = Math.sin(U.time.value * 0.5) * 0.04;
    edgeMat.opacity = faceMat.opacity = rim.material.opacity = Math.min(1, W.coin * 1.5);
  }
  // Storm.
  dust.visible = W.dust > 0.01;
  dustMat.opacity = W.dust * 0.85;
  dust.rotation.y += dt * (0.03 + W.dust * 0.06);
  // Globe.
  globe.visible = W.globe > 0.01;
  if (globe.visible) {
    globe.scale.setScalar(Math.max(0.001, W.globe * (small ? 1.1 : 0.88)));
    globe.position.set(W.gx, W.gy, 0);
    globe.rotation.y += dt * 0.08;
    globeMats.forEach(([m, o]) => { m.opacity = o * Math.min(1, W.globe * 1.4); });
  }
  camera.position.set(W.cx + smooth.x * 0.6, W.cy + smooth.y * 0.4, W.cz);
  camera.lookAt(W.cx * 0.6, 0, 0);
  composer.render();
  requestAnimationFrame(frame);
}
frame();

/* ================================================================== intro */
function intro() {
  const done = () => { document.body.classList.remove('is-loading'); document.body.classList.add('is-ready'); lenis && lenis.start(); };
  if (reduce) { $('#intro').remove(); done(); return; }
  const tl = gsap.timeline({ defaults: { ease: 'expo.out' } });
  tl.to('.intro-mark path', { strokeDashoffset: 0, duration: 1.2, stagger: 0.12, ease: 'power3.inOut' })
    .to('.intro-word span', { opacity: 1, y: 0, duration: 0.9, stagger: 0.05 }, '-=0.6')
    .to('.intro-mark', { scale: 14, opacity: 0, duration: 1.3, ease: 'expo.in' }, '+=0.25')
    .to('.intro-word', { opacity: 0, y: -20, duration: 0.5, ease: 'power2.in' }, '<')
    .to('#intro', { opacity: 0, duration: 0.6, onComplete: () => { $('#intro').remove(); done(); } }, '-=0.35')
    .add(() => { W.cz = 22; T.cz = 10; }, '-=1.1')
    .from('.hero-title .line > span', { yPercent: 115, rotate: 4, duration: 1.4, stagger: 0.1 }, '-=0.7')
    .from('.kicker, .hero-sub, .hero-cta, .scroll-hint', { opacity: 0, y: 30, duration: 1.2, stagger: 0.08 }, '-=1.1');
}
intro();

/* ================================================================== header */
{
  const top = $('#top');
  let last = 0;
  ScrollTrigger.create({ start: 0, end: 'max', onUpdate: (s) => {
    const y = s.scroll();
    top.classList.toggle('solid', y > 40);
    top.classList.toggle('hide', y > 300 && y > last && !document.body.classList.contains('menu'));
    last = y;
  } });
  $('#menuBtn')?.addEventListener('click', () => document.body.classList.toggle('menu'));
  $$('.nav a').forEach((a) => a.addEventListener('click', () => document.body.classList.remove('menu')));
  $$('a[href^="#"]').forEach((a) => a.addEventListener('click', (e) => {
    const t = document.querySelector(a.getAttribute('href'));
    if (t && lenis) { e.preventDefault(); lenis.scrollTo(t, { duration: 1.6 }); }
  }));
}

/* ================================================================== scroll story */
if (!reduce) {
  // Hero: pinned while the camera dives into the core and three short lines appear in turn.
  const hero = gsap.timeline({ scrollTrigger: { trigger: '#hero', start: 'top top', end: '+=180%', pin: true, scrub: 1, onUpdate: (s) => { heroP = s.progress; } } });
  hero.to('.hero-stage', { yPercent: -18, opacity: 0, filter: 'blur(10px)', duration: 0.3, ease: 'power2.in' }, 0)
    .to('.scroll-hint', { opacity: 0, duration: 0.1 }, 0)
    .add(() => {}, 1);
  $$('.hero-second p').forEach((p, i) => {
    hero.fromTo(p, { opacity: 0, scale: 0.9, filter: 'blur(14px)' }, { opacity: 1, scale: 1, filter: 'blur(0px)', duration: 0.12 }, 0.28 + i * 0.22)
      .to(p, { opacity: 0, scale: 1.08, filter: 'blur(14px)', duration: 0.1 }, 0.42 + i * 0.22);
  });
  ScrollTrigger.create({ trigger: '#hero', start: 'top top', end: '+=180%', onUpdate: (s) => { SCENES.hero.cz = 10 - s.progress * 4.5; if (activeScene === 'hero') T.cz = SCENES.hero.cz; } });

  // RVRB: three statements swap while the coin turns.
  const sts = $$('.st'), dots = $$('.st-dots i');
  const showSt = (i) => {
    sts.forEach((s, j) => gsap.to(s, { opacity: i === j ? 1 : 0, y: i === j ? 0 : (j < i ? -40 : 40), filter: i === j ? 'blur(0px)' : 'blur(12px)', duration: 0.8, ease: 'expo.out', overwrite: true }));
    dots.forEach((d, j) => d.classList.toggle('on', i === j));
    const n = sts[i].querySelector('[data-count]');
    if (n) { const o = { v: 0 }, to = +n.dataset.count; gsap.to(o, { v: to, duration: 1.4, ease: 'expo.out', onUpdate: () => { n.textContent = Math.round(o.v).toLocaleString('en-NG'); } }); }
  };
  let cur = -1;
  ScrollTrigger.create({ trigger: '#rvrb', start: 'top top', end: '+=240%', pin: true, scrub: true,
    onUpdate: (s) => { coinSpin.v = s.progress * Math.PI * 4; const i = Math.min(2, Math.floor(s.progress * 3)); if (i !== cur) { cur = i; showSt(i); } },
    onLeaveBack: () => { cur = -1; sts.forEach((s) => gsap.to(s, { opacity: 0, duration: 0.3 })); } });

  // Wallet: giant words sweep in opposite directions.
  const kin = gsap.timeline({ scrollTrigger: { trigger: '#wallet', start: 'top top', end: '+=160%', pin: true, scrub: 1 } });
  kin.fromTo('.kin-row.r1', { xPercent: 4 }, { xPercent: -42, ease: 'none' }, 0)
    .fromTo('.kin-row.r2', { xPercent: -46 }, { xPercent: 0, ease: 'none' }, 0)
    .fromTo('.kin-row.r3', { xPercent: 0 }, { xPercent: -40, ease: 'none' }, 0)
    .fromTo('.kin-rows', { rotate: -4, scale: 1.15 }, { rotate: 3, scale: 0.95, ease: 'none' }, 0)
    .from('.kin-note, #wallet .btn', { opacity: 0, y: 40, duration: 0.2 }, 0.15);

  // Speed: the digits roll and settle.
  const n = $('#speedN');
  ScrollTrigger.create({ trigger: '#scan', start: 'top 60%', once: true, onEnter: () => {
    let k = 0; const id = setInterval(() => { n.textContent = (Math.random() * 9).toFixed(1); if (++k > 22) { clearInterval(id); n.textContent = '<1'; } }, 45);
  } });
  gsap.from('.speed-sec .huge', { scale: 0.6, opacity: 0, filter: 'blur(20px)', ease: 'expo.out', duration: 1.6, scrollTrigger: { trigger: '#scan', start: 'top 60%' } });

  // Privacy: the payment turns into a proof as you scroll through it.
  const sc = $('#scramble'), plain = sc.dataset.text, cipher = '0x7f3a91c0d2e84b19e6';
  const glyphs = '0123456789abcdef';
  ScrollTrigger.create({ trigger: '#private', start: 'top 70%', end: 'center 35%', scrub: true, onUpdate: (s) => {
    const len = Math.max(plain.length, cipher.length), cut = Math.floor(s.progress * (len + 3));
    let out = '';
    for (let i = 0; i < len; i++) {
      if (i < cut - 2) out += cipher[i] ? '<span class="c">' + cipher[i] + '</span>' : '';
      else if (i < cut) out += '<span class="c">' + glyphs[(Math.random() * 16) | 0] + '</span>';
      else out += plain[i] || '';
    }
    sc.innerHTML = out;
  } });

  // Reveal blocks of copy as they arrive.
  $$('.net-copy > *, .cn-copy > *, .supply-sec .lede, .supply-sec .big, .supply-sec .eyebrow-k, .products-sec .big, .speed-in > p, .speed-in > a, .pv-pills span').forEach((el) => {
    gsap.from(el, { y: 50, opacity: 0, duration: 1.3, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } });
  });
  gsap.from('.card', { y: 120, rotateX: 18, opacity: 0, duration: 1.4, ease: 'expo.out', stagger: 0.1, scrollTrigger: { trigger: '.cards', start: 'top 85%' } });
  gsap.from('.alloc i', { scaleX: 0, duration: 1.4, ease: 'expo.out', stagger: 0.06, scrollTrigger: { trigger: '.alloc', start: 'top 85%' } });
  const line = $('#supplyLine'), L = line.getTotalLength();
  line.style.strokeDasharray = L;
  gsap.fromTo(line, { strokeDashoffset: L }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '.supply', start: 'top 80%', end: 'bottom 50%', scrub: true } });
  gsap.from('#supplyFill', { opacity: 0, scrollTrigger: { trigger: '.supply', start: 'center 70%', end: 'bottom 50%', scrub: true } });
  gsap.from('.end-title span', { yPercent: 60, opacity: 0, filter: 'blur(16px)', stagger: 0.12, ease: 'expo.out', duration: 1.6, scrollTrigger: { trigger: '.end-title', start: 'top 85%' } });

  // Connect: payments travel between institutions through the ledger.
  const paths = $$('.cn-lines path'), layer = $('#cnPulses'), NS = 'http://www.w3.org/2000/svg';
  const pulses = paths.slice(0, 4).flatMap((p, i) => [0, 0.5].map((o) => { const c = document.createElementNS(NS, 'circle'); c.setAttribute('r', '4.5'); layer.appendChild(c); return { p, c, o: o + i * 0.13, L: p.getTotalLength(), dir: i % 2 }; }));
  let cnOn = false;
  ScrollTrigger.create({ trigger: '#connect', start: 'top bottom', end: 'bottom top', onToggle: (s) => { cnOn = s.isActive; } });
  gsap.ticker.add((t) => {
    if (!cnOn) return;
    pulses.forEach((q) => { let f = (t * 0.22 + q.o) % 1; if (q.dir) f = 1 - f; const pt = q.p.getPointAtLength(f * q.L); q.c.setAttribute('cx', pt.x); q.c.setAttribute('cy', pt.y); });
  });
  gsap.from('.cn-nodes g', { scale: 0, transformOrigin: 'center', opacity: 0, stagger: 0.08, duration: 1.2, ease: 'back.out(2)', scrollTrigger: { trigger: '.cn-map', start: 'top 80%' } });
}
ScrollTrigger.refresh();

// The active scene is the section that covers the middle of the screen. A pinned section is
// measured by its pin spacer, which spans the whole time it is pinned.
const sceneEls = Object.keys(SCENES).map((id) => [id, document.getElementById(id)]).filter((x) => x[1]);
let activeScene = '';
function pickScene() {
  const mid = innerHeight / 2;
  for (const [id, el] of sceneEls) {
    const box = el.parentElement && el.parentElement.classList.contains('pin-spacer') ? el.parentElement : el;
    const r = box.getBoundingClientRect();
    if (r.top <= mid && r.bottom > mid) { if (id !== activeScene) { activeScene = id; Object.assign(T, SCENES[id]); } return; }
  }
}
if (lenis) lenis.on('scroll', pickScene); else addEventListener('scroll', pickScene, { passive: true });
ScrollTrigger.addEventListener('refresh', pickScene);
pickScene();

/* ================================================================== product cards: tilt and glare */
if (fine && !reduce) {
  $$('[data-tilt]').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      card.style.transform = `perspective(1000px) rotateY(${(x - 0.5) * 14}deg) rotateX(${(0.5 - y) * 12}deg) translateZ(10px)`;
      card.style.setProperty('--gx', x * 100 + '%'); card.style.setProperty('--gy', y * 100 + '%');
    });
    card.addEventListener('pointerleave', () => { card.style.transform = ''; });
  });
}

/* ================================================================== links and live numbers */
wireLinks();
const IDX = window.RV_INDEXER;
if (IDX) {
  fetch(IDX + '/summary', { cache: 'no-store' }).then((r) => r.json()).then((s) => {
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('lvBlock', '#' + Number(s.checkpoint).toLocaleString('en-NG'));
    set('lvAcc', Number(s.accounts).toLocaleString('en-NG'));
    set('lvTx', Number(s.userTx24h ?? s.tx24h).toLocaleString('en-NG'));
    $('#live')?.classList.add('on');
  }).catch(() => {});
}

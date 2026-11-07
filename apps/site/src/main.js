// Rivers website: one particle field that becomes each section's subject as the reader scrolls —
// three rivers that merge, a chain of blocks, the RVRB coin, the globe with Nigeria lit, and the
// five products. GSAP ScrollTrigger drives the morphs, the pinned product rail and the reveals.
import * as THREE from 'three';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { wireLinks } from './links.js';

gsap.registerPlugin(ScrollTrigger);
const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
const mobile = innerWidth < 760;

/* ---------------------------------------------------------------- shapes */
const N = mobile ? 7000 : 14000;
const rnd = (a, b) => a + Math.random() * (b - a);
const gauss = () => (Math.random() + Math.random() + Math.random() - 1.5) / 1.5;

// Three rivers: green from above, white through the middle, green from below. They meet at the
// centre and flow on as one stream, the Rivers mark in three dimensions.
function riverAt(stream, t, spread) {
  const y0 = [1.7, 0, -1.7][stream];
  const z0 = [-0.6, 0.4, -0.6][stream];
  const merge = Math.min(1, Math.max(0, (t - 0.15) / 0.45));
  const ease = merge * merge * (3 - 2 * merge);
  const x = -5.4 + t * 10.8;
  const y = y0 * (1 - ease) + Math.sin(t * 7 + stream) * 0.18 * (1 - ease);
  const z = z0 * (1 - ease) + Math.cos(t * 5 + stream) * 0.25;
  const w = spread * (0.42 * (1 - ease) + 0.2);
  return [x, y + gauss() * w, z + gauss() * w];
}
function blocks(i) {
  // Seven blocks in a chain, points on the faces of each cube.
  const b = i % 7, s = 0.62;
  const cx = (b - 3) * 1.55, cy = Math.sin(b * 0.9) * 0.35;
  let p;
  if (Math.random() < 0.6) {
    // Most points trace the twelve edges, so each block reads as a cube.
    const e = Math.floor(rnd(0, 12)), t = rnd(-s, s), a = (e & 1) ? s : -s, b = (e & 2) ? s : -s, ax = Math.floor(e / 4);
    p = ax === 0 ? [t, a, b] : ax === 1 ? [a, t, b] : [a, b, t];
  } else {
    const f = Math.floor(rnd(0, 6)), u = rnd(-s, s), v = rnd(-s, s);
    p = [[s, u, v], [-s, u, v], [u, s, v], [u, -s, v], [u, v, s], [u, v, -s]][f];
  }
  if (i % 23 === 0) return [cx + 0.78 + rnd(0, 0.77), cy + rnd(-0.03, 0.03), rnd(-0.03, 0.03)];
  return [cx + p[0], cy + p[1], p[2]];
}
function coin(i) {
  // The RVRB coin: a thick ring with three flowing strokes across its face.
  const a = rnd(0, Math.PI * 2);
  if (i % 3 !== 0) { const r = 2.1 + gauss() * 0.08, h = rnd(-0.22, 0.22); return [Math.cos(a) * r, Math.sin(a) * r, h]; }
  const k = i % 9 === 0 ? 0 : i % 9 === 3 ? 1 : 2, t = rnd(-1.5, 1.5);
  const y = [0.6, 0, -0.6][k] * (1 - Math.abs(t) / 2) + (k === 1 ? 0 : Math.sin(t * 2) * 0.12);
  return [t, y + gauss() * 0.05, rnd(-0.08, 0.08)];
}
const NIGERIA = [9.08, 8.68];
function globe(i) {
  const r = 2.3;
  let lat, lon;
  if (i % 9 === 0) { lat = NIGERIA[0] + gauss() * 3.2; lon = NIGERIA[1] + gauss() * 3.6; }
  else { const u = Math.random(), v = Math.random(); lat = Math.asin(2 * u - 1) * 180 / Math.PI; lon = v * 360 - 180; }
  const la = lat * Math.PI / 180, lo = lon * Math.PI / 180;
  return [r * Math.cos(la) * Math.sin(lo), r * Math.sin(la), r * Math.cos(la) * Math.cos(lo)];
}
function constellation(i) {
  // Five spheres for the five products, joined by thin streams.
  const k = i % 5, ang = k / 5 * Math.PI * 2 - Math.PI / 2;
  const c = [Math.cos(ang) * 2.4, Math.sin(ang) * 1.6, Math.sin(ang * 2) * 0.6];
  if (i % 4 === 0) { const n = (k + 1) % 5, a2 = n / 5 * Math.PI * 2 - Math.PI / 2, t = Math.random(); const d = [Math.cos(a2) * 2.4, Math.sin(a2) * 1.6, Math.sin(a2 * 2) * 0.6]; return c.map((x, j) => x + (d[j] - x) * t + gauss() * 0.02); }
  const u = Math.random(), v = Math.random(), th = Math.acos(2 * u - 1), ph = v * Math.PI * 2, r = 0.55 * Math.cbrt(Math.random() * 0.4 + 0.6);
  return [c[0] + r * Math.sin(th) * Math.cos(ph), c[1] + r * Math.sin(th) * Math.sin(ph), c[2] + r * Math.cos(th)];
}

const SHAPES = 5;
const pos = Array.from({ length: SHAPES }, () => new Float32Array(N * 3));
const seed = new Float32Array(N), stream = new Float32Array(N), glow = new Float32Array(N);
for (let i = 0; i < N; i++) {
  const s = i % 3, t = Math.random(), sp = Math.random();
  seed[i] = t; stream[i] = s; glow[i] = Math.random();
  const shapes = [riverAt(s, t, sp), blocks(i), coin(i), globe(i), constellation(i)];
  shapes.forEach((p, k) => pos[k].set(p, i * 3));
}

/* ---------------------------------------------------------------- scene */
const canvas = document.getElementById('scene');
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(mobile ? 62 : 48, innerWidth / innerHeight, 0.1, 100);
camera.position.set(0, 0, 9);

const geo = new THREE.BufferGeometry();
geo.setAttribute('position', new THREE.BufferAttribute(pos[0], 3));
for (let k = 0; k < SHAPES; k++) geo.setAttribute('p' + k, new THREE.BufferAttribute(pos[k], 3));
geo.setAttribute('seed', new THREE.BufferAttribute(seed, 1));
geo.setAttribute('stream', new THREE.BufferAttribute(stream, 1));
geo.setAttribute('glow', new THREE.BufferAttribute(glow, 1));

const uniforms = {
  uTime: { value: 0 }, uMorph: { value: 0 }, uPx: { value: renderer.getPixelRatio() },
  uGreen: { value: new THREE.Color('#1FE58C') }, uDeep: { value: new THREE.Color('#008751') }, uWhite: { value: new THREE.Color('#FFFFFF') },
  uMouse: { value: new THREE.Vector2() }, uLight: { value: 0 },
};
const mat = new THREE.ShaderMaterial({
  uniforms, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `
    attribute vec3 p0; attribute vec3 p1; attribute vec3 p2; attribute vec3 p3; attribute vec3 p4;
    attribute float seed; attribute float stream; attribute float glow;
    uniform float uTime; uniform float uMorph; uniform float uPx; uniform vec2 uMouse;
    varying float vStream; varying float vGlow; varying float vFade;
    vec3 pick(float k){ if(k<0.5) return p0; if(k<1.5) return p1; if(k<2.5) return p2; if(k<3.5) return p3; return p4; }
    void main(){
      float a = floor(uMorph), f = smoothstep(0.0, 1.0, fract(uMorph));
      // Each particle leaves a little later than the one before, so shapes pour into each other.
      float d = clamp((f - seed * 0.35) / 0.65, 0.0, 1.0);
      vec3 A = pick(a), B = pick(min(a + 1.0, 4.0));
      // On the river, particles flow left to right and wrap around.
      if (a < 0.5) { A.x = mod(A.x + 5.4 + uTime * (0.35 + glow * 0.25), 10.8) - 5.4; }
      vec3 p = mix(A, B, d);
      p += vec3(sin(uTime * 0.7 + seed * 40.0), cos(uTime * 0.6 + seed * 31.0), sin(uTime * 0.5 + seed * 17.0)) * 0.03;
      p.xy += uMouse * 0.12 * (0.5 + glow);
      vec4 mv = modelViewMatrix * vec4(p, 1.0);
      gl_Position = projectionMatrix * mv;
      gl_PointSize = (1.4 + glow * 2.4) * uPx * (9.0 / -mv.z);
      vStream = stream; vGlow = glow;
      vFade = (a < 0.5) ? smoothstep(-5.4, -4.2, A.x) * (1.0 - smoothstep(4.6, 5.4, A.x)) : 1.0;
      vFade = mix(vFade, 1.0, d);
    }`,
  fragmentShader: `
    uniform vec3 uGreen; uniform vec3 uDeep; uniform vec3 uWhite; uniform float uLight;
    varying float vStream; varying float vGlow; varying float vFade;
    void main(){
      float r = length(gl_PointCoord - 0.5);
      if (r > 0.5) discard;
      float a = smoothstep(0.5, 0.0, r);
      vec3 c = vStream > 0.5 && vStream < 1.5 ? uWhite : mix(uDeep, uGreen, vGlow);
      gl_FragColor = vec4(c, a * (0.55 + vGlow * 0.45) * vFade * (1.0 - uLight * 0.35));
    }`,
});
const points = new THREE.Points(geo, mat);
scene.add(points);

function size() {
  renderer.setSize(innerWidth, innerHeight, false);
  camera.aspect = innerWidth / innerHeight;
  camera.position.z = innerWidth < 760 ? 11 : 9;
  camera.updateProjectionMatrix();
}
size();
addEventListener('resize', size);
const mouse = { x: 0, y: 0 };
addEventListener('pointermove', (e) => { mouse.x = e.clientX / innerWidth * 2 - 1; mouse.y = -(e.clientY / innerHeight * 2 - 1); });

const clock = new THREE.Clock();
const rot = { y: 0, x: 0 };
function frame() {
  const t = clock.getElapsedTime();
  uniforms.uTime.value = reduce ? 0 : t;
  uniforms.uMouse.value.lerp(new THREE.Vector2(mouse.x, mouse.y), 0.05);
  points.rotation.y = rot.y + (reduce ? 0 : Math.sin(t * 0.15) * 0.08);
  points.rotation.x = rot.x;
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
frame();

/* ---------------------------------------------------------------- scroll story */
// Each section with data-shape morphs the field to that shape while it crosses the middle of the
// screen, and tilts the camera so the transition reads as a turn in three dimensions.
document.querySelectorAll('[data-shape]').forEach((el) => {
  const k = +el.dataset.shape;
  ScrollTrigger.create({
    trigger: el, start: 'top 65%', end: 'bottom 35%',
    onEnter: () => go(k), onEnterBack: () => go(k),
  });
});
function go(k) {
  gsap.to(uniforms.uMorph, { value: k, duration: reduce ? 0 : 2.2, ease: 'power2.inOut', overwrite: true });
  gsap.to(rot, { y: [0, 0.6, -0.35, 0.4, 0][k], x: [0, 0.35, 0.2, -0.25, 0][k], duration: reduce ? 0 : 2.4, ease: 'power3.inOut', overwrite: true });
  // On wide screens the shape stands beside the copy: right of left-hand text, left of right-hand text.
  const side = innerWidth < 760 ? 0 : [0, 2.7, -2.9, 2.9, 0][k];
  gsap.to(points.position, { x: side, duration: reduce ? 0 : 2.4, ease: 'power3.inOut', overwrite: true });
}
gsap.to(camera.position, { z: () => camera.position.z + 2.5, ease: 'none', scrollTrigger: { trigger: '#hero', start: 'top top', end: 'bottom top', scrub: true } });

if (!reduce) {
  // Headline letters rise out of the river one after another.
  document.querySelectorAll('[data-split]').forEach((h) => {
    const words = h.textContent.trim().split(/\s+/);
    h.innerHTML = words.map((w) => '<span class="w"><span>' + w + '</span></span>').join(' ');
    gsap.from(h.querySelectorAll('.w > span'), { yPercent: 115, rotate: 6, duration: 1.1, ease: 'expo.out', stagger: 0.06,
      scrollTrigger: h.closest('#hero') ? undefined : { trigger: h, start: 'top 85%' }, delay: h.closest('#hero') ? 0.3 : 0 });
  });
  document.querySelectorAll('[data-rise]').forEach((el) => gsap.from(el, { y: 60, opacity: 0, duration: 1.2, ease: 'expo.out', scrollTrigger: { trigger: el, start: 'top 88%' } }));

  // Pinned rail: the products slide across while the page holds still.
  const rail = document.querySelector('.rail');
  if (rail && innerWidth > 760) {
    gsap.to(rail, {
      x: () => -(rail.scrollWidth - innerWidth + 64), ease: 'none',
      scrollTrigger: { trigger: '#products', start: 'top top', end: () => '+=' + (rail.scrollWidth - innerWidth + 64), pin: true, scrub: 1, invalidateOnRefresh: true },
    });
  }

  // Supply chart draws itself as it scrolls through.
  const path = document.querySelector('#supplyLine');
  if (path) { const L = path.getTotalLength(); path.style.strokeDasharray = L; gsap.fromTo(path, { strokeDashoffset: L }, { strokeDashoffset: 0, ease: 'none', scrollTrigger: { trigger: '#rvrb', start: 'top 70%', end: 'center 40%', scrub: true } }); }
}

// Numbers count up once when they come into view.
document.querySelectorAll('[data-count]').forEach((el) => {
  const to = +el.dataset.count, dec = +(el.dataset.dec || 0);
  const show = (v) => { el.textContent = v.toLocaleString('en-NG', { minimumFractionDigits: dec, maximumFractionDigits: dec }); };
  if (reduce) return show(to);
  const o = { v: 0 };
  ScrollTrigger.create({ trigger: el, start: 'top 90%', once: true, onEnter: () => gsap.to(o, { v: to, duration: 2, ease: 'power3.out', onUpdate: () => show(o.v) }) });
});

/* ---------------------------------------------------------------- links and live numbers */
wireLinks();
const IDX = window.RV_INDEXER;
if (IDX) {
  fetch(IDX + '/summary', { cache: 'no-store' }).then((r) => r.json()).then((s) => {
    const set = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    set('lvBlock', '#' + Number(s.checkpoint).toLocaleString('en-NG'));
    set('lvAcc', Number(s.accounts).toLocaleString('en-NG'));
    set('lvTx', Number(s.userTx24h ?? s.tx24h).toLocaleString('en-NG'));
    document.getElementById('live')?.classList.add('on');
  }).catch(() => {});
}


/* ==========================================================================
   AUTOPART — Efectos visuales
   silk background · coverflow carousel · globo (cobe)
   Adaptaciones vanilla de componentes tipo 21st.dev
   ========================================================================== */

import createGlobe from 'cobe';
import { formatCLP } from './data/database.js';

/* -------------------------------------------------------------------------
   SILK BACKGROUND — lienzo procedimental con textura de seda líquida oscura
   ------------------------------------------------------------------------- */
export function initSilk(canvas) {
  // Desactivado para garantizar 0% consumo de CPU y máxima fluidez en 60 FPS
  if (canvas) {
    canvas.style.display = 'none';
  }
}

/* -------------------------------------------------------------------------
   COVERFLOW CAROUSEL — fotografías de repuestos con perspectiva 3D
   ------------------------------------------------------------------------- */
export function initCoverflow(root, items, onSelect) {
  const track = root.querySelector('.cf-track');
  const label = root.querySelector('.cf-label');
  let index = Math.floor(items.length / 2);

  track.innerHTML = items.map((it, i) => `
    <figure class="cf-card" data-i="${i}">
      <img src="${it.image}" alt="${it.name}" draggable="false">
    </figure>`).join('');
  const cards = Array.from(track.querySelectorAll('.cf-card'));

  function render() {
    cards.forEach((c, i) => {
      const d = i - index;
      const abs = Math.abs(d);
      const x = d * 175;
      const rotate = d === 0 ? 0 : (d < 0 ? 32 : -32);
      const z = -abs * 110;
      const scale = d === 0 ? 1.05 : Math.max(0.65, 0.9 - abs * 0.08);
      const opacity = abs > 4 ? 0 : Math.max(0, 1 - abs * 0.18);
      c.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rotate}deg) scale(${scale})`;
      c.style.opacity = opacity;
      c.style.zIndex = 100 - abs;
      c.classList.toggle('active', d === 0);
      c.style.pointerEvents = abs > 4 ? 'none' : 'auto';
    });
    const cur = items[index];
    if (label) label.innerHTML = `<b>${cur.name}</b><span>${cur.brand} · OEM ${cur.oemCode} · ${formatCLP(cur.price)}</span>`;
    if (onSelect) onSelect(cur);
  }

  const go = (n) => { index = (n + items.length) % items.length; render(); };
  cards.forEach((c, i) => c.addEventListener('click', () => {
    if (i === index && onSelect) onSelect(items[index], true);
    else go(i);
  }));
  root.querySelector('.cf-prev')?.addEventListener('click', () => go(index - 1));
  root.querySelector('.cf-next')?.addEventListener('click', () => go(index + 1));

  // arrastre / swipe
  let startX = null;
  const down = (x) => startX = x;
  const up = (x) => { if (startX === null) return; const dx = x - startX; if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1)); startX = null; };
  track.addEventListener('mousedown', e => down(e.clientX));
  window.addEventListener('mouseup', e => up(e.clientX));
  track.addEventListener('touchstart', e => down(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchend', e => up(e.changedTouches[0].clientX));

  // autoplay suave
  let timer = setInterval(() => go(index + 1), 4200);
  root.addEventListener('mouseenter', () => clearInterval(timer));
  root.addEventListener('mouseleave', () => timer = setInterval(() => go(index + 1), 4200));

  render();
  return { go };
}

/* -------------------------------------------------------------------------
   GLOBO (cobe) — cobertura de despacho en Chile
   ------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------
   GLOBO INTERACTIVO (cobe) — Cobertura de Despacho en Chile con Arcos 3D
   ------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------
   GLOBO INTERACTIVO (cobe) — Cobertura de Despacho en Chile con Arcos y Etiquetas 3D
   ------------------------------------------------------------------------- */
/* -------------------------------------------------------------------------
   GLOBO INTERACTIVO (cobe) — Esfera 3D limpia con mapeado de continentes
   ------------------------------------------------------------------------- */
export function initGlobe(canvas) {
  if (!canvas) return;

  const markers = [
    { id: 'arica', location: [-18.4783, -70.3126] },
    { id: 'anto', location: [-23.6509, -70.3975] },
    { id: 'serena', location: [-29.9027, -71.2519] },
    { id: 'stgo', location: [-33.4489, -70.6693] },
    { id: 'valpo', location: [-33.0472, -71.6127] },
    { id: 'conce', location: [-36.8201, -73.0444] },
    { id: 'temuco', location: [-38.7359, -72.5904] },
    { id: 'pmontt', location: [-41.4689, -72.9411] },
    { id: 'punta', location: [-53.1638, -70.9171] }
  ];

  let pointerInteracting = null;
  let lastPointer = null;
  let dragOffset = { phi: 0, theta: 0 };
  let velocity = { phi: 0, theta: 0 };
  let phiOffset = 0;
  let thetaOffset = 0;
  let isPaused = false;
  let phi = 4.2;
  let speed = 0.003;
  let baseTheta = 0.2;
  let animationId = null;

  const measure = () => canvas.offsetWidth || 500;
  let width = measure();
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  const globe = createGlobe(canvas, {
    devicePixelRatio: dpr,
    width: width * dpr,
    height: width * dpr,
    phi: 4.2,
    theta: baseTheta,
    dark: 1, // Modo OLED oscuro con puntos de continente resplandecientes
    diffuse: 1.4,
    mapSamples: 18000,
    mapBrightness: 8,
    baseColor: [1, 1, 1], // Mapeado de países en puntos luminosos de alta definición
    markerColor: [0.35, 0.65, 1],
    glowColor: [0.12, 0.28, 0.52],
    markerElevation: 0.02,
    opacity: 0.95,
    markers: markers.map(m => ({ location: m.location, size: 0.045, id: m.id }))
  });

  function animate() {
    if (!isPaused) {
      phi += speed;
      if (Math.abs(velocity.phi) > 0.0001 || Math.abs(velocity.theta) > 0.0001) {
        phiOffset += velocity.phi;
        thetaOffset += velocity.theta;
        velocity.phi *= 0.95;
        velocity.theta *= 0.95;
      }
      const thetaMin = -0.4, thetaMax = 0.4;
      if (thetaOffset < thetaMin) {
        thetaOffset += (thetaMin - thetaOffset) * 0.1;
      } else if (thetaOffset > thetaMax) {
        thetaOffset += (thetaMax - thetaOffset) * 0.1;
      }
    }

    const curPhi = phi + phiOffset + dragOffset.phi;
    const curTheta = baseTheta + thetaOffset + dragOffset.theta;
    const sizePx = measure();

    globe.update({
      phi: curPhi,
      theta: curTheta,
      width: sizePx * dpr,
      height: sizePx * dpr,
      dark: 1,
      mapBrightness: 8,
      markerColor: [0.35, 0.65, 1],
      baseColor: [1, 1, 1],
      markers: markers.map(m => ({ location: m.location, size: 0.045, id: m.id }))
    });

    animationId = requestAnimationFrame(animate);
  }

  animate();
  canvas.style.opacity = '1';

  // Interacción táctil con física de inercia
  canvas.style.cursor = 'grab';
  canvas.addEventListener('pointerdown', (e) => {
    pointerInteracting = { x: e.clientX, y: e.clientY };
    canvas.style.cursor = 'grabbing';
    isPaused = true;
  });

  window.addEventListener('pointermove', (e) => {
    if (pointerInteracting !== null) {
      const deltaX = e.clientX - pointerInteracting.x;
      const deltaY = e.clientY - pointerInteracting.y;
      dragOffset = { phi: deltaX / 300, theta: deltaY / 1000 };
      const now = Date.now();
      if (lastPointer) {
        const dt = Math.max(now - lastPointer.t, 1);
        const maxVelocity = 0.15;
        velocity = {
          phi: Math.max(-maxVelocity, Math.min(maxVelocity, ((e.clientX - lastPointer.x) / dt) * 0.3)),
          theta: Math.max(-maxVelocity, Math.min(maxVelocity, ((e.clientY - lastPointer.y) / dt) * 0.08))
        };
      }
      lastPointer = { x: e.clientX, y: e.clientY, t: now };
    }
  }, { passive: true });

  window.addEventListener('pointerup', () => {
    if (pointerInteracting !== null) {
      phiOffset += dragOffset.phi;
      thetaOffset += dragOffset.theta;
      dragOffset = { phi: 0, theta: 0 };
      lastPointer = null;
    }
    pointerInteracting = null;
    canvas.style.cursor = 'grab';
    isPaused = false;
  });

  return globe;
}

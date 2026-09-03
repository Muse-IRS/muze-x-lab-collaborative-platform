(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isHub = location.pathname.includes('/muze-x-lab-collaborative-platform/');

  const targets = isHub
    ? [
        { href: 'https://muse-irs.github.io/muze-x-open-learning-commons/', label: 'Open Learning ↗' },
        { href: 'https://muse-irs.github.io/rgpd-data-journey-audit/', label: 'RGPD ↗' }
      ]
    : [
        { href: 'https://muse-irs.github.io/muze-x-lab-collaborative-platform/', label: 'Muze-X Lab ↗' }
      ];

  if (document.querySelector('.muze-mesh-field')) return;

  const canvas = document.createElement('canvas');
  canvas.className = 'muze-mesh-field';
  canvas.setAttribute('aria-hidden', 'true');

  const vignette = document.createElement('div');
  vignette.className = 'muze-mesh-vignette';
  vignette.setAttribute('aria-hidden', 'true');

  const nav = document.createElement('nav');
  nav.className = 'muze-mesh-nav';
  nav.setAttribute('aria-label', 'Maillage public Muze-X');

  for (const target of targets) {
    const link = document.createElement('a');
    link.href = target.href;
    link.textContent = target.label;
    nav.appendChild(link);
  }

  document.body.prepend(vignette);
  document.body.prepend(canvas);
  document.body.appendChild(nav);

  const footer = document.querySelector('footer');
  if (footer && !footer.querySelector('.muze-conceptual-interface-credit')) {
    const signature = document.createElement('div');
    signature.className = 'muze-conceptual-interface-credit';
    signature.textContent = 'Logique d’interface conceptuelle Muze-X · Champ d’essaim réactif & profondeur perceptive émergente · R&D exploratoire — métaphore visuelle ≠ modèle scientifique.';
    footer.appendChild(signature);
  }

  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!ctx) return;

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const rand = (min, max) => min + Math.random() * (max - min);

  const state = {
    width: 1,
    height: 1,
    dpr: 1,
    particles: [],
    pointer: { x: 0, y: 0, active: false, pressure: 0 },
    last: performance.now()
  };

  function particleCount() {
    const cores = navigator.hardwareConcurrency || 4;
    if (reducedMotion) {
      return clamp(Math.round((state.width * state.height) / 17000), 44, 88);
    }
    const density = cores >= 8 ? 3600 : cores >= 4 ? 4500 : 5900;
    return clamp(Math.round((state.width * state.height) / density), 150, cores >= 8 ? 440 : 320);
  }

  function makeParticle(index) {
    return {
      team: index % 2,
      x: rand(0, state.width),
      y: rand(0, state.height),
      z: rand(.16, 1),
      vx: rand(-.38, .38),
      vy: rand(-.38, .38),
      vz: rand(-.0018, .0018),
      mass: rand(.72, 1.5),
      phase: rand(0, Math.PI * 2),
      drift: rand(.52, 1.36)
    };
  }

  function rebuild() {
    const count = particleCount();
    state.particles = Array.from({ length: count }, (_, index) => makeParticle(index));
  }

  function resize() {
    state.width = Math.max(1, window.innerWidth);
    state.height = Math.max(1, window.innerHeight);
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    rebuild();
    ctx.fillStyle = '#040a16';
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function setPointer(event, active = state.pointer.active) {
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
    state.pointer.active = active;
    state.pointer.pressure = typeof event.pressure === 'number' ? event.pressure : 0;
  }

  window.addEventListener('pointerdown', event => setPointer(event, true), { passive: true });
  window.addEventListener('pointermove', event => setPointer(event), { passive: true });
  window.addEventListener('pointerup', event => setPointer(event, false), { passive: true });
  window.addEventListener('pointercancel', event => setPointer(event, false), { passive: true });
  window.addEventListener('blur', () => { state.pointer.active = false; });
  window.addEventListener('resize', resize, { passive: true });

  function updateParticle(particle, dt, now) {
    const teamPhase = particle.team === 0 ? 0 : Math.PI;
    const centerX = state.width * (.5 + Math.sin(now * .000075 + teamPhase) * .29);
    const centerY = state.height * (.5 + Math.cos(now * .000061 + teamPhase * .73) * .25);

    let fx = (centerX - particle.x) * .000025;
    let fy = (centerY - particle.y) * .000025;

    fx += Math.cos(now * .00021 * particle.drift + particle.phase) * .0055 * particle.drift;
    fy += Math.sin(now * .00018 * particle.drift + particle.phase) * .0055 * particle.drift;

    const fieldDx = particle.x - state.width * .5;
    const fieldDy = particle.y - state.height * .5;
    const fieldDistance = Math.hypot(fieldDx, fieldDy) + .001;
    const spin = particle.team === 0 ? 1 : -1;
    fx += (-fieldDy / fieldDistance) * .0015 * spin;
    fy += (fieldDx / fieldDistance) * .0015 * spin;

    if (state.pointer.active) {
      const dx = state.pointer.x - particle.x;
      const dy = state.pointer.y - particle.y;
      const distance = Math.hypot(dx, dy) + .01;
      const reach = Math.max(260, Math.min(state.width, state.height) * .66);
      const falloff = clamp(1 - distance / reach, 0, 1);
      const force = falloff * (.48 + particle.z * .78) * (1 + state.pointer.pressure * .25);
      fx += (dx / distance) * .052 * force;
      fy += (dy / distance) * .052 * force;
      particle.vz += (particle.team === 0 ? .0007 : -.00058) * falloff;
    }

    particle.vx += (fx / particle.mass) * dt;
    particle.vy += (fy / particle.mass) * dt;

    const travel = dt * (reducedMotion ? .45 : 1);
    particle.x += particle.vx * travel;
    particle.y += particle.vy * travel;
    particle.z += particle.vz * travel;

    particle.vx *= Math.pow(.974, dt);
    particle.vy *= Math.pow(.974, dt);
    particle.vz *= Math.pow(.94, dt);

    const margin = 30;
    if (particle.x < -margin) particle.x = state.width + margin;
    if (particle.x > state.width + margin) particle.x = -margin;
    if (particle.y < -margin) particle.y = state.height + margin;
    if (particle.y > state.height + margin) particle.y = -margin;
    if (particle.z < .12) { particle.z = .12; particle.vz = Math.abs(particle.vz) * .45; }
    if (particle.z > 1.05) { particle.z = 1.05; particle.vz = -Math.abs(particle.vz) * .45; }
  }

  function drawParticle(particle) {
    const speed = Math.hypot(particle.vx, particle.vy);
    const radius = clamp(1.1 + particle.z * 3.2 + speed * .06, 1.3, 6.8);
    const alpha = clamp(.2 + particle.z * .68, .2, .92);
    const cyan = particle.team === 0;

    ctx.beginPath();
    ctx.fillStyle = cyan ? `rgba(89,222,255,${alpha})` : `rgba(190,125,255,${alpha})`;
    ctx.shadowColor = cyan ? 'rgba(70,210,255,.62)' : 'rgba(174,92,255,.58)';
    ctx.shadowBlur = reducedMotion ? 0 : 5 + particle.z * 9;
    ctx.arc(particle.x, particle.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  function frame(now) {
    const elapsed = Math.min(34, now - state.last);
    state.last = now;
    const dt = reducedMotion ? .35 : clamp(elapsed / 16.667, .4, 2.05);

    ctx.shadowBlur = 0;
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = reducedMotion ? 'rgba(4,10,22,.55)' : 'rgba(4,10,22,.18)';
    ctx.fillRect(0, 0, state.width, state.height);

    ctx.globalCompositeOperation = 'lighter';
    for (const particle of state.particles) {
      updateParticle(particle, dt, now);
      drawParticle(particle);
    }

    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
    requestAnimationFrame(frame);
  }

  resize();
  requestAnimationFrame(frame);
})();

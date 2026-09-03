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

  const primaryAnchor = isHub
    ? {
        href: 'https://muse-irs.github.io/muze-x-open-learning-commons/',
        kicker: 'Apprendre',
        title: 'Open Learning',
        subtitle: 'Commons · apprentissage ↗'
      }
    : {
        href: 'https://muse-irs.github.io/muze-x-lab-collaborative-platform/',
        kicker: 'Explorer',
        title: 'Muze-X Lab',
        subtitle: 'plateforme multi-domaine ↗'
      };

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

  const anchorSection = document.createElement('section');
  anchorSection.className = 'muze-mesh-anchor-section';
  anchorSection.setAttribute('aria-label', 'Ancre de navigation du maillage Muze-X');

  const anchorLink = document.createElement('a');
  anchorLink.className = 'muze-mesh-anchor-orb';
  anchorLink.href = primaryAnchor.href;
  anchorLink.dataset.swarmAnchor = 'true';
  anchorLink.setAttribute('aria-label', `${primaryAnchor.kicker} — ${primaryAnchor.title}`);

  const anchorKicker = document.createElement('span');
  anchorKicker.className = 'muze-mesh-anchor-kicker';
  anchorKicker.textContent = primaryAnchor.kicker;

  const anchorTitle = document.createElement('strong');
  anchorTitle.className = 'muze-mesh-anchor-title';
  anchorTitle.textContent = primaryAnchor.title;

  const anchorSubtitle = document.createElement('small');
  anchorSubtitle.className = 'muze-mesh-anchor-subtitle';
  anchorSubtitle.textContent = primaryAnchor.subtitle;

  anchorLink.append(anchorKicker, anchorTitle, anchorSubtitle);

  const interfaceInfo = document.createElement('div');
  interfaceInfo.className = 'muze-interface-technique';
  interfaceInfo.setAttribute('aria-label', 'Technique et rendu de la logique d’interface conceptuelle Muze-X');

  const interfaceHeading = document.createElement('strong');
  interfaceHeading.className = 'muze-interface-technique-heading';
  interfaceHeading.textContent = 'Logique d’interface conceptuelle Muze-X';

  const interfaceLines = document.createElement('div');
  interfaceLines.className = 'muze-interface-technique-lines';

  const descriptions = [
    ['Technique actuelle', 'Canvas 2D · deux essaims cyan/violet · champ plein viewport · attracteur d’ancre'],
    ['Rendu', 'profondeur perceptive émergente · rassemblement dynamique lorsque l’ancre entre dans le viewport'],
    ['Statut', 'R&D exploratoire — métaphore visuelle ≠ modèle scientifique']
  ];

  for (const [label, text] of descriptions) {
    const line = document.createElement('span');
    const labelNode = document.createElement('b');
    labelNode.textContent = label;
    line.append(labelNode, document.createTextNode(` · ${text}`));
    interfaceLines.appendChild(line);
  }

  interfaceInfo.append(interfaceHeading, interfaceLines);
  anchorSection.append(anchorLink, interfaceInfo);

  document.body.prepend(vignette);
  document.body.prepend(canvas);
  document.body.appendChild(nav);

  const footer = document.querySelector('footer');
  if (footer?.parentNode) {
    footer.parentNode.insertBefore(anchorSection, footer);
  } else {
    document.body.appendChild(anchorSection);
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
    anchor: { element: anchorLink, active: false, x: 0, y: 0, radius: 0, strength: 0 },
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

  function updateAnchor() {
    const anchor = state.anchor;
    const rect = anchor.element.getBoundingClientRect();
    const visibleWidth = Math.max(0, Math.min(rect.right, state.width) - Math.max(rect.left, 0));
    const visibleHeight = Math.max(0, Math.min(rect.bottom, state.height) - Math.max(rect.top, 0));
    const visibleArea = visibleWidth * visibleHeight;
    const totalArea = Math.max(1, rect.width * rect.height);
    const visibility = clamp(visibleArea / totalArea, 0, 1);
    const rawStrength = clamp((visibility - .04) / .56, 0, 1);

    anchor.x = rect.left + rect.width * .5;
    anchor.y = rect.top + rect.height * .5;
    anchor.radius = Math.max(72, Math.min(rect.width, rect.height) * .47);
    anchor.strength = rawStrength * (reducedMotion ? .35 : 1);
    anchor.active = anchor.strength > .01;
    anchor.element.classList.toggle('is-field-active', anchor.strength > .18);
  }

  function updateParticle(particle, dt, now) {
    const teamPhase = particle.team === 0 ? 0 : Math.PI;
    const baseCenterX = state.width * (.5 + Math.sin(now * .000075 + teamPhase) * .29);
    const baseCenterY = state.height * (.5 + Math.cos(now * .000061 + teamPhase * .73) * .25);
    let centerX = baseCenterX;
    let centerY = baseCenterY;
    let spring = .000025;

    if (state.anchor.active) {
      const blend = state.anchor.strength;
      const teamOffset = (particle.team === 0 ? -.12 : .12) * state.anchor.radius;
      const anchorTargetX = state.anchor.x + teamOffset;
      const anchorTargetY = state.anchor.y + state.anchor.radius * .15;
      centerX = baseCenterX * (1 - blend) + anchorTargetX * blend;
      centerY = baseCenterY * (1 - blend) + anchorTargetY * blend;
      spring += .00038 * blend;
    }

    let fx = (centerX - particle.x) * spring;
    let fy = (centerY - particle.y) * spring;

    fx += Math.cos(now * .00021 * particle.drift + particle.phase) * .0055 * particle.drift;
    fy += Math.sin(now * .00018 * particle.drift + particle.phase) * .0055 * particle.drift;

    const fieldDx = particle.x - state.width * .5;
    const fieldDy = particle.y - state.height * .5;
    const fieldDistance = Math.hypot(fieldDx, fieldDy) + .001;
    const spin = particle.team === 0 ? 1 : -1;
    fx += (-fieldDy / fieldDistance) * .0015 * spin;
    fy += (fieldDx / fieldDistance) * .0015 * spin;

    if (state.anchor.active) {
      const dx = state.anchor.x - particle.x;
      const dy = state.anchor.y - particle.y;
      const distance = Math.hypot(dx, dy) + .01;
      const nx = dx / distance;
      const ny = dy / distance;
      const boundary = state.anchor.radius * .78;
      const outside = clamp((distance - boundary) / Math.max(state.anchor.radius * 1.8, 1), 0, 1);
      const gather = (.014 + outside * .052) * state.anchor.strength * (.62 + particle.z * .58);
      fx += nx * gather;
      fy += ny * gather;

      if (distance < state.anchor.radius * 1.08) {
        const localSpin = .0062 * state.anchor.strength * spin;
        fx += -ny * localSpin;
        fy += nx * localSpin;
      }
    }

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

    const damping = Math.pow(state.anchor.active ? .966 : .974, dt);
    particle.vx *= damping;
    particle.vy *= damping;
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

    updateAnchor();

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

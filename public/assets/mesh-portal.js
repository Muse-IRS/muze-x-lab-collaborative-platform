(() => {
  'use strict';

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const path = location.pathname;
  const isHub = path.includes('/muze-x-lab-collaborative-platform/');

  const targets = isHub
    ? [
        {
          href: 'https://muse-irs.github.io/muze-x-open-learning-commons/',
          eyebrow: 'APPRENDRE',
          title: 'Open Learning',
          subtitle: 'ressources · concepts · maillage'
        },
        {
          href: 'https://muse-irs.github.io/rgpd-data-journey-audit/',
          eyebrow: 'COMPRENDRE',
          title: 'RGPD Data Journey',
          subtitle: 'données · droits · parcours'
        }
      ]
    : [
        {
          href: 'https://muse-irs.github.io/muze-x-lab-collaborative-platform/',
          eyebrow: 'EXPLORER',
          title: 'Muze-X Lab',
          subtitle: 'plateforme multi-domaine'
        }
      ];

  if (document.querySelector('.muze-portal-network')) return;

  const section = document.createElement('section');
  section.className = 'muze-portal-network';
  section.setAttribute('aria-labelledby', 'muze-portal-title');
  section.innerHTML = `
    <div class="muze-portal-network__head">
      <p class="muze-portal-network__eyebrow">Maillage Muze-X</p>
      <h2 id="muze-portal-title">${isHub ? 'Passer d’un espace à l’autre.' : 'Retour au maillage Muze-X.'}</h2>
      <p>${isHub ? 'Chaque déploiement reste autonome, mais aucun domaine n’est isolé.' : 'Ce déploiement reste autonome et relié à la plateforme multi-domaine.'}</p>
    </div>
    <div class="muze-portal-network__grid"></div>
    <p class="muze-portal-network__note">L’attracteur est un langage visuel de navigation. Il ne mesure ni n’infère l’état cognitif de l’utilisateur.</p>`;

  const grid = section.querySelector('.muze-portal-network__grid');
  for (const target of targets) {
    const link = document.createElement('a');
    link.className = 'muze-portal';
    link.href = target.href;
    link.setAttribute('aria-label', `${target.title} — ${target.subtitle}`);
    link.innerHTML = `
      <canvas aria-hidden="true"></canvas>
      <span class="muze-portal__ring" aria-hidden="true"></span>
      <span class="muze-portal__copy">
        <span>${target.eyebrow}</span>
        <strong>${target.title}</strong>
        <small>${target.subtitle} ↗</small>
      </span>`;
    grid.appendChild(link);
  }

  const footer = document.querySelector('footer');
  if (footer) footer.before(section);
  else document.body.appendChild(section);

  const portals = [...section.querySelectorAll('.muze-portal')].map((link, portalIndex) => {
    const canvas = link.querySelector('canvas');
    const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
    const state = {
      link, canvas, ctx, width: 1, height: 1, dpr: 1,
      pointer: { x: .5, y: .5, active: false },
      particles: [], portalIndex
    };

    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const rand = (a, b) => a + Math.random() * (b - a);

    function resize() {
      const rect = link.getBoundingClientRect();
      state.width = Math.max(1, rect.width);
      state.height = Math.max(1, rect.height);
      state.dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(state.width * state.dpr);
      canvas.height = Math.round(state.height * state.dpr);
      ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      const count = reducedMotion ? 24 : clamp(Math.round(state.width * .18), 44, 68);
      state.particles = Array.from({ length: count }, (_, i) => ({
        team: i % 2,
        x: rand(state.width * .18, state.width * .82),
        y: rand(state.height * .18, state.height * .82),
        vx: rand(-.22, .22),
        vy: rand(-.22, .22),
        z: rand(.25, 1),
        phase: rand(0, Math.PI * 2),
        drift: rand(.75, 1.35)
      }));
    }

    function localPointer(event, active) {
      const rect = link.getBoundingClientRect();
      state.pointer.x = (event.clientX - rect.left) / Math.max(1, rect.width);
      state.pointer.y = (event.clientY - rect.top) / Math.max(1, rect.height);
      state.pointer.active = active;
    }

    link.addEventListener('pointerenter', e => localPointer(e, true), { passive: true });
    link.addEventListener('pointermove', e => localPointer(e, true), { passive: true });
    link.addEventListener('pointerdown', e => localPointer(e, true), { passive: true });
    link.addEventListener('pointerleave', () => { state.pointer.active = false; }, { passive: true });
    link.addEventListener('pointerup', () => { state.pointer.active = false; }, { passive: true });

    resize();
    new ResizeObserver(resize).observe(link);
    return state;
  });

  let last = performance.now();

  function drawPortal(state, now, dt) {
    const { ctx, width, height, pointer, particles, portalIndex } = state;
    ctx.clearRect(0, 0, width, height);
    ctx.globalCompositeOperation = 'lighter';

    const tx = pointer.active ? pointer.x * width : width * .5;
    const ty = pointer.active ? pointer.y * height : height * .56;

    for (const p of particles) {
      const dx = tx - p.x;
      const dy = ty - p.y;
      const d = Math.hypot(dx, dy) + .01;
      const nx = dx / d;
      const ny = dy / d;
      const attract = pointer.active ? .020 : .0065;
      const spin = p.team === 0 ? 1 : -1;
      let fx = nx * attract * (.55 + p.z * .75);
      let fy = ny * attract * (.55 + p.z * .75);
      fx += -ny * .0032 * spin;
      fy += nx * .0032 * spin;
      fx += Math.cos(now * .0004 * p.drift + p.phase + portalIndex) * .0018;
      fy += Math.sin(now * .00036 * p.drift + p.phase) * .0018;

      p.vx += fx * dt;
      p.vy += fy * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vx *= Math.pow(.965, dt);
      p.vy *= Math.pow(.965, dt);

      const margin = width * .08;
      if (p.x < margin) { p.x = margin; p.vx = Math.abs(p.vx) * .55; }
      if (p.x > width - margin) { p.x = width - margin; p.vx = -Math.abs(p.vx) * .55; }
      if (p.y < margin) { p.y = margin; p.vy = Math.abs(p.vy) * .55; }
      if (p.y > height - margin) { p.y = height - margin; p.vy = -Math.abs(p.vy) * .55; }

      const speed = Math.hypot(p.vx, p.vy);
      const radius = 1.35 + p.z * 2.15 + Math.min(1.5, speed * .08);
      const alpha = .26 + p.z * .58;
      ctx.beginPath();
      ctx.fillStyle = p.team === 0
        ? `rgba(89,222,255,${alpha})`
        : `rgba(190,125,255,${alpha})`;
      ctx.shadowColor = p.team === 0 ? 'rgba(89,222,255,.62)' : 'rgba(190,125,255,.58)';
      ctx.shadowBlur = reducedMotion ? 0 : 5 + p.z * 8;
      ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalCompositeOperation = 'source-over';
    ctx.shadowBlur = 0;
  }

  function frame(now) {
    const elapsed = Math.min(34, now - last);
    last = now;
    const dt = reducedMotion ? .25 : Math.max(.35, Math.min(2, elapsed / 16.667));
    for (const portal of portals) drawPortal(portal, now, dt);
    requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
})();

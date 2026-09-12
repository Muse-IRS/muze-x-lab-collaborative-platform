(() => {
  'use strict';

  const canvas = document.getElementById('reflection-field');
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!ctx) return;

  const CONFIG = Object.freeze({
    swarmCount: 2,
    speed: 4.4,
    mode: 'dispersion',
    density: 3,
    color: Object.freeze({ r: 244, g: 93, b: 211 }),
    heartbeat: Object.freeze({
      bpm: 72,
      expansion: 0.11,
      glow: 0.06,
      separationRatio: 0.26,
      fadeStart: 1.35,
      fadeEnd: 1.75
    })
  });

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const state = {
    width: 1,
    height: 1,
    dpr: 1,
    spacing: 32,
    cols: 0,
    rows: 0,
    x0: 0,
    y0: 0,
    start: performance.now(),
    pointer: { x: 0, y: 0, active: false }
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smooth = value => value * value * (3 - 2 * value);

  function resize() {
    state.width = Math.max(1, window.innerWidth);
    state.height = Math.max(1, window.innerHeight);
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);

    const shortest = Math.min(state.width, state.height);
    const baseSpacing = clamp(shortest / 22, 24, 42);
    state.spacing = baseSpacing / Math.sqrt(CONFIG.density);
    state.cols = Math.ceil(state.width / state.spacing) + 2;
    state.rows = Math.ceil(state.height / state.spacing) + 2;
    state.x0 = (state.width - (state.cols - 1) * state.spacing) / 2;
    state.y0 = (state.height - (state.rows - 1) * state.spacing) / 2;
  }

  function gaussian(x, y, cx, cy, sigmaX, sigmaY, amplitude = 1) {
    const dx = (x - cx) / Math.max(1, sigmaX);
    const dy = (y - cy) / Math.max(1, sigmaY);
    return amplitude * Math.exp(-0.5 * (dx * dx + dy * dy));
  }

  function heartbeatEnvelope(seconds, phaseOffset = 0) {
    if (reducedMotion) return 0;

    const cyclesPerSecond = CONFIG.heartbeat.bpm / 60;
    const phase = (seconds * cyclesPerSecond + phaseOffset) % 1;
    const firstBeat = Math.exp(-Math.pow((phase - 0.12) / 0.055, 2));
    const secondBeat = 0.52 * Math.exp(-Math.pow((phase - 0.27) / 0.075, 2));
    return clamp(firstBeat + secondBeat, 0, 1);
  }

  function constrainSeparation(centers) {
    if (centers.length !== 2) return centers;

    const first = centers[0];
    const second = centers[1];
    const dx = second.x - first.x;
    const dy = second.y - first.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / distance;
    const uy = dy / distance;
    const maxDirectionalSigma = distance * CONFIG.heartbeat.separationRatio;

    for (const center of centers) {
      const directionalSigma = Math.sqrt(
        Math.pow(ux * center.sx, 2) + Math.pow(uy * center.sy, 2)
      );

      if (directionalSigma > maxDirectionalSigma) {
        const scale = maxDirectionalSigma / directionalSigma;
        center.sx *= scale;
        center.sy *= scale;
      }
    }

    return centers;
  }

  function movingCenters(time) {
    const elapsed = reducedMotion ? 0.65 : (time - state.start) / 1000;
    const t = elapsed * CONFIG.speed;
    const w = state.width;
    const h = state.height;

    const dispersionWave = 0.5 - 0.5 * Math.cos(t * 0.18);
    const spreadX = w * (0.08 + dispersionWave * 0.24);
    const spreadY = h * (0.04 + dispersionWave * 0.18);
    const sigmaX = w * (0.11 + dispersionWave * 0.10);
    const sigmaY = h * (0.12 + dispersionWave * 0.11);
    const amplitude = 1.08 - dispersionWave * 0.34;

    const midX = w * (0.53 + 0.045 * Math.sin(t * 0.11));
    const midY = h * (0.55 + 0.045 * Math.cos(t * 0.09));
    const driftX = w * 0.035 * Math.sin(t * 0.21);
    const driftY = h * 0.030 * Math.cos(t * 0.17);

    const beats = [
      heartbeatEnvelope(elapsed, 0),
      heartbeatEnvelope(elapsed, 0.5)
    ];

    const centers = [
      {
        x: midX - spreadX + driftX,
        y: midY - spreadY + driftY,
        sx: sigmaX * (1 + CONFIG.heartbeat.expansion * beats[0]),
        sy: sigmaY * (1 + CONFIG.heartbeat.expansion * beats[0]),
        a: amplitude * (1 + CONFIG.heartbeat.glow * beats[0])
      },
      {
        x: midX + spreadX - driftX,
        y: midY + spreadY - driftY,
        sx: sigmaX * (1 + CONFIG.heartbeat.expansion * beats[1]),
        sy: sigmaY * (1 + CONFIG.heartbeat.expansion * beats[1]),
        a: amplitude * (1 + CONFIG.heartbeat.glow * beats[1])
      }
    ];

    return constrainSeparation(centers);
  }

  function swarmContribution(x, y, center) {
    const dx = (x - center.x) / Math.max(1, center.sx);
    const dy = (y - center.y) / Math.max(1, center.sy);
    const radial = Math.sqrt(dx * dx + dy * dy);

    if (radial >= CONFIG.heartbeat.fadeEnd) return 0;

    let taper = 1;
    if (radial > CONFIG.heartbeat.fadeStart) {
      const edge = clamp(
        (radial - CONFIG.heartbeat.fadeStart) /
          (CONFIG.heartbeat.fadeEnd - CONFIG.heartbeat.fadeStart),
        0,
        1
      );
      taper = 1 - smooth(edge);
    }

    return center.a * Math.exp(-0.5 * radial * radial) * taper;
  }

  function pointerContribution(x, y) {
    if (!state.pointer.active) return 0;
    const sigma = Math.max(90, Math.min(state.width, state.height) * 0.18);
    const local = gaussian(x, y, state.pointer.x, state.pointer.y, sigma, sigma, 0.52);
    return CONFIG.mode === 'dispersion' ? -local : local;
  }

  function intensityAt(x, y, centers, time) {
    let value = 0;
    for (const center of centers) {
      value = Math.max(value, swarmContribution(x, y, center));
    }

    const elapsed = reducedMotion ? 0 : (time - state.start) / 1000;
    const t = elapsed * CONFIG.speed;
    const phase = Math.sin(x * 0.012 + y * 0.009 - t * 0.52) * 0.028;
    value += phase + pointerContribution(x, y);

    return clamp(value, 0, 1.35);
  }

  function draw(time) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, state.width, state.height);

    const centers = movingCenters(time);
    const spacing = state.spacing;
    const { r, g, b } = CONFIG.color;

    for (let row = 0; row < state.rows; row += 1) {
      const y = state.y0 + row * spacing;
      for (let col = 0; col < state.cols; col += 1) {
        const x = state.x0 + col * spacing;
        const raw = intensityAt(x, y, centers, time);
        const normalized = smooth(clamp(raw / 1.16, 0, 1));

        const radius = 0.7 + normalized * 2.55;
        const alpha = 0.045 + normalized * 0.88;

        ctx.beginPath();
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
        if (normalized > 0.54 && !reducedMotion) {
          ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${normalized * 0.48})`;
          ctx.shadowBlur = 5 + normalized * 8;
        } else {
          ctx.shadowBlur = 0;
        }
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.shadowBlur = 0;
    requestAnimationFrame(draw);
  }

  function setPointer(event, active = state.pointer.active) {
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
    state.pointer.active = active;
  }

  window.addEventListener('resize', resize, { passive: true });
  window.addEventListener('pointerdown', event => setPointer(event, true), { passive: true });
  window.addEventListener('pointermove', event => setPointer(event), { passive: true });
  window.addEventListener('pointerup', event => setPointer(event, false), { passive: true });
  window.addEventListener('pointercancel', event => setPointer(event, false), { passive: true });
  window.addEventListener('blur', () => { state.pointer.active = false; });

  resize();
  requestAnimationFrame(draw);
})();

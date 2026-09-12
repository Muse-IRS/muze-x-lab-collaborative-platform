(() => {
  'use strict';

  const canvas = document.getElementById('reflection-field');
  if (!(canvas instanceof HTMLCanvasElement)) return;

  const ctx = canvas.getContext('2d', { alpha: false, desynchronized: true });
  if (!ctx) return;

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
    state.spacing = clamp(shortest / 22, 24, 42);
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

  function movingCenters(time) {
    const t = reducedMotion ? 0.65 : (time - state.start) / 1000;
    const w = state.width;
    const h = state.height;

    return [
      {
        x: w * (0.62 + 0.20 * Math.sin(t * 0.23)),
        y: h * (0.46 + 0.17 * Math.cos(t * 0.19)),
        sx: w * 0.18,
        sy: h * 0.20,
        a: 1.00
      },
      {
        x: w * (0.40 + 0.18 * Math.sin(t * 0.17 + 2.1)),
        y: h * (0.66 + 0.15 * Math.sin(t * 0.21 + 0.6)),
        sx: w * 0.16,
        sy: h * 0.16,
        a: 0.78
      },
      {
        x: w * (0.77 + 0.10 * Math.cos(t * 0.13 + 1.4)),
        y: h * (0.77 + 0.10 * Math.sin(t * 0.16 + 2.8)),
        sx: w * 0.11,
        sy: h * 0.12,
        a: 0.58
      }
    ];
  }

  function pointerContribution(x, y) {
    if (!state.pointer.active) return 0;
    const sigma = Math.max(90, Math.min(state.width, state.height) * 0.18);
    return gaussian(x, y, state.pointer.x, state.pointer.y, sigma, sigma, 0.42);
  }

  function intensityAt(x, y, centers, time) {
    let value = 0;
    for (const c of centers) value += gaussian(x, y, c.x, c.y, c.sx, c.sy, c.a);

    const t = reducedMotion ? 0 : (time - state.start) / 1000;
    const phase = Math.sin(x * 0.012 + y * 0.009 - t * 0.52) * 0.035;
    value += phase + pointerContribution(x, y);

    return clamp(value, 0, 1.35);
  }

  function draw(time) {
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, state.width, state.height);

    const centers = movingCenters(time);
    const spacing = state.spacing;

    for (let row = 0; row < state.rows; row += 1) {
      const y = state.y0 + row * spacing;
      for (let col = 0; col < state.cols; col += 1) {
        const x = state.x0 + col * spacing;
        const raw = intensityAt(x, y, centers, time);
        const normalized = smooth(clamp(raw / 1.16, 0, 1));

        const radius = 0.7 + normalized * 2.55;
        const alpha = 0.045 + normalized * 0.88;
        const red = Math.round(215 + normalized * 35);
        const green = Math.round(72 + normalized * 18);
        const blue = Math.round(170 + normalized * 64);

        ctx.beginPath();
        ctx.fillStyle = `rgba(${red}, ${green}, ${blue}, ${alpha})`;
        if (normalized > 0.54 && !reducedMotion) {
          ctx.shadowColor = `rgba(244, 93, 211, ${normalized * 0.48})`;
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

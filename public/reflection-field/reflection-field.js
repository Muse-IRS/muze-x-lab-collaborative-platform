(() => {
  'use strict';

  const stage = document.getElementById('reflection-stage');
  const canvas = document.getElementById('reflection-field');
  const qrLayer = document.getElementById('qr-layer');
  const qrCanvas = document.getElementById('portal-qr');

  if (
    !(stage instanceof HTMLElement) ||
    !(canvas instanceof HTMLCanvasElement) ||
    !(qrLayer instanceof HTMLElement) ||
    !(qrCanvas instanceof HTMLCanvasElement)
  ) return;

  const ctx = canvas.getContext('2d', { alpha: true, desynchronized: true });
  const qrCtx = qrCanvas.getContext('2d', { alpha: false });
  if (!ctx || !qrCtx) return;

  const PORTAL_URL = 'https://muse-irs.github.io/muze-x-lab-collaborative-platform/';
  const QR_MATRIX = Object.freeze([
    '00000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000',
    '00001111111010110100100001001010011110001011111110000',
    '00001000001011011011010001001000100000010010000010000',
    '00001011101010110111001111100111110001010010111010000',
    '00001011101000000001001100011010000110011010111010000',
    '00001011101001010010001011111100011010111010111010000',
    '00001000001010110000000110001110000110000010000010000',
    '00001111111010101010101010101010101010101011111110000',
    '00000000000011101001000010001011101110110000000000000',
    '00000011101011011111100111111110000100110111001110000',
    '00001100010011011111001101000100101101011100010010000',
    '00000101101010111111110100010111000011110111011100000',
    '00001111000100110111000111010011011010010001111110000',
    '00000111111010111100100011101000100101010000010000000',
    '00000100000111110111000100110011011100011101000010000',
    '00001110001000011001000101101101000001111110101000000',
    '00001010110111101011111010101101001011110110111110000',
    '00001100001101110001000011101010111001010010010110000',
    '00001110000100101110100100010010101011011100000010000',
    '00001010001011110110111100101000111001111010011100000',
    '00000110110110100011010110110101110111000011111100000',
    '00001101111111111011111111111001100101101111110110000',
    '00000101100010011101001010001110010100011000110010000',
    '00000101101010010110111110101110101101101010110100000',
    '00000100100011011010011010001111000001001000111100000',
    '00001001111110001100110111111110000001101111100110000',
    '00001110100100100001010100000101110110011011010010000',
    '00001001101000101000000100010011101111111100110000000',
    '00001011110001100011101101011010111010110011011100000',
    '00001110001111000011011101111111100100101000100100000',
    '00000111100010101100001100011100011000010100001010000',
    '00001010001100101001100101011100010101101101001100000',
    '00000000010011011111011011000100010011110010011100000',
    '00000100001011111110010011010100010101001101100110000',
    '00000010010110010000001010100010011000011000011010000',
    '00000000101001001101001101011010011110101101001100000',
    '00000111100110100010010110001110011010111010111100000',
    '00001001101111011111110011111011011100001111110010000',
    '00000000000011010001111110001010111100011000101010000',
    '00001111111000101000100010101111010101101010100000000',
    '00001000001001111111010110001010000111011000111100000',
    '00001011101011010001010111111101100100001111110100000',
    '00001011101011101011101011100000111100000001110110000',
    '00001011101010100011000111011001100110111110011000000',
    '00001000001001110011110010110111100010110001011000000',
    '00001111111000000010001001100101101000011110110100000',
    '00000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000',
    '00000000000000000000000000000000000000000000000000000'
  ]);

  const CONFIG = Object.freeze({
    swarmCount: 2,
    speed: 6.6,
    mode: 'dispersion',
    density: 27,
    automataMultiplier: 9,
    palette: Object.freeze({
      neon: Object.freeze({ r: 255, g: 36, b: 214 }),
      violet: Object.freeze({ r: 166, g: 72, b: 255 }),
      deep: Object.freeze({ r: 78, g: 24, b: 145 }),
      cycleSeconds: 9.5
    }),
    heartbeat: Object.freeze({
      bpm: 72,
      expansion: 0.33,
      glow: 0.06,
      fadeStart: 1.35,
      fadeEnd: 1.75,
      separationGapRatio: 0.06,
      separationFeatherRatio: 0.05
    }),
    reveal: Object.freeze({
      activationRadiusRatio: 0.16,
      activationRadiusMin: 64,
      repelDistanceRatio: 0.28,
      clearRadiusRatio: 0.73,
      clearFeatherRatio: 0.34,
      openRate: 8.5,
      closeRate: 5.5
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
    qrSize: 212,
    start: performance.now(),
    lastFrame: performance.now(),
    reveal: 0,
    revealTarget: 0,
    pointer: {
      x: 0,
      y: 0,
      active: false,
      revealPress: false,
      pointerId: null
    }
  };

  const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
  const smooth = value => value * value * (3 - 2 * value);
  const lerp = (from, to, amount) => from + (to - from) * amount;

  function interpolateColor(from, to, amount) {
    return {
      r: Math.round(lerp(from.r, to.r, amount)),
      g: Math.round(lerp(from.g, to.g, amount)),
      b: Math.round(lerp(from.b, to.b, amount))
    };
  }

  function dynamicColor(x, y, time, normalized) {
    const elapsed = reducedMotion ? 0 : (time - state.start) / 1000;
    const spatial =
      (x / Math.max(1, state.width)) * 0.28 +
      (y / Math.max(1, state.height)) * 0.18 +
      normalized * 0.08;
    const phase = ((elapsed / CONFIG.palette.cycleSeconds + spatial) % 1 + 1) % 1;
    const third = 1 / 3;

    if (phase < third) {
      return interpolateColor(
        CONFIG.palette.neon,
        CONFIG.palette.violet,
        smooth(phase / third)
      );
    }

    if (phase < third * 2) {
      return interpolateColor(
        CONFIG.palette.violet,
        CONFIG.palette.deep,
        smooth((phase - third) / third)
      );
    }

    return interpolateColor(
      CONFIG.palette.deep,
      CONFIG.palette.neon,
      smooth((phase - third * 2) / third)
    );
  }

  function drawPortalQr() {
    const side = QR_MATRIX.length;
    const shortest = Math.min(state.width, state.height);
    const desired = Math.min(state.width * 0.54, state.height * 0.40, shortest * 0.58, 318);
    const moduleCss = clamp(Math.round(desired / side), 3, 6);
    const cssSize = side * moduleCss;
    const qrDpr = Math.min(window.devicePixelRatio || 1, 3);

    state.qrSize = cssSize;
    qrLayer.style.width = `${cssSize}px`;
    qrLayer.style.height = `${cssSize}px`;

    qrCanvas.width = Math.round(cssSize * qrDpr);
    qrCanvas.height = Math.round(cssSize * qrDpr);
    qrCanvas.style.width = `${cssSize}px`;
    qrCanvas.style.height = `${cssSize}px`;

    qrCtx.setTransform(qrDpr, 0, 0, qrDpr, 0, 0);
    qrCtx.imageSmoothingEnabled = false;
    qrCtx.fillStyle = '#ffffff';
    qrCtx.fillRect(0, 0, cssSize, cssSize);
    qrCtx.fillStyle = '#000000';

    for (let row = 0; row < side; row += 1) {
      const bits = QR_MATRIX[row];
      for (let col = 0; col < side; col += 1) {
        if (bits[col] === '1') {
          qrCtx.fillRect(col * moduleCss, row * moduleCss, moduleCss, moduleCss);
        }
      }
    }

    qrCanvas.dataset.target = PORTAL_URL;
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

    const shortest = Math.min(state.width, state.height);
    const baseSpacing = clamp(shortest / 22, 24, 42);
    state.spacing = baseSpacing / Math.sqrt(CONFIG.density);
    state.cols = Math.ceil(state.width / state.spacing) + 2;
    state.rows = Math.ceil(state.height / state.spacing) + 2;
    state.x0 = (state.width - (state.cols - 1) * state.spacing) / 2;
    state.y0 = (state.height - (state.rows - 1) * state.spacing) / 2;

    drawPortalQr();
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

  function applyRevealRepulsion(centers) {
    if (state.reveal <= 0.001) return centers;

    const cx = state.width * 0.5;
    const cy = state.height * 0.5;
    const shortest = Math.min(state.width, state.height);
    const distance = shortest * CONFIG.reveal.repelDistanceRatio * smooth(state.reveal);

    for (let index = 0; index < centers.length; index += 1) {
      const center = centers[index];
      let dx = center.x - cx;
      let dy = center.y - cy;
      let magnitude = Math.hypot(dx, dy);

      if (magnitude < 1) {
        dx = index === 0 ? -1 : 1;
        dy = index === 0 ? -0.65 : 0.65;
        magnitude = Math.hypot(dx, dy);
      }

      center.x += (dx / magnitude) * distance;
      center.y += (dy / magnitude) * distance;
      center.a *= 1 - state.reveal * 0.12;
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

    return applyRevealRepulsion(centers);
  }

  function separationMask(x, y, index, centers) {
    if (centers.length !== 2) return 1;

    const first = centers[0];
    const second = centers[1];
    const dx = second.x - first.x;
    const dy = second.y - first.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / distance;
    const uy = dy / distance;
    const projection = (x - first.x) * ux + (y - first.y) * uy;
    const midpoint = distance * 0.5;
    const gapHalf = Math.max(
      state.spacing * 1.5,
      distance * CONFIG.heartbeat.separationGapRatio
    );
    const feather = Math.max(
      state.spacing * 2,
      distance * CONFIG.heartbeat.separationFeatherRatio
    );

    if (index === 0) {
      const boundary = midpoint - gapHalf;
      if (projection >= boundary) return 0;
      if (projection <= boundary - feather) return 1;
      return 1 - smooth(clamp((projection - (boundary - feather)) / feather, 0, 1));
    }

    const boundary = midpoint + gapHalf;
    if (projection <= boundary) return 0;
    if (projection >= boundary + feather) return 1;
    return smooth(clamp((projection - boundary) / feather, 0, 1));
  }

  function swarmContribution(x, y, center, index, centers) {
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

    const separation = separationMask(x, y, index, centers);
    return center.a * Math.exp(-0.5 * radial * radial) * taper * separation;
  }

  function pointerContribution(x, y) {
    if (!state.pointer.active || state.pointer.revealPress) return 0;
    const sigma = Math.max(90, Math.min(state.width, state.height) * 0.18);
    const local = gaussian(x, y, state.pointer.x, state.pointer.y, sigma, sigma, 0.52);
    return CONFIG.mode === 'dispersion' ? -local : local;
  }

  function qrRevealMask(x, y) {
    if (state.reveal <= 0.001) return 1;

    const dx = x - state.width * 0.5;
    const dy = y - state.height * 0.5;
    const distance = Math.hypot(dx, dy);
    const clearRadius = Math.max(
      state.qrSize * CONFIG.reveal.clearRadiusRatio,
      state.spacing * 12
    );
    const feather = Math.max(
      state.qrSize * CONFIG.reveal.clearFeatherRatio,
      state.spacing * 8
    );

    let opening = 0;
    if (distance <= clearRadius) {
      opening = 1;
    } else if (distance < clearRadius + feather) {
      opening = 1 - smooth((distance - clearRadius) / feather);
    }

    return 1 - state.reveal * opening;
  }

  function intensityAt(x, y, centers, time) {
    let value = 0;
    for (let index = 0; index < centers.length; index += 1) {
      value = Math.max(value, swarmContribution(x, y, centers[index], index, centers));
    }

    const elapsed = reducedMotion ? 0 : (time - state.start) / 1000;
    const t = elapsed * CONFIG.speed;
    const phase = Math.sin(x * 0.012 + y * 0.009 - t * 0.52) * 0.028;
    value += phase + pointerContribution(x, y);

    return clamp(value, 0, 1.35) * qrRevealMask(x, y);
  }

  function updateReveal(time) {
    const dt = clamp((time - state.lastFrame) / 1000, 0, 0.05);
    state.lastFrame = time;

    if (reducedMotion) {
      state.reveal = state.revealTarget;
    } else {
      const rate = state.revealTarget > state.reveal
        ? CONFIG.reveal.openRate
        : CONFIG.reveal.closeRate;
      const interpolation = 1 - Math.exp(-rate * dt);
      state.reveal += (state.revealTarget - state.reveal) * interpolation;
      if (Math.abs(state.revealTarget - state.reveal) < 0.001) {
        state.reveal = state.revealTarget;
      }
    }

    const visible = smooth(clamp((state.reveal - 0.08) / 0.92, 0, 1));
    qrLayer.style.opacity = visible.toFixed(4);
    qrLayer.style.transform =
      `translate(-50%, -50%) scale(${(0.84 + visible * 0.16).toFixed(4)})`;
  }

  function draw(time) {
    updateReveal(time);
    ctx.clearRect(0, 0, state.width, state.height);

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
        const { r, g, b } = dynamicColor(x, y, time, normalized);

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

  function isCentralPress(x, y) {
    const dx = x - state.width * 0.5;
    const dy = y - state.height * 0.5;
    const activationRadius = Math.max(
      CONFIG.reveal.activationRadiusMin,
      Math.min(state.width, state.height) * CONFIG.reveal.activationRadiusRatio
    );
    return Math.hypot(dx, dy) <= activationRadius;
  }

  function beginPointer(event) {
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
    state.pointer.active = true;
    state.pointer.pointerId = event.pointerId;
    state.pointer.revealPress = isCentralPress(event.clientX, event.clientY);

    if (state.pointer.revealPress) {
      state.revealTarget = state.revealTarget > 0.5 ? 0 : 1;
    }

    if (state.pointer.revealPress && canvas.setPointerCapture) {
      try {
        canvas.setPointerCapture(event.pointerId);
      } catch (_) {
        // Pointer capture is optional; the interaction still works without it.
      }
    }
  }

  function movePointer(event) {
    if (!state.pointer.active) return;
    state.pointer.x = event.clientX;
    state.pointer.y = event.clientY;
  }

  function endPointer(event) {
    if (
      state.pointer.pointerId !== null &&
      event.pointerId !== undefined &&
      event.pointerId !== state.pointer.pointerId
    ) return;

    state.pointer.active = false;
    state.pointer.revealPress = false;
    state.pointer.pointerId = null;
  }

  window.addEventListener('resize', resize, { passive: true });
  canvas.addEventListener('pointerdown', beginPointer, { passive: true });
  canvas.addEventListener('pointermove', movePointer, { passive: true });
  canvas.addEventListener('pointerup', endPointer, { passive: true });
  canvas.addEventListener('pointercancel', endPointer, { passive: true });
  window.addEventListener('blur', () => {
    state.pointer.active = false;
    state.pointer.revealPress = false;
    state.pointer.pointerId = null;
  });

  resize();
  requestAnimationFrame(draw);
})();

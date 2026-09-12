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

  const PI = Math.PI;
  const TAU = PI * 2;
  const PHI = (1 + Math.sqrt(5)) / 2;
  const PHI_INVERSE = 1 / PHI;
  const GOLDEN_ANGLE_TURNS = 1 / (PHI * PHI);

  const CONFIG = Object.freeze({
    speed: 8.8,
    density: 27,
    mode: 'dispersion',
    palette: Object.freeze({
      cycleSeconds: 9.5,
      timeScale: 0.1,
      stops: Object.freeze([
        Object.freeze({ stop: 0.000, color: Object.freeze({ r: 5, g: 3, b: 10 }) }),
        Object.freeze({ stop: 0.146, color: Object.freeze({ r: 42, g: 14, b: 94 }) }),
        Object.freeze({ stop: 0.236, color: Object.freeze({ r: 75, g: 93, b: 255 }) }),
        Object.freeze({ stop: 0.382, color: Object.freeze({ r: 57, g: 200, b: 114 }) }),
        Object.freeze({ stop: 0.618, color: Object.freeze({ r: 232, g: 228, b: 74 }) }),
        Object.freeze({ stop: 0.764, color: Object.freeze({ r: 255, g: 138, b: 43 }) }),
        Object.freeze({ stop: 0.854, color: Object.freeze({ r: 255, g: 79, b: 210 }) }),
        Object.freeze({ stop: 1.000, color: Object.freeze({ r: 255, g: 244, b: 255 }) })
      ])
    }),
    heartbeat: Object.freeze({
      bpm: 72,
      expansion: 0.25,
      glow: 0.06,
      phiModulation: 0.18,
      phiRestGlow: 0.055,
      fadeStart: 1.30,
      fadeEnd: 1.72,
      separationGapRatio: 0.045,
      separationFeatherRatio: 0.042
    }),
    planet: Object.freeze({
      rotationSeconds: PI * PHI * 4,
      axialTilt: PI / 7,
      ambient: 0.70,
      lightStrength: 0.27,
      orbitalDepthLight: 0.12,
      longitudeColorInfluence: 0.146,
      latitudeColorInfluence: 0.090,
      occlusionBias: 0.10
    }),
    binary: Object.freeze({
      influenceStartRatio: 0.62,
      strongInteractionRatio: 0.20,
      orbitSeconds: PI * PHI * 1.6,
      precessionSeconds: PI * PHI * 8.0,
      orbitInclination: PI / 3.15,
      nodeAngle: PI / 11,
      attraction: 0.15,
      perspectiveScale: 0.16,
      depthBrightness: 0.12,
      tidalStretch: 0.34,
      tidalCompression: 0.12,
      heartbeatBoost: 0.40,
      gapCollapse: 0.92,
      bridgeStrength: 0.22,
      chromaticExchange: 0.58,
      contactGlow: 0.28,
      auraStrength: 0.045
    }),
    sun: Object.freeze({
      xRatio: 0.50,
      yRatio: 0.50,
      radiusMin: 5.5,
      radiusMax: 13.5,
      haloRatio: 5.4,
      fieldRadiusRatio: 0.56,
      geometricStrength: 0.105,
      shapeStrength: 0.30,
      shapeCrossCompression: 0.16,
      chromaticStrength: 0.72,
      pulseSeconds: PI * PHI * 2.4,
      polarity: 1,
      swarmPolarities: Object.freeze([-1, 1]),
      yellow: Object.freeze({ r: 255, g: 220, b: 74 }),
      orange: Object.freeze({ r: 255, g: 150, b: 42 }),
      white: Object.freeze({ r: 255, g: 250, b: 220 })
    }),
    field: Object.freeze({
      unionGain: 1.18,
      unionPower: 1.12,
      membraneMin: 0.028,
      membraneRadiusRatio: 0.64,
      membraneAlpha: 0.72,
      corePhysicalPixels: 0.85,
      coreAlpha: 0.62,
      glowThreshold: 0.72
    }),
    render: Object.freeze({
      dprMax: 3,
      sampleScale: 0.62,
      maxSamples: 85000,
      minSpacing: 1.55,
      maxSpacing: 5.25
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
    spacing: 3,
    cols: 0,
    rows: 0,
    x0: 0,
    y0: 0,
    qrSize: 212,
    start: performance.now(),
    lastFrame: performance.now(),
    reveal: 0,
    revealTarget: 0,
    binaryInteraction: 0,
    sun: null,
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

  function paletteColorAt(position) {
    const stops = CONFIG.palette.stops;
    const value = clamp(position, 0, 1);

    for (let index = 0; index < stops.length - 1; index += 1) {
      const current = stops[index];
      const next = stops[index + 1];
      if (value <= next.stop) {
        const span = Math.max(0.000001, next.stop - current.stop);
        const amount = smooth(clamp((value - current.stop) / span, 0, 1));
        return interpolateColor(current.color, next.color, amount);
      }
    }

    return stops[stops.length - 1].color;
  }

  function phiWave(seconds, phaseOffset = 0, bpmScale = 1) {
    if (reducedMotion) return 0.5;
    const cyclesPerSecond = (CONFIG.heartbeat.bpm * bpmScale) / 60;
    const phase = seconds * (cyclesPerSecond / PHI) + phaseOffset * PHI_INVERSE;
    return 0.5 + 0.5 * Math.sin(TAU * phase);
  }

  function heartbeatEnvelope(seconds, phaseOffset = 0, bpmScale = 1) {
    if (reducedMotion) return 0;

    const cyclesPerSecond = (CONFIG.heartbeat.bpm * bpmScale) / 60;
    const phase = (seconds * cyclesPerSecond + phaseOffset) % 1;
    const firstBeat = Math.exp(-Math.pow((phase - 0.12) / 0.055, 2));
    const secondBeat = 0.52 * Math.exp(-Math.pow((phase - 0.27) / 0.075, 2));
    const pulse = clamp(firstBeat + secondBeat, 0, 1);
    const phi = phiWave(seconds, phaseOffset, bpmScale);
    const modulated =
      pulse *
      (1 - CONFIG.heartbeat.phiModulation + CONFIG.heartbeat.phiModulation * phi);
    return clamp(modulated + CONFIG.heartbeat.phiRestGlow * phi, 0, 1);
  }

  function interactionStrength(distance) {
    const shortest = Math.max(1, Math.min(state.width, state.height));
    const ratio = distance / shortest;
    const span = CONFIG.binary.influenceStartRatio - CONFIG.binary.strongInteractionRatio;
    return smooth(
      clamp((CONFIG.binary.influenceStartRatio - ratio) / Math.max(0.001, span), 0, 1)
    );
  }

  function solarState(time) {
    const elapsed = reducedMotion ? 0 : (time - state.start) / 1000;
    const shortest = Math.min(state.width, state.height);
    const pulse = reducedMotion
      ? 0.5
      : 0.5 + 0.5 * Math.sin(TAU * elapsed / CONFIG.sun.pulseSeconds);
    return {
      x: state.width * CONFIG.sun.xRatio,
      y: state.height * CONFIG.sun.yRatio,
      radius: clamp(shortest * 0.018, CONFIG.sun.radiusMin, CONFIG.sun.radiusMax) *
        (0.92 + pulse * 0.14),
      fieldRadius: shortest * CONFIG.sun.fieldRadiusRatio,
      pulse,
      polarity: CONFIG.sun.polarity
    };
  }

  function solarField(point, sun) {
    const dx = sun.x - point.x;
    const dy = sun.y - point.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const influence = Math.exp(-Math.pow(distance / Math.max(1, sun.fieldRadius), 2));
    return {
      dx,
      dy,
      distance,
      ux: dx / distance,
      uy: dy / distance,
      influence
    };
  }

  function blendAngles(from, to, amount) {
    const x = (1 - amount) * Math.cos(from) + amount * Math.cos(to);
    const y = (1 - amount) * Math.sin(from) + amount * Math.sin(to);
    return Math.atan2(y, x);
  }

  function solarTone(exposure) {
    const value = clamp(exposure, 0, 1);
    if (value <= 0.55) {
      return interpolateColor(
        CONFIG.sun.yellow,
        CONFIG.sun.orange,
        smooth(value / 0.55)
      );
    }
    return interpolateColor(
      CONFIG.sun.orange,
      CONFIG.sun.white,
      smooth((value - 0.55) / 0.45)
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
    state.dpr = Math.min(window.devicePixelRatio || 1, CONFIG.render.dprMax);

    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    ctx.imageSmoothingEnabled = true;

    const shortest = Math.min(state.width, state.height);
    const baseSpacing = clamp(shortest / 22, 24, 42) / Math.sqrt(CONFIG.density);
    const desiredSpacing = baseSpacing * CONFIG.render.sampleScale;
    const loadSpacing = Math.sqrt(
      (state.width * state.height) / Math.max(1, CONFIG.render.maxSamples)
    );
    state.spacing = clamp(
      Math.max(desiredSpacing, loadSpacing),
      CONFIG.render.minSpacing,
      CONFIG.render.maxSpacing
    );
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

  function applyRevealRepulsion(centers) {
    if (state.reveal <= 0.001) return centers;

    const cx = state.width * 0.5;
    const cy = state.height * 0.5;
    const shortest = Math.min(state.width, state.height);
    const distance = shortest * CONFIG.reveal.repelDistanceRatio * smooth(state.reveal);

    centers.forEach((center, index) => {
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
    });

    return centers;
  }

  function movingCenters(time) {
    const elapsed = reducedMotion ? 0.85 : (time - state.start) / 1000;
    const t = elapsed * CONFIG.speed;
    const w = state.width;
    const h = state.height;
    const shortest = Math.min(w, h);
    const sun = solarState(time);
    state.sun = sun;

    const dispersionWave = 0.5 - 0.5 * Math.cos(t * 0.18);
    const baryX = w * (0.50 + 0.030 * Math.sin(t * 0.055));
    const baryY = h * (0.54 + 0.025 * Math.cos(t * 0.047));
    const frameRadius = Math.hypot(w, h) * 0.5;
    const rawRadius = frameRadius * (0.22 + dispersionWave * 0.98);

    const orbitPhase = reducedMotion
      ? PI * PHI_INVERSE
      : TAU * elapsed / CONFIG.binary.orbitSeconds;
    const precession = reducedMotion
      ? 0
      : 0.18 * Math.sin(TAU * elapsed / CONFIG.binary.precessionSeconds);
    const inclination =
      CONFIG.binary.orbitInclination +
      (reducedMotion ? 0 : 0.055 * Math.sin(TAU * elapsed / (CONFIG.binary.precessionSeconds * PHI)));
    const node = CONFIG.binary.nodeAngle + precession;

    const cosPhase = Math.cos(orbitPhase);
    const sinPhase = Math.sin(orbitPhase);
    const cosInclination = Math.cos(inclination);
    const sinInclination = Math.sin(inclination);
    const cosNode = Math.cos(node);
    const sinNode = Math.sin(node);

    const rawPlaneX = rawRadius * cosPhase;
    const rawPlaneY = rawRadius * sinPhase * cosInclination;
    const rawScreenX = rawPlaneX * cosNode - rawPlaneY * sinNode;
    const rawScreenY = rawPlaneX * sinNode + rawPlaneY * cosNode;
    const rawProjectedDistance = Math.max(1, Math.hypot(rawScreenX * 2, rawScreenY * 2));
    const interaction = interactionStrength(rawProjectedDistance);
    state.binaryInteraction = interaction;

    const radius = rawRadius * (1 - CONFIG.binary.attraction * interaction);
    const planeX = radius * cosPhase;
    const planeY = radius * sinPhase * cosInclination;
    const orbitX = planeX * cosNode - planeY * sinNode;
    const orbitY = planeX * sinNode + planeY * cosNode;
    const depth = sinPhase * sinInclination;

    const firstDepth = -depth;
    const secondDepth = depth;
    const firstPerspective = 1 + firstDepth * CONFIG.binary.perspectiveScale;
    const secondPerspective = 1 + secondDepth * CONFIG.binary.perspectiveScale;

    const rawPoints = [
      { x: baryX - orbitX * firstPerspective, y: baryY - orbitY * firstPerspective },
      { x: baryX + orbitX * secondPerspective, y: baryY + orbitY * secondPerspective }
    ];

    const solarMeta = rawPoints.map((point, index) => {
      const field = solarField(point, sun);
      const swarmPolarity = CONFIG.sun.swarmPolarities[index] || 1;
      const forceSign = -sun.polarity * swarmPolarity;
      const displacement = shortest * CONFIG.sun.geometricStrength * field.influence * forceSign;
      point.x += field.ux * displacement;
      point.y += field.uy * displacement;
      return {
        influence: field.influence,
        forceSign,
        angle: Math.atan2(sun.y - point.y, sun.x - point.x)
      };
    });

    const axis = Math.atan2(
      rawPoints[1].y - rawPoints[0].y,
      rawPoints[1].x - rawPoints[0].x
    );
    const bpmScale = 1 + CONFIG.binary.heartbeatBoost * interaction;

    const beats = [
      heartbeatEnvelope(elapsed, 0, bpmScale),
      heartbeatEnvelope(elapsed, PHI_INVERSE, bpmScale)
    ];

    const baseSigma = shortest * (0.112 + dispersionWave * 0.055);
    const tidalLong = 1 + CONFIG.binary.tidalStretch * interaction;
    const tidalShort = 1 - CONFIG.binary.tidalCompression * interaction;
    const scales = [firstPerspective, secondPerspective];
    const depths = [firstDepth, secondDepth];

    const centers = rawPoints.map((point, index) => {
      const pulseScale = 1 + CONFIG.heartbeat.expansion * beats[index];
      const depthLum = 1 + depths[index] * CONFIG.binary.depthBrightness;
      const solar = solarMeta[index];
      const deformation = CONFIG.sun.shapeStrength * solar.influence;
      const attraction = solar.forceSign >= 0;
      const solarLong = attraction
        ? 1 + deformation
        : Math.max(0.72, 1 - deformation * 0.48);
      const solarShort = attraction
        ? Math.max(0.78, 1 - deformation * CONFIG.sun.shapeCrossCompression)
        : 1 + deformation * 0.62;
      const angleBlend = clamp(solar.influence * 0.76, 0, 0.72);
      const localAngle = blendAngles(axis, solar.angle, angleBlend);

      return {
        x: point.x,
        y: point.y,
        z: depths[index],
        sx: baseSigma * tidalLong * pulseScale * scales[index] * solarLong,
        sy: baseSigma * tidalShort * pulseScale * scales[index] * solarShort,
        a: (1.02 - dispersionWave * 0.25) *
          (1 + CONFIG.heartbeat.glow * beats[index]) *
          depthLum *
          (1 + solar.influence * 0.05),
        angle: localAngle,
        solarInfluence: solar.influence,
        solarForceSign: solar.forceSign,
        sunAngle: solar.angle
      };
    });

    return applyRevealRepulsion(centers);
  }

  function localCoordinates(x, y, center) {
    const dx = x - center.x;
    const dy = y - center.y;
    const cos = Math.cos(center.angle || 0);
    const sin = Math.sin(center.angle || 0);
    return {
      x: dx * cos + dy * sin,
      y: -dx * sin + dy * cos
    };
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
    const baseGapHalf = Math.max(
      state.spacing * 1.15,
      distance * CONFIG.heartbeat.separationGapRatio
    );
    const gapHalf = Math.max(
      state.spacing * 0.10,
      baseGapHalf * (1 - CONFIG.binary.gapCollapse * state.binaryInteraction)
    );
    const feather = Math.max(
      state.spacing * 1.1,
      distance * CONFIG.heartbeat.separationFeatherRatio *
        (1 - state.binaryInteraction * 0.30)
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
    const local = localCoordinates(x, y, center);
    const dx = local.x / Math.max(1, center.sx);
    const dy = local.y / Math.max(1, center.sy);
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

    return (
      center.a *
      Math.exp(-0.5 * radial * radial) *
      taper *
      separationMask(x, y, index, centers)
    );
  }

  function binaryBridgeContribution(x, y, centers) {
    if (centers.length !== 2 || state.binaryInteraction < 0.18) return 0;

    const first = centers[0];
    const second = centers[1];
    const dx = second.x - first.x;
    const dy = second.y - first.y;
    const distance = Math.max(1, Math.hypot(dx, dy));
    const ux = dx / distance;
    const uy = dy / distance;
    const vx = -uy;
    const vy = ux;
    const midpointX = (first.x + second.x) * 0.5;
    const midpointY = (first.y + second.y) * 0.5;
    const px = x - midpointX;
    const py = y - midpointY;
    const along = (px * ux + py * uy) / Math.max(state.spacing * 5, distance * 0.23);
    const across = (px * vx + py * vy) / Math.max(state.spacing * 2.3, distance * 0.042);
    const envelope = Math.exp(-0.5 * (along * along + across * across));
    return CONFIG.binary.bridgeStrength * Math.pow(state.binaryInteraction, 3) * envelope;
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
    let aggregate = 0;
    for (let index = 0; index < centers.length; index += 1) {
      const contribution = clamp(
        swarmContribution(x, y, centers[index], index, centers),
        0,
        1.45
      );
      aggregate += Math.pow(contribution, CONFIG.field.unionPower);
    }

    let value = 1 - Math.exp(-CONFIG.field.unionGain * aggregate);
    value += binaryBridgeContribution(x, y, centers);

    const elapsed = reducedMotion ? 0 : (time - state.start) / 1000;
    const t = elapsed * CONFIG.speed;
    value += Math.sin(x * 0.012 + y * 0.009 - t * 0.52) * 0.020;
    value += pointerContribution(x, y);

    return clamp(value, 0, 1.35) * qrRevealMask(x, y);
  }

  function planetProjection(x, y, centers, time) {
    let chosen = null;
    let chosenIndex = 0;
    let bestScore = Infinity;

    centers.forEach((center, index) => {
      const local = localCoordinates(x, y, center);
      const nx = local.x / Math.max(1, center.sx * CONFIG.heartbeat.fadeEnd);
      const ny = local.y / Math.max(1, center.sy * CONFIG.heartbeat.fadeEnd);
      const radialSquared = nx * nx + ny * ny;
      const score = radialSquared - (center.z || 0) * CONFIG.planet.occlusionBias;
      if (score < bestScore) {
        bestScore = score;
        chosen = { nx, ny, center, radialSquared };
        chosenIndex = index;
      }
    });

    if (!chosen || chosen.radialSquared >= 1) {
      return {
        depth: 0,
        shade: CONFIG.planet.ambient,
        longitudeTurns: 0,
        latitudeTurns: 0.5,
        centerIndex: chosenIndex,
        facing: 0,
        sunExposure: 0,
        orbitalDepth: chosen?.center?.z || 0
      };
    }

    const depth = Math.sqrt(Math.max(0, 1 - chosen.radialSquared));
    const elapsed = reducedMotion ? 0 : (time - state.start) / 1000;
    const rotation = reducedMotion
      ? PI * PHI_INVERSE
      : TAU * (elapsed / CONFIG.planet.rotationSeconds) + chosenIndex * PI * PHI_INVERSE;

    const cosTilt = Math.cos(CONFIG.planet.axialTilt);
    const sinTilt = Math.sin(CONFIG.planet.axialTilt);
    const lx = Math.cos(rotation) * cosTilt;
    const ly = sinTilt;
    const lz = Math.sin(rotation) * cosTilt;
    const light = clamp(chosen.nx * lx + chosen.ny * ly + depth * lz, 0, 1);
    const longitudeTurns = ((Math.atan2(chosen.nx, depth) + rotation) / TAU + 1) % 1;
    const latitudeTurns = clamp(Math.asin(clamp(chosen.ny, -1, 1)) / PI + 0.5, 0, 1);

    let facing = 0;
    if (centers.length === 2) {
      const other = centers[chosenIndex === 0 ? 1 : 0];
      const toOtherX = other.x - chosen.center.x;
      const toOtherY = other.y - chosen.center.y;
      const toOtherLength = Math.max(1, Math.hypot(toOtherX, toOtherY));
      const surfaceX = x - chosen.center.x;
      const surfaceY = y - chosen.center.y;
      const surfaceLength = Math.max(1, Math.hypot(surfaceX, surfaceY));
      const dot =
        (surfaceX / surfaceLength) * (toOtherX / toOtherLength) +
        (surfaceY / surfaceLength) * (toOtherY / toOtherLength);
      facing = smooth(clamp((dot + 0.20) / 1.20, 0, 1));
    }

    let sunExposure = 0;
    if (state.sun) {
      const toSunX = state.sun.x - chosen.center.x;
      const toSunY = state.sun.y - chosen.center.y;
      const toSunLength = Math.max(1, Math.hypot(toSunX, toSunY));
      const surfaceX = x - chosen.center.x;
      const surfaceY = y - chosen.center.y;
      const surfaceLength = Math.max(1, Math.hypot(surfaceX, surfaceY));
      const dot =
        (surfaceX / surfaceLength) * (toSunX / toSunLength) +
        (surfaceY / surfaceLength) * (toSunY / toSunLength);
      sunExposure =
        smooth(clamp((dot + 0.18) / 1.18, 0, 1)) *
        (chosen.center.solarInfluence || 0) *
        (0.42 + depth * 0.58);
    }

    const orbitalDepth = chosen.center.z || 0;
    return {
      depth,
      shade: clamp(
        CONFIG.planet.ambient +
          CONFIG.planet.lightStrength * light +
          CONFIG.planet.orbitalDepthLight * orbitalDepth,
        0.48,
        1.08
      ),
      longitudeTurns,
      latitudeTurns,
      centerIndex: chosenIndex,
      facing,
      sunExposure,
      orbitalDepth
    };
  }

  function dynamicColor(x, y, time, normalized, planet) {
    const elapsed = reducedMotion ? 0 : (time - state.start) / 1000;
    const colorElapsed = elapsed * CONFIG.palette.timeScale;
    const xNorm = x / Math.max(1, state.width);
    const yNorm = y / Math.max(1, state.height);
    const exchangeSync = state.binaryInteraction * planet.facing;
    const centerPhase =
      planet.centerIndex * PHI_INVERSE * 0.236 * (1 - exchangeSync * 0.72);
    const spatial =
      xNorm * GOLDEN_ANGLE_TURNS +
      yNorm * PHI_INVERSE +
      normalized * 0.236 +
      planet.longitudeTurns * CONFIG.planet.longitudeColorInfluence +
      planet.latitudeTurns * CONFIG.planet.latitudeColorInfluence +
      centerPhase;
    const localPhi = phiWave(colorElapsed, spatial);
    const phase = (
      colorElapsed / CONFIG.palette.cycleSeconds +
      spatial +
      (localPhi - 0.5) * 0.146
    ) % 1;

    const base = paletteColorAt((phase + 1) % 1);
    const shaded = {
      r: Math.round(base.r * planet.shade),
      g: Math.round(base.g * planet.shade),
      b: Math.round(base.b * planet.shade)
    };
    const exchange = clamp(
      state.binaryInteraction *
        planet.facing *
        CONFIG.binary.chromaticExchange *
        (0.35 + normalized * 0.65),
      0,
      0.88
    );
    const hot = paletteColorAt(0.764 + 0.236 * planet.depth);
    const binaryColor = interpolateColor(shaded, hot, exchange);
    const solarAmount = clamp(
      planet.sunExposure *
        CONFIG.sun.chromaticStrength *
        (0.34 + normalized * 0.66),
      0,
      0.88
    );
    return interpolateColor(
      binaryColor,
      solarTone(planet.sunExposure),
      solarAmount
    );
  }

  function drawSun(time) {
    const sun = state.sun || solarState(time);
    const visible = 1 - smooth(clamp(state.reveal, 0, 1));
    if (visible <= 0.01) return;

    const haloRadius = sun.radius * CONFIG.sun.haloRatio;
    const gradient = ctx.createRadialGradient(
      sun.x,
      sun.y,
      0,
      sun.x,
      sun.y,
      haloRadius
    );
    gradient.addColorStop(0, `rgba(255, 250, 220, ${0.96 * visible})`);
    gradient.addColorStop(0.16, `rgba(255, 220, 74, ${0.82 * visible})`);
    gradient.addColorStop(0.48, `rgba(255, 150, 42, ${0.28 * visible})`);
    gradient.addColorStop(1, 'rgba(255, 150, 42, 0)');

    ctx.save();
    ctx.globalCompositeOperation = 'lighter';
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, haloRadius, 0, TAU);
    ctx.fill();

    ctx.shadowColor = `rgba(255, 220, 74, ${0.78 * visible})`;
    ctx.shadowBlur = sun.radius * (1.8 + sun.pulse * 1.2);
    ctx.fillStyle = `rgba(255, 226, 92, ${0.94 * visible})`;
    ctx.beginPath();
    ctx.arc(sun.x, sun.y, sun.radius, 0, TAU);
    ctx.fill();
    ctx.restore();
  }

  function drawBinaryAura(centers, time) {
    if (reducedMotion || centers.length !== 2 || state.binaryInteraction < 0.10) return;

    const first = centers[0];
    const second = centers[1];
    const midpointX = (first.x + second.x) * 0.5;
    const midpointY = (first.y + second.y) * 0.5;
    const distance = Math.max(1, Math.hypot(second.x - first.x, second.y - first.y));
    const angle = Math.atan2(second.y - first.y, second.x - first.x);
    const elapsed = (time - state.start) / 1000;
    const wave = 0.5 + 0.5 * Math.sin(TAU * elapsed / (PI * PHI));

    ctx.save();
    ctx.translate(midpointX, midpointY);
    ctx.rotate(angle);
    ctx.lineWidth = Math.max(0.45, 0.9 / state.dpr);

    for (let ring = 0; ring < 2; ring += 1) {
      const growth = 1 + ring * 0.28 + wave * 0.07;
      const alpha =
        CONFIG.binary.auraStrength *
        state.binaryInteraction *
        (1 - ring * 0.28);
      ctx.strokeStyle = `rgba(255, 244, 255, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(
        0,
        0,
        distance * 0.57 * growth,
        Math.max(state.spacing * 7, distance * 0.20 * growth),
        0,
        0,
        TAU
      );
      ctx.stroke();
    }

    ctx.restore();
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

  function drawAutomaton(x, y, normalized, color, planet, row, col) {
    const { r, g, b } = color;

    if (normalized >= CONFIG.field.membraneMin) {
      const membraneRadius =
        state.spacing *
        (CONFIG.field.membraneRadiusRatio + normalized * 0.09) *
        (1 + planet.orbitalDepth * 0.035);
      const interactionAlpha =
        1 +
        CONFIG.binary.contactGlow *
          state.binaryInteraction *
          planet.facing *
          normalized;
      const alpha = clamp(
        (0.020 + normalized * CONFIG.field.membraneAlpha) *
          (0.90 + planet.depth * 0.10) *
          (1 + planet.orbitalDepth * 0.08) *
          interactionAlpha,
        0,
        0.96
      );

      ctx.beginPath();
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      if (
        normalized > CONFIG.field.glowThreshold &&
        !reducedMotion &&
        ((row + col) & 1) === 0
      ) {
        ctx.shadowColor = `rgba(${r}, ${g}, ${b}, ${normalized * 0.34})`;
        ctx.shadowBlur = (2.8 + normalized * 5.2) *
          (1 + state.binaryInteraction * planet.facing * 0.35);
      } else {
        ctx.shadowBlur = 0;
      }
      ctx.arc(x, y, membraneRadius, 0, TAU);
      ctx.fill();
    }

    ctx.shadowBlur = 0;
    const coreSize = Math.max(0.18, CONFIG.field.corePhysicalPixels / state.dpr);
    const coreAlpha = clamp(0.025 + normalized * CONFIG.field.coreAlpha, 0, 0.82);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${coreAlpha})`;
    ctx.fillRect(x - coreSize * 0.5, y - coreSize * 0.5, coreSize, coreSize);
  }

  function draw(time) {
    updateReveal(time);
    ctx.clearRect(0, 0, state.width, state.height);

    const centers = movingCenters(time);
    drawSun(time);
    drawBinaryAura(centers, time);

    for (let row = 0; row < state.rows; row += 1) {
      const y = state.y0 + row * state.spacing;
      for (let col = 0; col < state.cols; col += 1) {
        const x = state.x0 + col * state.spacing;
        const raw = intensityAt(x, y, centers, time);
        const normalized = smooth(clamp(raw / 1.05, 0, 1));
        const planet = planetProjection(x, y, centers, time);
        const color = dynamicColor(x, y, time, normalized, planet);
        drawAutomaton(x, y, normalized, color, planet, row, col);
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
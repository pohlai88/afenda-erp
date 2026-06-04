import {
  MACHINE_INTRO_CONTROLS,
  MACHINE_INTRO_EYE_CENTERS,
  MACHINE_INTRO_LYNX_CROP,
  MACHINE_INTRO_SESSION_FLAG,
} from "./pub-machine-intro-config";

type CropRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

type DrawRect = {
  x: number;
  y: number;
  w: number;
  h: number;
  scale: number;
};

type PixelCandidate = {
  x: number;
  y: number;
  lum: number;
  isEye: boolean;
};

type Particle = {
  x: number;
  y: number;
  tx: number;
  ty: number;
  vx: number;
  vy: number;
  lum: number;
  isEye: boolean;
  alpha: number;
  seed: number;
};

export type MachineIntroResolverElements = {
  glCanvas: HTMLCanvasElement;
  imageCanvas: HTMLCanvasElement;
  fxCanvas: HTMLCanvasElement;
  sourceImage: HTMLImageElement;
  lockupEl: HTMLDivElement;
  opticEl: HTMLDivElement;
};

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

export function createMachineIntroResolver(elements: MachineIntroResolverElements) {
  const { glCanvas, imageCanvas, fxCanvas, sourceImage, lockupEl, opticEl } =
    elements;

  const controls = { ...MACHINE_INTRO_CONTROLS };
  const dpr = Math.min(window.devicePixelRatio || 1, 2);

  let gl: WebGL2RenderingContext;
  let imageCtx: CanvasRenderingContext2D;
  let fxCtx: CanvasRenderingContext2D;
  let program: WebGLProgram;
  let positionBuffer: WebGLBuffer;
  let alphaBuffer: WebGLBuffer;
  let aPosition: number;
  let aAlpha: number;
  let uPointSize: WebGLUniformLocation | null;
  let uColor: WebGLUniformLocation | null;

  let particles: Particle[] = [];
  let particleCount = 0;
  let resolveStart = 0;
  let lastTime = 0;
  let targetRect: DrawRect | null = null;
  let frameId = 0;
  let destroyed = false;

  function setupCanvases() {
    const w = Math.floor(window.innerWidth * dpr);
    const h = Math.floor(window.innerHeight * dpr);

    for (const canvas of [glCanvas, imageCanvas, fxCanvas]) {
      canvas.width = w;
      canvas.height = h;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
    }

    gl = glCanvas.getContext("webgl2", {
      antialias: true,
      premultipliedAlpha: true,
    }) as WebGL2RenderingContext;

    imageCtx = imageCanvas.getContext("2d") as CanvasRenderingContext2D;
    fxCtx = fxCanvas.getContext("2d") as CanvasRenderingContext2D;

    for (const ctx of [imageCtx, fxCtx]) {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.scale(dpr, dpr);
    }
  }

  function compileShader(type: number, source: string) {
    const shader = gl.createShader(type);
    if (!shader) throw new Error("Failed to create shader");

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      throw new Error(gl.getShaderInfoLog(shader) || "Shader compile failed");
    }

    return shader;
  }

  function createShaders() {
    const vertex = `#version 300 es
      precision highp float;
      in vec2 aPosition;
      in float aAlpha;
      uniform float uPointSize;
      out float vAlpha;

      void main() {
        gl_Position = vec4(aPosition, 0.0, 1.0);
        gl_PointSize = uPointSize;
        vAlpha = aAlpha;
      }
    `;

    const fragment = `#version 300 es
      precision highp float;
      uniform vec3 uColor;
      in float vAlpha;
      out vec4 outColor;

      void main() {
        vec2 uv = gl_PointCoord - vec2(0.5);
        float d = dot(uv, uv);
        float core = smoothstep(0.23, 0.0, d);
        float halo = smoothstep(0.32, 0.0, d) * 0.34;
        outColor = vec4(uColor, (core + halo) * vAlpha);
      }
    `;

    const vs = compileShader(gl.VERTEX_SHADER, vertex);
    const fs = compileShader(gl.FRAGMENT_SHADER, fragment);

    program = gl.createProgram() as WebGLProgram;
    gl.attachShader(program, vs);
    gl.attachShader(program, fs);
    gl.linkProgram(program);

    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(gl.getProgramInfoLog(program) || "Program link failed");
    }

    aPosition = gl.getAttribLocation(program, "aPosition");
    aAlpha = gl.getAttribLocation(program, "aAlpha");
    uPointSize = gl.getUniformLocation(program, "uPointSize");
    uColor = gl.getUniformLocation(program, "uColor");

    positionBuffer = gl.createBuffer() as WebGLBuffer;
    alphaBuffer = gl.createBuffer() as WebGLBuffer;
  }

  function getImageDrawRect(sampleW: number, sampleH: number): DrawRect {
    const cx = window.innerWidth / 2;
    const cy = window.innerHeight / 2 - Math.min(96, window.innerHeight * 0.09);
    const scale =
      Math.min(window.innerWidth / sampleW, window.innerHeight / sampleH) * 0.72;

    return {
      x: cx - (sampleW * scale) / 2,
      y: cy - (sampleH * scale) / 2,
      w: sampleW * scale,
      h: sampleH * scale,
      scale,
    };
  }

  function getSourceCrop(): CropRect {
    return {
      x: sourceImage.naturalWidth * MACHINE_INTRO_LYNX_CROP.x,
      y: sourceImage.naturalHeight * MACHINE_INTRO_LYNX_CROP.y,
      w: sourceImage.naturalWidth * MACHINE_INTRO_LYNX_CROP.w,
      h: sourceImage.naturalHeight * MACHINE_INTRO_LYNX_CROP.h,
    };
  }

  function buildSyntheticLynxCandidates(
    sampleW: number,
    sampleH: number,
    candidates: PixelCandidate[],
    eyeCandidates: PixelCandidate[],
  ) {
    for (let i = 0; i < 12_000; i++) {
      const t = Math.random() * Math.PI * 2;
      const rx = 0.26 + Math.random() * 0.2;
      const ry = 0.22 + Math.random() * 0.24;
      const nx = 0.515 + Math.cos(t) * rx * (0.74 + Math.random() * 0.36);
      const ny = 0.52 + Math.sin(t) * ry * (0.78 + Math.random() * 0.28);
      if (nx < 0.16 || nx > 0.86 || ny < 0.13 || ny > 0.88) continue;

      candidates.push({
        x: nx * sampleW,
        y: ny * sampleH,
        lum: 0.18 + Math.random() * 0.54,
        isEye: false,
      });
    }

    for (const eye of MACHINE_INTRO_EYE_CENTERS) {
      for (let i = 0; i < 900; i++) {
        const t = Math.random() * Math.PI * 2;
        const r = Math.random() * 0.048;
        const candidate: PixelCandidate = {
          x: (eye.x + Math.cos(t) * r * 1.55) * sampleW,
          y: (eye.y + Math.sin(t) * r) * sampleH,
          lum: 0.58 + Math.random() * 0.42,
          isEye: true,
        };
        candidates.push(candidate);
        eyeCandidates.push(candidate);
      }
    }
  }

  function buildParticles() {
    const sampleW = 760;
    const sampleH = 640;
    const off = document.createElement("canvas");
    off.width = sampleW;
    off.height = sampleH;
    const ctx = off.getContext("2d");
    if (!ctx) return;

    const crop = getSourceCrop();
    ctx.drawImage(
      sourceImage,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      0,
      0,
      sampleW,
      sampleH,
    );

    const candidates: PixelCandidate[] = [];
    const eyeCandidates: PixelCandidate[] = [];

    try {
      const data = ctx.getImageData(0, 0, sampleW, sampleH).data;

      for (let y = 0; y < sampleH; y += 2) {
        for (let x = 0; x < sampleW; x += 2) {
          const i = (y * sampleW + x) * 4;
          const r = data[i] ?? 0;
          const g = data[i + 1] ?? 0;
          const b = data[i + 2] ?? 0;
          const a = (data[i + 3] ?? 0) / 255;
          const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;

          if (a < 0.01 || lum < 0.16) continue;

          const nx = x / sampleW;
          const ny = y / sampleH;
          const isEye = MACHINE_INTRO_EYE_CENTERS.some(
            (eye) => Math.hypot(nx - eye.x, ny - eye.y) < 0.058,
          );

          const candidate: PixelCandidate = { x, y, lum, isEye };
          candidates.push(candidate);
          if (isEye && lum > 0.22) eyeCandidates.push(candidate);
        }
      }
    } catch {
      buildSyntheticLynxCandidates(sampleW, sampleH, candidates, eyeCandidates);
    }

    targetRect = getImageDrawRect(sampleW, sampleH);
    particles = [];

    const count = controls.density;
    const centerY = window.innerHeight / 2 - 12;
    const verticalSpread = (window.innerHeight * 0.46) / controls.vision;

    for (let i = 0; i < count; i++) {
      const preferEye = i < count * 0.105 && eyeCandidates.length > 0;
      const c = preferEye
        ? eyeCandidates[Math.floor(Math.random() * eyeCandidates.length)]!
        : candidates[Math.floor(Math.random() * candidates.length)]!;

      const tx = targetRect.x + c.x * targetRect.scale;
      const ty = targetRect.y + c.y * targetRect.scale;

      const fieldAngle = Math.random() * Math.PI * 2;
      const fieldRadius =
        Math.max(window.innerWidth, window.innerHeight) *
        (0.22 + Math.random() * 0.36);
      const fromLeft = Math.random() < 0.58;
      const startX = fromLeft
        ? window.innerWidth * 0.36 +
          Math.cos(fieldAngle) * fieldRadius -
          Math.random() * 220
        : window.innerWidth + Math.random() * 180;

      const startY = fromLeft
        ? centerY + Math.sin(fieldAngle) * verticalSpread
        : centerY + (Math.random() - 0.5) * verticalSpread;

      particles.push({
        x: startX,
        y: startY,
        tx,
        ty,
        vx: 0,
        vy: 0,
        lum: c.lum,
        isEye: c.isEye,
        alpha: 0,
        seed: Math.random() * Math.PI * 2,
      });
    }

    particleCount = particles.length;
    resolveStart = performance.now();

    imageCanvas.style.opacity = "0";
    imageCanvas.style.filter = "blur(9px) contrast(1.18) brightness(.92)";
    lockupEl.classList.remove("is-visible");
    opticEl.classList.remove("is-visible");
  }

  function toClipX(x: number) {
    return (x / window.innerWidth) * 2 - 1;
  }

  function toClipY(y: number) {
    return 1 - (y / window.innerHeight) * 2;
  }

  function updateParticles(now: number) {
    const dt = Math.min((now - lastTime) / 16.666, 2.3) || 1;
    lastTime = now;

    const positions = new Float32Array(particleCount * 2);
    const alphas = new Float32Array(particleCount);

    const elapsed = now - resolveStart;
    const rush = clamp(elapsed / 2400, 0, 1);
    const settle = clamp((elapsed - 2200) / 1400, 0, 1);
    const final = clamp((elapsed - 3000) / 1200, 0, 1);

    for (let i = 0; i < particleCount; i++) {
      const p = particles[i]!;
      const dx = p.tx - p.x;
      const dy = p.ty - p.y;
      const dist = Math.hypot(dx, dy) + 0.0001;

      const eyeBoost = p.isEye ? 1.65 : 1;
      const accel =
        (0.013 + p.lum * 0.038) * controls.speed * controls.vision * eyeBoost;

      p.vx += (dx / dist) * accel * dist * 0.018 * dt;
      p.vy += (dy / dist) * accel * dist * 0.018 * dt;

      const damping = p.isEye ? 0.805 : 0.852;
      p.vx *= damping - settle * 0.026;
      p.vy *= damping - settle * 0.026;

      p.x += p.vx * dt;
      p.y += p.vy * dt;

      if (dist < 5.5) {
        const jitter = p.isEye ? 0.2 : 0.66;
        p.x += Math.sin(now * 0.0024 + p.seed) * jitter * (1 - final);
        p.y += Math.cos(now * 0.0021 + p.seed) * jitter * (1 - final);
      }

      const luminosity = p.isEye ? 0.22 : 0;
      p.alpha = clamp(
        (rush * 1.25 + p.lum * 0.38) * (0.28 + p.lum * 1.32) + luminosity,
        0,
        1,
      );

      positions[i * 2] = toClipX(p.x);
      positions[i * 2 + 1] = toClipY(p.y);
      alphas[i] = p.alpha;
    }

    if (elapsed > 2650) {
      imageCanvas.style.opacity = ".96";
      imageCanvas.style.filter =
        "blur(0px) contrast(1.22) brightness(1.02) saturate(.84)";
      opticEl.classList.add("is-visible");
    }

    if (elapsed > 2940) {
      lockupEl.classList.add("is-visible");
    }

    return { positions, alphas, elapsed };
  }

  function renderParticles(payload: {
    positions: Float32Array;
    alphas: Float32Array;
  }) {
    gl.viewport(0, 0, glCanvas.width, glCanvas.height);
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, payload.positions, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aPosition);
    gl.vertexAttribPointer(aPosition, 2, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, alphaBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, payload.alphas, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(aAlpha);
    gl.vertexAttribPointer(aAlpha, 1, gl.FLOAT, false, 0, 0);

    const size = (1.52 + controls.vision * 0.68) * dpr;
    gl.uniform1f(uPointSize, Math.min(size, 3.3 * dpr));
    gl.uniform3f(uColor, 0.88, 0.94, 1.0);

    gl.drawArrays(gl.POINTS, 0, particleCount);
  }

  function renderImage(now: number, elapsed: number) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    imageCtx.clearRect(0, 0, w, h);

    if (!targetRect) return;

    const reveal = clamp((elapsed - 2400) / 1050, 0, 1);
    const crop = getSourceCrop();

    imageCtx.save();
    imageCtx.globalAlpha = 0.12 + reveal * 0.78;
    imageCtx.filter = `contrast(${1.1 + controls.vision * 0.14}) brightness(${0.92 + reveal * 0.16}) saturate(.82)`;
    imageCtx.drawImage(
      sourceImage,
      crop.x,
      crop.y,
      crop.w,
      crop.h,
      targetRect.x,
      targetRect.y,
      targetRect.w,
      targetRect.h,
    );
    imageCtx.restore();

    imageCtx.save();
    imageCtx.globalCompositeOperation = "destination-in";
    const mask = imageCtx.createRadialGradient(
      targetRect.x + targetRect.w * 0.5,
      targetRect.y + targetRect.h * 0.48,
      targetRect.w * 0.14,
      targetRect.x + targetRect.w * 0.5,
      targetRect.y + targetRect.h * 0.48,
      targetRect.w * 0.62,
    );
    mask.addColorStop(0, `rgba(255,255,255,${0.98 * reveal})`);
    mask.addColorStop(0.64, `rgba(255,255,255,${0.9 * reveal})`);
    mask.addColorStop(1, "rgba(255,255,255,0)");
    imageCtx.fillStyle = mask;
    imageCtx.fillRect(targetRect.x, targetRect.y, targetRect.w, targetRect.h);
    imageCtx.restore();

    const pulse = 0.72 + Math.sin(now * 0.0038) * 0.1;
    for (const eye of MACHINE_INTRO_EYE_CENTERS) {
      const eyeX = targetRect.x + targetRect.w * eye.x;
      const eyeY = targetRect.y + targetRect.h * eye.y;
      const radius = targetRect.w * 0.057;
      const gradient = imageCtx.createRadialGradient(
        eyeX,
        eyeY,
        0,
        eyeX,
        eyeY,
        radius,
      );
      gradient.addColorStop(0, `rgba(228,240,255,${0.26 * reveal * pulse})`);
      gradient.addColorStop(0.34, `rgba(169,209,255,${0.11 * reveal})`);
      gradient.addColorStop(1, "rgba(169,209,255,0)");

      imageCtx.fillStyle = gradient;
      imageCtx.beginPath();
      imageCtx.arc(eyeX, eyeY, radius, 0, Math.PI * 2);
      imageCtx.fill();
    }
  }

  function renderFX(now: number, elapsed: number) {
    const w = window.innerWidth;
    const h = window.innerHeight;
    fxCtx.clearRect(0, 0, w, h);

    const rushFade = 1 - clamp((elapsed - 2600) / 1700, 0, 1);

    fxCtx.save();
    fxCtx.globalAlpha = 0.95 * rushFade + 0.18;
    const stream = fxCtx.createLinearGradient(0, 0, w * 0.48, 0);
    stream.addColorStop(0, "rgba(178,214,255,.105)");
    stream.addColorStop(0.45, "rgba(178,214,255,.026)");
    stream.addColorStop(1, "rgba(178,214,255,0)");
    fxCtx.fillStyle = stream;

    for (let i = 0; i < 34; i++) {
      const y =
        (i / 33) * h * 0.65 + 110 + Math.sin(now * 0.00045 + i) * 16;
      const x = -40 + Math.sin(now * 0.0012 + i) * 20;
      const len = 150 + (i % 7) * 54 + Math.random() * 170;
      fxCtx.fillRect(x, y, len, i % 8 === 0 ? 2 : 1);
    }
    fxCtx.restore();

    fxCtx.save();
    const cx = w / 2;
    const cy = h / 2 - 10;
    const aura = fxCtx.createRadialGradient(
      cx,
      cy,
      0,
      cx,
      cy,
      Math.min(w, h) * 0.43,
    );
    aura.addColorStop(0, "rgba(190,222,255,.055)");
    aura.addColorStop(0.34, "rgba(190,222,255,.020)");
    aura.addColorStop(1, "rgba(190,222,255,0)");
    fxCtx.fillStyle = aura;
    fxCtx.beginPath();
    fxCtx.arc(cx, cy, Math.min(w, h) * 0.43, 0, Math.PI * 2);
    fxCtx.fill();
    fxCtx.restore();

    if (!targetRect) return;

    const vision = clamp((elapsed - 2400) / 1000, 0, 1);
    if (vision <= 0) return;

    fxCtx.save();
    fxCtx.globalAlpha = vision;
    fxCtx.strokeStyle = "rgba(212,231,255,.09)";
    fxCtx.lineWidth = 1;

    const midY = targetRect.y + targetRect.h * 0.455;
    const midX = targetRect.x + targetRect.w * 0.5;

    fxCtx.beginPath();
    fxCtx.moveTo(targetRect.x + targetRect.w * 0.26, midY);
    fxCtx.lineTo(targetRect.x + targetRect.w * 0.74, midY);
    fxCtx.stroke();

    fxCtx.beginPath();
    fxCtx.moveTo(midX, targetRect.y + targetRect.h * 0.19);
    fxCtx.lineTo(midX, targetRect.y + targetRect.h * 0.74);
    fxCtx.stroke();

    fxCtx.strokeStyle = "rgba(212,231,255,.055)";
    fxCtx.beginPath();
    fxCtx.ellipse(
      midX,
      midY,
      targetRect.w * 0.22,
      targetRect.h * 0.19,
      0,
      0,
      Math.PI * 2,
    );
    fxCtx.stroke();
    fxCtx.restore();
  }

  function tick(now: number) {
    if (destroyed) return;

    const payload = updateParticles(now);
    renderParticles(payload);
    renderImage(now, payload.elapsed);
    renderFX(now, payload.elapsed);
    frameId = requestAnimationFrame(tick);
  }

  function rebuild() {
    buildParticles();
    lastTime = performance.now();
  }

  function skip() {
    imageCanvas.style.opacity = ".98";
    imageCanvas.style.filter =
      "blur(0px) contrast(1.22) brightness(1.02) saturate(.84)";
    opticEl.classList.add("is-visible");
    lockupEl.classList.add("is-visible");
  }

  function boot() {
    setupCanvases();
    createShaders();
    rebuild();
    lastTime = performance.now();
    frameId = requestAnimationFrame(tick);
  }

  function destroy() {
    destroyed = true;
    cancelAnimationFrame(frameId);
  }

  function handleResize() {
    setupCanvases();
    createShaders();
    rebuild();
  }

  return {
    boot,
    skip,
    destroy,
    handleResize,
  };
}

export function shouldSkipMachineIntro(): boolean {
  if (typeof window === "undefined") return true;

  const params = new URLSearchParams(window.location.search);
  if (params.get("intro") === "1") return false;
  if (params.get("intro") === "0") return true;

  if (window.matchMedia("(max-width: 68.75rem)").matches) return true;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return true;
  if (window.location.hash !== "") return true;

  try {
    if (sessionStorage.getItem(MACHINE_INTRO_SESSION_FLAG) === "1") return true;
  } catch {
    return true;
  }

  return false;
}

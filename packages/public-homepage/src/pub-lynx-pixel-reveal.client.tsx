"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useRef, useState } from "react";

import type { HomepageContent } from "./pub-homepage-schema";
import styles from "../styles/public-homepage.module.css";

const LYNX_IMAGE_SRC = "/landing/afenda-lynx-pixel.png";
const INTRO_SESSION_KEY = "afenda_lynx_intro_seen";
const PARTICLE_SAMPLE_WIDTH = 260;
const PARTICLE_DURATION_MS = 3600;

type Particle = {
  color: string;
  delay: number;
  radius: number;
  startX: number;
  startY: number;
  targetX: number;
  targetY: number;
  drift: number;
  isEye: boolean;
};

function brightenChannel(value: number) {
  return Math.min(255, Math.round(value * 1.65 + 34));
}

function easeOutCubic(value: number) {
  return 1 - Math.pow(1 - value, 3);
}

function clamp01(value: number) {
  return Math.max(0, Math.min(1, value));
}

function getIntroPreference() {
  if (typeof window === "undefined") {
    return { forceReplay: false, shouldSkip: false };
  }

  const params = new URLSearchParams(window.location.search);
  const forceSkip = params.get("intro") === "0";
  const forceReplay = params.get("intro") === "1";
  const seenThisSession =
    !forceReplay && window.sessionStorage.getItem(INTRO_SESSION_KEY) === "1";
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

  return {
    forceReplay,
    shouldSkip: forceSkip || seenThisSession || reducedMotion.matches,
  };
}

function isEyePixel(normalizedX: number, normalizedY: number) {
  return (
    Math.hypot(normalizedX - 0.44, normalizedY - 0.49) < 0.042 ||
    Math.hypot(normalizedX - 0.52, normalizedY - 0.49) < 0.042
  );
}

function buildParticles({
  canvasHeight,
  canvasWidth,
  image,
}: {
  canvasHeight: number;
  canvasWidth: number;
  image: HTMLImageElement;
}) {
  const sampleHeight = Math.max(
    1,
    Math.round(PARTICLE_SAMPLE_WIDTH * (image.naturalHeight / image.naturalWidth)),
  );
  const sampler = document.createElement("canvas");
  sampler.width = PARTICLE_SAMPLE_WIDTH;
  sampler.height = sampleHeight;

  const samplerContext = sampler.getContext("2d", { willReadFrequently: true });
  if (!samplerContext) return [];

  samplerContext.drawImage(image, 0, 0, PARTICLE_SAMPLE_WIDTH, sampleHeight);
  const pixels = samplerContext.getImageData(
    0,
    0,
    PARTICLE_SAMPLE_WIDTH,
    sampleHeight,
  ).data;

  const imageAspect = image.naturalWidth / image.naturalHeight;
  const canvasAspect = canvasWidth / canvasHeight;
  const coverScale =
    (canvasAspect > imageAspect
      ? canvasWidth / image.naturalWidth
      : canvasHeight / image.naturalHeight) * 0.9;
  const drawnWidth = image.naturalWidth * coverScale;
  const drawnHeight = image.naturalHeight * coverScale;
  const objectPositionX = 0.54;
  const objectPositionY = 0.41;
  const transformOriginX = canvasWidth * objectPositionX;
  const transformOriginY = canvasHeight * objectPositionY;
  const imageLeft = (canvasWidth - drawnWidth) * objectPositionX;
  const imageTop = (canvasHeight - drawnHeight) * objectPositionY;

  const particles: Particle[] = [];
  const stride = 2;

  for (let y = 0; y < sampleHeight; y += stride) {
    for (let x = 0; x < PARTICLE_SAMPLE_WIDTH; x += stride) {
      const index = (y * PARTICLE_SAMPLE_WIDTH + x) * 4;
      const red = pixels[index] ?? 0;
      const green = pixels[index + 1] ?? 0;
      const blue = pixels[index + 2] ?? 0;
      const alpha = pixels[index + 3] ?? 0;
      const luminance = red * 0.2126 + green * 0.7152 + blue * 0.0722;
      const normalizedX = x / PARTICLE_SAMPLE_WIDTH;
      const normalizedY = y / sampleHeight;
      const isEye = isEyePixel(normalizedX, normalizedY);

      if (
        alpha < 64 ||
        luminance < 18 ||
        (!isEye && Math.random() > 0.54) ||
        (isEye && luminance < 28 && Math.random() > 0.32)
      ) {
        continue;
      }

      const coverX = imageLeft + normalizedX * drawnWidth;
      const coverY = imageTop + normalizedY * drawnHeight;
      const targetX = transformOriginX + (coverX - transformOriginX) * 0.9;
      const targetY = transformOriginY + (coverY - transformOriginY) * 0.9;
      const fromLeft = Math.random() > 0.26;
      const startX = fromLeft
        ? -canvasWidth * (0.08 + Math.random() * 0.32)
        : canvasWidth * (1.02 + Math.random() * 0.18);

      particles.push({
        color: `rgb(${brightenChannel(red)} ${brightenChannel(green)} ${brightenChannel(
          blue,
        )})`,
        delay: isEye ? Math.random() * 0.12 : 0.08 + Math.random() * 0.42,
        drift: (Math.random() - 0.5) * canvasHeight * (isEye ? 0.05 : 0.18),
        isEye,
        radius: isEye ? 1.4 + Math.random() * 1.8 : 0.75 + Math.random() * 1.85,
        startX,
        startY: targetY + (Math.random() - 0.5) * canvasHeight * 0.72,
        targetX,
        targetY,
      });
    }
  }

  return particles;
}

export function LynxPixelReveal({
  content,
  initialSkip = false,
}: {
  content: HomepageContent;
  initialSkip?: boolean;
}) {
  const heroRef = useRef<HTMLElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const atmosphereRef = useRef<HTMLCanvasElement | null>(null);
  const mediaRef = useRef<HTMLDivElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const settlingRef = useRef(false);
  const [phase, setPhase] = useState<"intro" | "settling" | "ready">(
    initialSkip ? "ready" : "intro",
  );
  const [instantResolve, setInstantResolve] = useState(initialSkip);

  function resolveIntroInstantly() {
    document.documentElement.dataset.afendaIntro = "ready";
    window.sessionStorage.setItem(INTRO_SESSION_KEY, "1");
    const instantClassName = styles.heroInstant;
    if (instantClassName) {
      heroRef.current?.classList.add(instantClassName);
    }
    setInstantResolve(true);
    setPhase("ready");
  }

  useLayoutEffect(() => {
    const { shouldSkip } = getIntroPreference();

    if (!initialSkip && !shouldSkip) {
      delete document.documentElement.dataset.afendaIntro;
      return;
    }

    resolveIntroInstantly();
  }, []);

  useEffect(() => {
    const media = mediaRef.current;
    const canvas = canvasRef.current;
    const atmosphere = atmosphereRef.current;
    const context = canvas?.getContext("2d");
    const atmosphereContext = atmosphere?.getContext("2d");
    if (!media || !canvas || !atmosphere || !context || !atmosphereContext) return;
    const mediaElement = media;
    const canvasElement = canvas;
    const atmosphereElement = atmosphere;
    const canvasContext = context;
    const atmosphereCanvasContext = atmosphereContext;

    const { shouldSkip } = getIntroPreference();

    if (initialSkip || shouldSkip) {
      resolveIntroInstantly();
      return;
    }

    let cancelled = false;
    const image = new Image();
    image.decoding = "async";

    function stopAnimation() {
      if (animationRef.current !== null) {
        window.cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    }

    function resizeCanvas() {
      const bounds = mediaElement.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvasElement.width = Math.max(1, Math.round(bounds.width * dpr));
      canvasElement.height = Math.max(1, Math.round(bounds.height * dpr));
      atmosphereElement.width = canvasElement.width;
      atmosphereElement.height = canvasElement.height;
      canvasElement.style.width = `${bounds.width}px`;
      canvasElement.style.height = `${bounds.height}px`;
      atmosphereElement.style.width = `${bounds.width}px`;
      atmosphereElement.style.height = `${bounds.height}px`;
      canvasContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      atmosphereCanvasContext.setTransform(dpr, 0, 0, dpr, 0, 0);
      return { height: bounds.height, width: bounds.width };
    }

    function renderAtmosphere(width: number, height: number, timeline: number) {
      atmosphereCanvasContext.clearRect(0, 0, width, height);
      atmosphereCanvasContext.save();
      atmosphereCanvasContext.globalCompositeOperation = "lighter";

      const haze = atmosphereCanvasContext.createRadialGradient(
        width * 0.55,
        height * 0.5,
        width * 0.08,
        width * 0.55,
        height * 0.5,
        width * 0.48,
      );
      haze.addColorStop(0, `rgba(180, 225, 255, ${0.02 + timeline * 0.035})`);
      haze.addColorStop(0.48, `rgba(92, 152, 190, ${0.018 + timeline * 0.025})`);
      haze.addColorStop(1, "rgba(0, 0, 0, 0)");
      atmosphereCanvasContext.fillStyle = haze;
      atmosphereCanvasContext.fillRect(0, 0, width, height);

      const streakCount = 18;
      atmosphereCanvasContext.lineCap = "round";
      for (let index = 0; index < streakCount; index += 1) {
        const lane = index / streakCount;
        const x =
          width * (0.08 + ((lane * 1.83 + timeline * 0.28) % 1) * 0.84);
        const y =
          height * (0.24 + ((lane * 2.37 + timeline * 0.12) % 1) * 0.46);
        const length = width * (0.018 + (index % 4) * 0.008);
        atmosphereCanvasContext.globalAlpha = 0.05 + timeline * 0.08;
        atmosphereCanvasContext.strokeStyle = "rgb(177 222 255)";
        atmosphereCanvasContext.lineWidth = 0.6;
        atmosphereCanvasContext.beginPath();
        atmosphereCanvasContext.moveTo(x - length, y);
        atmosphereCanvasContext.lineTo(x + length, y);
        atmosphereCanvasContext.stroke();
      }

      atmosphereCanvasContext.restore();
    }

    image.onload = () => {
      if (cancelled) return;

      const { height, width } = resizeCanvas();
      const particles = buildParticles({
        canvasHeight: height,
        canvasWidth: width,
        image,
      });
      const start = performance.now();

      function render(now: number) {
        if (cancelled) return;

        const elapsed = now - start;
        const timeline = clamp01(elapsed / PARTICLE_DURATION_MS);

        renderAtmosphere(width, height, timeline);

        if (timeline > 0.62 && !settlingRef.current) {
          settlingRef.current = true;
          setPhase("settling");
        }

        canvasContext.clearRect(0, 0, width, height);

        const globalFade = timeline > 0.84 ? 1 - (timeline - 0.84) / 0.16 : 1;
        canvasContext.globalCompositeOperation = "lighter";

        for (const particle of particles) {
          const local = clamp01((timeline - particle.delay) / (1 - particle.delay));
          if (local <= 0) continue;

          const eased = easeOutCubic(local);
          const settle = 1 - eased;
          const x = particle.startX + (particle.targetX - particle.startX) * eased;
          const y =
            particle.startY +
            (particle.targetY - particle.startY) * eased +
            Math.sin(local * Math.PI * 2 + particle.delay * 10) *
              particle.drift *
              settle;
          const tailX = x - (particle.targetX - particle.startX) * 0.072 * settle;

          const eyeBoost = particle.isEye ? 1.26 : 1;
          canvasContext.globalAlpha =
            Math.max(0, globalFade) * Math.min(1, (0.58 + local * 0.72) * eyeBoost);
          canvasContext.strokeStyle = particle.color;
          canvasContext.lineWidth = Math.max(0.55, particle.radius * 0.72);
          canvasContext.beginPath();
          canvasContext.moveTo(tailX, y);
          canvasContext.lineTo(x, y);
          canvasContext.stroke();

          canvasContext.globalAlpha = Math.max(0, globalFade) * eyeBoost;
          canvasContext.fillStyle = particle.color;
          canvasContext.beginPath();
          canvasContext.arc(x, y, particle.radius, 0, Math.PI * 2);
          canvasContext.fill();
        }

        canvasContext.globalAlpha = 1;
        canvasContext.globalCompositeOperation = "source-over";

        if (timeline < 1) {
          animationRef.current = window.requestAnimationFrame(render);
        } else {
          canvasContext.clearRect(0, 0, width, height);
          atmosphereCanvasContext.clearRect(0, 0, width, height);
          window.sessionStorage.setItem(INTRO_SESSION_KEY, "1");
          document.documentElement.dataset.afendaIntro = "ready";
          setPhase("ready");
          animationRef.current = null;
        }
      }

      animationRef.current = window.requestAnimationFrame(render);
    };

    const handleResize = () => {
      stopAnimation();
      setInstantResolve(true);
      setPhase("ready");
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      stopAnimation();
      canvasContext.clearRect(0, 0, canvasElement.width, canvasElement.height);
      atmosphereCanvasContext.clearRect(
        0,
        0,
        atmosphereElement.width,
        atmosphereElement.height,
      );
      resolveIntroInstantly();
    };

    window.addEventListener("resize", handleResize, { once: true });
    window.addEventListener("keydown", handleKeyDown);
    image.src = LYNX_IMAGE_SRC;

    return () => {
      cancelled = true;
      stopAnimation();
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const imageClassName = `${styles.heroImage} ${
    phase === "intro" ? styles.heroImageIntro : styles.heroImageReady
  }`;
  const copyClassName = `${styles.heroCopy} ${
    phase === "ready" ? styles.heroCopyReady : styles.heroCopyIntro
  }`;
  const heroClassName = `${styles.hero} ${
    instantResolve ? styles.heroInstant : ""
  }`;

  return (
    <section
      ref={heroRef}
      className={heroClassName}
      aria-labelledby="public-home-title"
      suppressHydrationWarning
    >
      <div ref={mediaRef} className={styles.heroMedia} aria-hidden="true">
        <img
          className={imageClassName}
          src={LYNX_IMAGE_SRC}
          alt=""
          width="1672"
          height="941"
        />
        <canvas ref={atmosphereRef} className={styles.atmosphereCanvas} />
        <canvas ref={canvasRef} className={styles.pixelCanvas} />
      </div>
      <div className={copyClassName}>
        <h1 id="public-home-title" className={styles.title}>
          {content.title}
        </h1>
        <Link className={styles.heroCta} href={content.signInHref}>
          {content.signInLabel}
        </Link>
      </div>
    </section>
  );
}

"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import type { HomepageContent } from "./pub-homepage-schema";
import {
  MACHINE_INTRO_SESSION_FLAG,
  MACHINE_INTRO_SOURCE_IMAGE,
  MACHINE_INTRO_TOTAL_MS,
} from "./pub-machine-intro-config";
import {
  createMachineIntroResolver,
  shouldSkipMachineIntro,
} from "./pub-machine-intro-resolver";
import introStyles from "../styles/machine-intro.module.css";

type MachineIntroSceneProps = {
  content: HomepageContent;
  onDismiss: () => void;
};

export function MachineIntroScene({ content, onDismiss }: MachineIntroSceneProps) {
  const glRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLCanvasElement>(null);
  const fxRef = useRef<HTMLCanvasElement>(null);
  const sourceRef = useRef<HTMLImageElement>(null);
  const lockupRef = useRef<HTMLDivElement>(null);
  const opticRef = useRef<HTMLDivElement>(null);
  const dismissedRef = useRef(false);
  const dismissTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resolverRef = useRef<ReturnType<typeof createMachineIntroResolver> | null>(
    null,
  );

  const [imageReady, setImageReady] = useState(false);

  useEffect(() => {
    if (sourceRef.current?.complete) {
      setImageReady(true);
    }
  }, []);

  const dismiss = useCallback(() => {
    if (dismissedRef.current) return;
    dismissedRef.current = true;

    if (dismissTimerRef.current) {
      clearTimeout(dismissTimerRef.current);
      dismissTimerRef.current = null;
    }

    resolverRef.current?.skip();

    try {
      sessionStorage.setItem(MACHINE_INTRO_SESSION_FLAG, "1");
    } catch {
      // Storage unavailable — still dismiss the overlay.
    }

    onDismiss();
  }, [onDismiss]);

  const handleSkip = useCallback(() => {
    resolverRef.current?.skip();
    dismiss();
  }, [dismiss]);

  useEffect(() => {
    if (!imageReady) return;

    const glCanvas = glRef.current;
    const imageCanvas = imageRef.current;
    const fxCanvas = fxRef.current;
    const sourceImage = sourceRef.current;
    const lockupEl = lockupRef.current;
    const opticEl = opticRef.current;

    if (
      !glCanvas ||
      !imageCanvas ||
      !fxCanvas ||
      !sourceImage ||
      !lockupEl ||
      !opticEl
    ) {
      return;
    }

    const resolver = createMachineIntroResolver({
      glCanvas,
      imageCanvas,
      fxCanvas,
      sourceImage,
      lockupEl,
      opticEl,
    });

    resolverRef.current = resolver;
    resolver.boot();

    dismissTimerRef.current = setTimeout(dismiss, MACHINE_INTRO_TOTAL_MS);

    const handleResize = () => {
      resolver.handleResize();
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.stopPropagation();
        handleSkip();
      }
    };

    window.addEventListener("resize", handleResize);
    window.addEventListener("keydown", handleKeyDown, { capture: true });

    return () => {
      if (dismissTimerRef.current) clearTimeout(dismissTimerRef.current);
      window.removeEventListener("resize", handleResize);
      window.removeEventListener("keydown", handleKeyDown, { capture: true });
      resolver.destroy();
      resolverRef.current = null;
    };
  }, [dismiss, handleSkip, imageReady]);

  return (
    <section
      className={introStyles.scene}
      aria-label="Afenda machine intro"
      data-testid="machine-intro-scene"
    >
      <div className={introStyles.frame} aria-hidden="true" />
      <i className={introStyles.cornerTl} aria-hidden="true" />
      <i className={introStyles.cornerTr} aria-hidden="true" />
      <i className={introStyles.cornerBl} aria-hidden="true" />
      <i className={introStyles.cornerBr} aria-hidden="true" />

      <canvas
        ref={glRef}
        className={introStyles.glCanvas}
        aria-hidden="true"
      />
      <canvas
        ref={imageRef}
        className={introStyles.imageCanvas}
        aria-hidden="true"
      />
      <canvas ref={fxRef} className={introStyles.fxCanvas} aria-hidden="true" />

      <div className={introStyles.brandMark} aria-hidden="true">
        {content.introBrandMark}
      </div>
      <div className={introStyles.status} aria-hidden="true">
        {content.introStatusLabel}
      </div>

      <div className={introStyles.pillarReadout} aria-hidden="true">
        {content.introPillars.map((pillar) => (
          <span key={pillar}>{pillar}</span>
        ))}
      </div>

      <div className={introStyles.visionReadout} aria-hidden="true">
        <span>{content.introVisionLabel}</span>
        <strong className={introStyles.visionReadoutStrong}>
          {content.introVisionValue}
        </strong>
        <span className={introStyles.visionReadoutRule} />
      </div>

      <div className={introStyles.bottomLeft} aria-hidden="true">
        {content.introFooterLabel}
      </div>

      <div ref={opticRef} className={introStyles.optic} aria-hidden="true">
        <i className={introStyles.opticH} />
        <i className={introStyles.opticV} />
      </div>

      <section
        ref={lockupRef}
        className={introStyles.lockup}
        aria-label={content.introLockupAriaLabel}
      >
        <h1 className={introStyles.lockupTitle}>{content.introLockupTitle}</h1>
        <p className={introStyles.lockupSubtitle}>{content.introLockupSubtitle}</p>
        <div className={introStyles.lockupRule} aria-hidden="true" />
      </section>

      <button
        type="button"
        className={introStyles.skip}
        onClick={handleSkip}
      >
        {content.introSkipLabel}
      </button>

      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        ref={sourceRef}
        src={MACHINE_INTRO_SOURCE_IMAGE}
        alt=""
        className={introStyles.sourceImage}
        onLoad={() => setImageReady(true)}
      />
    </section>
  );
}

export function MachineIntroGate({
  content,
  onActiveChange,
}: {
  content: HomepageContent;
  onActiveChange: (active: boolean) => void;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (shouldSkipMachineIntro()) {
      onActiveChange(false);
      return;
    }

    setVisible(true);
    onActiveChange(true);
  }, [onActiveChange]);

  if (!visible) return null;

  return (
    <MachineIntroScene
      content={content}
      onDismiss={() => {
        setVisible(false);
        onActiveChange(false);
      }}
    />
  );
}

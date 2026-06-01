"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

import { useAppShellRuntime } from "./appshell.client";

function isTypingTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false;
  }

  return (
    target.isContentEditable ||
    target.tagName === "INPUT" ||
    target.tagName === "TEXTAREA" ||
    target.tagName === "SELECT"
  );
}

export const APP_SHELL_QUICK_CREATE_EVENT = "afenda:appshell-quick-create";

export function AppShellGlobalShortcuts() {
  const runtime = useAppShellRuntime();
  const router = useRouter();
  const gChordDeadlineRef = useRef<number | null>(null);

  useEffect(() => {
    function clearGChord() {
      gChordDeadlineRef.current = null;
    }

    function withinGChord() {
      const deadline = gChordDeadlineRef.current;
      return deadline !== null && Date.now() < deadline;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.defaultPrevented || event.repeat) {
        return;
      }

      if (runtime.commandOpen || isTypingTarget(event.target)) {
        return;
      }

      const key = event.key.toLowerCase();

      if ((event.metaKey || event.ctrlKey) && key === "k") {
        event.preventDefault();
        runtime.setCommandOpen(true);
        return;
      }

      if (!event.metaKey && !event.ctrlKey && !event.altKey && key === "c") {
        event.preventDefault();
        window.dispatchEvent(new CustomEvent(APP_SHELL_QUICK_CREATE_EVENT));
        return;
      }

      if (key === "g") {
        gChordDeadlineRef.current = Date.now() + 900;
        return;
      }

      if (withinGChord() && key === "h") {
        event.preventDefault();
        clearGChord();
        router.push("/dashboard");
        return;
      }

      if (withinGChord()) {
        clearGChord();
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [router, runtime]);

  return null;
}

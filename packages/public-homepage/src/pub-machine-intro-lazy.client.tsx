"use client";

import dynamic from "next/dynamic";

import type { HomepageContent } from "./pub-homepage-schema";

const MachineIntroGateDynamic = dynamic(
  () =>
    import("./pub-machine-intro-scene.client").then((module) => ({
      default: module.MachineIntroGate,
    })),
  { ssr: false },
);

export function MachineIntroLazy({
  content,
  onActiveChange,
}: {
  content: HomepageContent;
  onActiveChange: (active: boolean) => void;
}) {
  return (
    <MachineIntroGateDynamic content={content} onActiveChange={onActiveChange} />
  );
}

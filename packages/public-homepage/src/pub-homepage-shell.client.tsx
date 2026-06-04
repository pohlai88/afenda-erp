"use client";

import { useState, type ReactNode } from "react";

import type { HomepageContent } from "./pub-homepage-schema";
import { MachineIntroLazy } from "./pub-machine-intro-lazy.client";
import styles from "../styles/public-homepage.module.css";

export function HomepageShellClient({
  content,
  children,
}: {
  content: HomepageContent;
  children: ReactNode;
}) {
  const [introActive, setIntroActive] = useState(false);

  return (
    <div className={introActive ? styles.shellIntroActive : styles.shell}>
      <MachineIntroLazy content={content} onActiveChange={setIntroActive} />
      {children}
    </div>
  );
}

import type { HomepageContent } from "./pub-homepage-schema";
import { LynxPixelReveal } from "./pub-lynx-pixel-reveal.client";

export function HomepageHero({
  content,
  initialSkip = false,
}: {
  content: HomepageContent;
  initialSkip?: boolean;
}) {
  return <LynxPixelReveal content={content} initialSkip={initialSkip} />;
}

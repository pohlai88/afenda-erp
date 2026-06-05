import type { HomepageContent } from "./pub-homepage-schema";
import { LynxPixelReveal } from "./pub-lynx-pixel-reveal.client";

export function HomepageHero({ content }: { content: HomepageContent }) {
  return <LynxPixelReveal content={content} />;
}

import { homepageContent } from "./pub-homepage-content";
import { homepageContentSchema } from "./pub-homepage-schema";
import { HomepageHero } from "./pub-homepage-hero-server";
import { HomepageShellClient } from "./pub-homepage-shell.client";
import { SiteHeader } from "./pub-site-header-server";
import styles from "../styles/public-homepage.module.css";

export function HomepageShell() {
  const content = homepageContentSchema.parse(homepageContent);

  return (
    <HomepageShellClient content={content}>
      <SiteHeader content={content} />
      <main id="public-home-main" className={styles.main}>
        <HomepageHero content={content} />
      </main>
    </HomepageShellClient>
  );
}

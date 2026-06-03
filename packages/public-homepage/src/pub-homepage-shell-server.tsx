import { homepageContent } from "./pub-homepage-content";
import { homepageContentSchema } from "./pub-homepage-schema";
import { HomepageHero } from "./homepage-hero.server";
import { SiteHeader } from "./site-header.server";
import styles from "../styles/public-homepage.module.css";

export function HomepageShell() {
  const content = homepageContentSchema.parse(homepageContent);

  return (
    <div className={styles.shell}>
      <SiteHeader content={content} />
      <main className={styles.main}>
        <HomepageHero content={content} />
      </main>
    </div>
  );
}

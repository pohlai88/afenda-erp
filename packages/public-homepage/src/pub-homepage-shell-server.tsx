import { homepageContent } from "./pub-homepage-content";
import { homepageContentSchema } from "./pub-homepage-schema";
import { HomepageHero } from "./pub-homepage-hero-server";
import { SiteHeader } from "./pub-site-header-server";
import styles from "../styles/public-homepage.module.css";

export function HomepageShell({ initialSkip = false }: { initialSkip?: boolean }) {
  const content = homepageContentSchema.parse(homepageContent);

  return (
    <div className={styles.shell}>
      <SiteHeader content={content} />
      <main id="public-home-main" className={styles.main}>
        <HomepageHero content={content} initialSkip={initialSkip} />
      </main>
    </div>
  );
}

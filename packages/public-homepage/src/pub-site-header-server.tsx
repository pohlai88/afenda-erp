import type { HomepageContent } from "./pub-homepage-schema";
import styles from "../styles/public-homepage.module.css";

export function SiteHeader({ content }: { content: HomepageContent }) {
  return (
    <header className={styles.header}>
      <span className={styles.brand}>{content.title}</span>
    </header>
  );
}

import Link from "next/link";

import type { HomepageContent } from "./pub-homepage-schema";
import styles from "../styles/public-homepage.module.css";

export function SiteHeader({ content }: { content: HomepageContent }) {
  return (
    <header className={styles.header}>
      <span className={styles.brand}>Afenda</span>
      <nav className={styles.nav} aria-label="Public">
        <Link className={styles.linkPrimary} href={content.signInHref}>
          {content.signInLabel}
        </Link>
      </nav>
    </header>
  );
}

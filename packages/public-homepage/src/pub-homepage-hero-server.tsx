import Link from "next/link";

import type { HomepageContent } from "./pub-homepage-schema";
import styles from "../styles/public-homepage.module.css";

export function HomepageHero({ content }: { content: HomepageContent }) {
  return (
    <section className={styles.hero} aria-labelledby="public-home-title">
      <h1 id="public-home-title" className={styles.title}>
        {content.title}
      </h1>
      <p className={styles.lead}>{content.description}</p>
      <div className={styles.actions}>
        <Link className={styles.linkPrimary} href={content.signInHref}>
          {content.signInLabel}
        </Link>
        <Link className={styles.link} href={content.signUpHref}>
          {content.signUpLabel}
        </Link>
      </div>
    </section>
  );
}

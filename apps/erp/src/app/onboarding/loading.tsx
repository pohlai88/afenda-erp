import { onboardingLoadingCopy } from "@afenda/kernel";

import styles from "./onboarding.module.css";

export default function OnboardingLoading() {
  return (
    <main className={styles.shell}>
      <section className={styles.stage}>
        <div className={styles.stageGrid} />
        <div className={styles.stageGrain} />
        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot} />
            {onboardingLoadingCopy.title}
          </p>
          <h2 className={styles.heroTitle}>
            Setting the stage
            <span className={styles.heroTitleAccent}>for your workspace.</span>
          </h2>
          <p className={styles.heroLead}>{onboardingLoadingCopy.description}</p>
        </div>
      </section>

      <section className={styles.panel}>
        <div className={styles.panelInner}>
          <p className={styles.panelKicker}>Loading</p>
          <h1 className={styles.panelTitle}>Almost there</h1>
          <p className={styles.panelDescription}>
            Preparing the tenant bootstrap surface.
          </p>
        </div>
      </section>
    </main>
  );
}

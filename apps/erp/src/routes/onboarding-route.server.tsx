import { onboardingFormCopy } from "@afenda/kernel";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: onboardingFormCopy.title,
};

export default function OnboardingRoute() {
  return (
    <main className="neon-auth-ui-page surface-page text-foreground">
      <section className="page-shell section-stack text-center">
        <h1 className="type-section-title">{onboardingFormCopy.title}</h1>
        <p className="type-muted">
          {onboardingFormCopy.description}
        </p>
        <Link
          className="inline-flex h-9 items-center justify-center rounded-control border border-border px-surface-sm type-control hover:bg-muted"
          href="/lynx"
        >
          Continue to workspace
        </Link>
      </section>
    </main>
  );
}

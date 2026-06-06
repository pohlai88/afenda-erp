import "server-only";

import Image from "next/image";
import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { requireNeonAuthSession } from "@afenda/auth/neon-auth/server";
import { onboardingFormCopy } from "@afenda/kernel";

import styles from "@/app/onboarding/onboarding.module.css";
import { getWorkspaceExecutionContext } from "@/routes/execution-context-route.server";

type OnboardingSearchParams = {
  error?: string | string[];
  organizationName?: string | string[];
};

const MIN_ORGANIZATION_NAME_LENGTH = 3;
const ONBOARDING_BOOTSTRAP_PATH = "/api/internal/v1/onboarding/bootstrap";

export const metadata: Metadata = {
  title: onboardingFormCopy.title,
  robots: {
    index: false,
    follow: false,
  },
};

function getSingleSearchParam(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function normalizeOrganizationName(value?: string | string[]) {
  return String(getSingleSearchParam(value) ?? "")
    .trim()
    .replace(/\s+/g, " ");
}

function resolveErrorMessage(searchParams: OnboardingSearchParams) {
  const error = getSingleSearchParam(searchParams.error);

  if (error === "organization-name") {
    return "Use between three and one hundred twenty characters for the first organization name.";
  }

  if (error === "bootstrap-failed") {
    return "Workspace creation failed. Check your connection and try again.";
  }

  return null;
}

function resolveDefaultOrganizationName(searchParams: OnboardingSearchParams) {
  const organizationName = normalizeOrganizationName(searchParams.organizationName);

  if (organizationName.length >= MIN_ORGANIZATION_NAME_LENGTH) {
    return organizationName;
  }

  if (organizationName.length > 0) {
    return organizationName;
  }

  return onboardingFormCopy.defaultOrganization;
}

function buildUserMonogram(name: string, email: string) {
  const source = name.trim() || email.trim();
  const parts = source.split(/\s+/).filter(Boolean);

  if (parts.length >= 2) {
    return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
  }

  return source.slice(0, 2).toUpperCase();
}

export default async function OnboardingRoute({
  searchParams,
}: {
  searchParams?: Promise<OnboardingSearchParams>;
}) {
  const resolvedSearchParamsPromise =
    searchParams ?? Promise.resolve({} as OnboardingSearchParams);
  const [session, workspaceContext, resolvedSearchParams] = await Promise.all([
    requireNeonAuthSession(),
    getWorkspaceExecutionContext(),
    resolvedSearchParamsPromise,
  ]);

  if (workspaceContext) {
    redirect("/dashboard");
  }

  const neonUser = session.user;
  if (!neonUser) {
    redirect("/sign-in");
  }

  const errorMessage = resolveErrorMessage(resolvedSearchParams);
  const defaultOrganizationName = resolveDefaultOrganizationName(
    resolvedSearchParams,
  );
  const userMonogram = buildUserMonogram(neonUser.name, neonUser.email);
  const displayName =
    neonUser.name.trim().length > 0 ? neonUser.name.trim() : neonUser.email;

  return (
    <main className={styles.shell}>
      <section aria-hidden="false" className={styles.stage}>
        <div className={styles.stageGrid} />
        <div className={styles.stageGrain} />
        <div className={styles.stageGlow} />
        <span className={styles.verticalRail}>Tenant initialization</span>
        <span className={styles.watermark} aria-hidden="true">
          01
        </span>

        <div className={styles.heroCopy}>
          <p className={styles.heroEyebrow}>
            <span className={styles.heroEyebrowDot} />
            Authenticated
          </p>
          <h2 className={styles.heroTitle}>
            Name the command center
            <span className={styles.heroTitleAccent}>for your operations.</span>
          </h2>
          <p className={styles.heroLead}>
            Your identity is live. One workspace name stands between you and the
            protected ERP surface — no detours, no staged handoffs.
          </p>
        </div>

        <div className={styles.heroIllustration}>
          <div className={styles.heroIllustrationFrame}>
            <Image
              alt=""
              className="h-auto w-full rounded-[0.85rem]"
              height={720}
              priority
              src="/landing/erp.png"
              width={1280}
            />
          </div>
        </div>
      </section>

      <section aria-labelledby="onboarding-workspace-title" className={styles.panel}>
        <div className={styles.panelInner}>
          <p className={styles.panelKicker}>Tenant bootstrap</p>
          <h1 className={styles.panelTitle} id="onboarding-workspace-title">
            {onboardingFormCopy.title}
          </h1>
          <p className={styles.panelDescription}>{onboardingFormCopy.description}</p>

          <div className={styles.identityChip}>
            <span className={styles.identityMonogram} aria-hidden="true">
              {userMonogram}
            </span>
            <span className={styles.identityMeta}>
              <span className={styles.identityName}>{displayName}</span>
              <span className={styles.identityEmail}>{neonUser.email}</span>
            </span>
          </div>

          <form
            action={ONBOARDING_BOOTSTRAP_PATH}
            className={styles.formBlock}
            method="post"
          >
            <label className={styles.fieldLabel} htmlFor="organizationName">
              {onboardingFormCopy.organizationLabel}
            </label>
            <input
              aria-invalid={errorMessage ? true : undefined}
              className={styles.fieldInput}
              data-testid="onboarding-organization-name"
              defaultValue={defaultOrganizationName}
              id="organizationName"
              minLength={3}
              maxLength={120}
              name="organizationName"
              placeholder={onboardingFormCopy.defaultOrganization}
              required
              type="text"
            />
            {errorMessage ? (
              <p className={styles.fieldError} role="alert">
                {errorMessage}
              </p>
            ) : (
              <p className={styles.fieldHint}>
                This becomes the anchor for navigation, approvals, and audit trails.
              </p>
            )}

            <div className={styles.submitRow}>
              <a className={styles.accountLink} href="/account">
                Account settings
              </a>
              <button className={styles.submitButton} type="submit">
                {onboardingFormCopy.submitLabel}
              </button>
            </div>
          </form>

          <div className={styles.bootstrapNotes}>
            <div className={styles.bootstrapNote}>
              <span className={styles.bootstrapNoteIndex}>01</span>
              <span>
                Provision the first organization record and attach your operator as
                owner.
              </span>
            </div>
            <div className={styles.bootstrapNote}>
              <span className={styles.bootstrapNoteIndex}>02</span>
              <span>
                Seed default ERP scope so protected modules unlock immediately after
                submit.
              </span>
            </div>
            <div className={styles.bootstrapNote}>
              <span className={styles.bootstrapNoteIndex}>03</span>
              <span>Land on the dashboard once bootstrap completes.</span>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

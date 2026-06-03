"use client";

import type { ReactNode } from "react";

import { accountSettingsCopy } from "@afenda/kernel";
import { SubsectionPanel } from "@afenda/ui";

import { AuthNotice } from "../ui/auth-ui.primitives";
import { ChangePasswordForm } from "./auth.change-password-form.client";
import { UpdateProfileForm } from "./auth.update-profile-form.client";

type AccountSettingsPanelProps = {
  sessionSource: "dev" | "neon";
  initialName: string;
  email: string;
  neonAuthEnabled: boolean;
};

export function AccountSettingsPanel({
  sessionSource,
  initialName,
  email,
  neonAuthEnabled,
}: AccountSettingsPanelProps) {
  const copy = accountSettingsCopy;
  const canManageAccount = neonAuthEnabled && sessionSource === "neon";

  if (!canManageAccount) {
    const message = neonAuthEnabled
      ? copy.unavailable.devSession
      : copy.unavailable.neonDisabled;

    return (
      <section
        aria-label="Account settings unavailable"
        data-auth-surface="account-settings"
        data-auth-state="unavailable"
        data-session-source={sessionSource}
        data-neon-auth-enabled={String(neonAuthEnabled)}
      >
        <AuthNotice tone="info">{message}</AuthNotice>
      </section>
    );
  }

  return (
    <section
      aria-label="Account settings"
      data-auth-surface="account-settings"
      data-auth-state="ready"
      data-session-source={sessionSource}
      data-neon-auth-enabled="true"
      className="flex flex-col gap-surface-2xl"
    >
      <AccountIdentitySummary email={email} note={copy.emailNote} />

      <AccountSettingsSection
        title={copy.profile.title}
        description={copy.profile.description}
      >
        <UpdateProfileForm initialName={initialName} />
      </AccountSettingsSection>

      <AccountSettingsSection
        title={copy.password.title}
        description={copy.password.description}
      >
        <ChangePasswordForm />
      </AccountSettingsSection>
    </section>
  );
}

function AccountIdentitySummary({
  email,
  note,
}: {
  email: string;
  note: string;
}) {
  return (
    <div
      data-auth-component="account-identity-summary"
      className="rounded-lg border border-border bg-muted/30 px-surface-md py-surface-sm"
    >
      <p className="type-caption text-muted-foreground">
        Signed in as{" "}
        <span className="font-medium text-foreground">{email}</span>. {note}
      </p>
    </div>
  );
}

function AccountSettingsSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <SubsectionPanel title={title}>
      <div
        data-auth-component="account-settings-section"
        className="flex flex-col gap-surface-md"
      >
        <p className="type-caption max-w-2xl text-muted-foreground">
          {description}
        </p>
        {children}
      </div>
    </SubsectionPanel>
  );
}

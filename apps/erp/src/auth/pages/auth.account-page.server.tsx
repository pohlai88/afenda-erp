import "server-only";

import { accountSettingsCopy } from "@afenda/kernel";
import { Badge } from "@afenda/ui/badge";
import { SectionPanel } from "@afenda/ui";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { AccountSettingsPanel } from "../forms/auth.account-settings-panel.client";
import { isNeonAuthUiReady } from "@afenda/neon-auth/server";
import { getSession } from "@afenda/auth/server";

export const metadata: Metadata = {
  title: accountSettingsCopy.page.title,
  description: accountSettingsCopy.page.description,
};

export default async function AccountPage() {
  const session = await getSession();

  if (!session) {
    redirect("/sign-in");
  }

  const copy = accountSettingsCopy.page;
  const sessionLabel =
    session.source === "neon" ? "Neon Auth session" : "Development session";

  return (
    <div className="@container mx-auto flex w-full max-w-3xl flex-col gap-surface-3xl py-surface-2xl">
      <SectionPanel
        aside={
          <Badge variant={session.source === "neon" ? "success" : "warning"}>
            {sessionLabel}
          </Badge>
        }
        description={copy.description}
        eyebrow="Workspace identity"
        headingLevel={1}
        title={copy.title}
      >
        <AccountSettingsPanel
          email={session.email}
          initialName={session.name}
          neonAuthEnabled={isNeonAuthUiReady()}
          sessionSource={session.source}
        />
      </SectionPanel>
    </div>
  );
}

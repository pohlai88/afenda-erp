import "server-only";

import { NeonAuthUiAccountPage } from "./aut-neon-auth-ui-account-page-client";
import { NeonAuthUiPageGate } from "./aut-neon-auth-ui-page-gate-server";
import {
  neonAuthUiAccountViews,
  type NeonAuthUiAccountViewSlug,
} from "./aut-neon-auth-ui-routes-shared";

async function renderAccountView(view: NeonAuthUiAccountViewSlug) {
  return (
    <NeonAuthUiPageGate>
      <NeonAuthUiAccountPage view={view} />
    </NeonAuthUiPageGate>
  );
}

export async function NeonAuthAccountSettingsPage() {
  return renderAccountView(neonAuthUiAccountViews.settings);
}

export async function NeonAuthAccountSecurityPage() {
  return renderAccountView(neonAuthUiAccountViews.security);
}

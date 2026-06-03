import "server-only";

import { NeonAuthUiAccountPage } from "./neon-auth-ui-account-page.client";
import { NeonAuthUiPageGate } from "./neon-auth-ui-page-gate.server";
import {
  neonAuthUiAccountViews,
  type NeonAuthUiAccountViewSlug,
} from "./neon-auth-ui.routes.shared";

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

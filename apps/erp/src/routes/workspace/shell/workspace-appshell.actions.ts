"use server";

import { switchActiveOrganization } from "@afenda/auth/server";
import type { AppShellPreferenceUpdateInput } from "@afenda/appshell/server";
import { redirect } from "next/navigation";

import { writeWorkspaceAppShellPreferences } from "./workspace-appshell-preferences.server";

export async function persistWorkspaceAppShellPreferencesAction(
  input: AppShellPreferenceUpdateInput,
) {
  await writeWorkspaceAppShellPreferences(input);
}

export async function switchWorkspaceOrganizationAction(formData: FormData) {
  const organizationId = String(formData.get("organizationId") ?? "").trim();
  const returnTo = String(formData.get("returnTo") ?? "/dashboard").trim();

  if (!organizationId) {
    throw new Error("Organization id is required.");
  }

  await switchActiveOrganization(organizationId);
  redirect(returnTo || "/dashboard");
}

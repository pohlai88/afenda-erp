import { cookies } from "next/headers";

import {
  parseAppShellPreferenceSnapshot,
  parseAppShellPreferenceUpdate,
  type AppShellPreferenceSnapshot,
  type AppShellPreferenceUpdateInput,
} from "@afenda/appshell/server";

const workspaceAppShellPreferenceCookie = "afenda_workspace_appshell";

export function getDefaultWorkspaceAppShellPreferences(): AppShellPreferenceSnapshot {
  return parseAppShellPreferenceSnapshot({
    railMode: "expanded",
    density: "comfortable",
    utilityOrder: [],
    commandRecents: [],
  });
}

export async function readWorkspaceAppShellPreferences() {
  const cookieStore = await cookies();
  const value = cookieStore.get(workspaceAppShellPreferenceCookie)?.value;

  if (!value) {
    return getDefaultWorkspaceAppShellPreferences();
  }

  try {
    return parseAppShellPreferenceSnapshot(JSON.parse(value));
  } catch {
    return getDefaultWorkspaceAppShellPreferences();
  }
}

export async function writeWorkspaceAppShellPreferences(
  input: AppShellPreferenceUpdateInput,
) {
  const cookieStore = await cookies();
  const current = await readWorkspaceAppShellPreferences();
  const next = parseAppShellPreferenceSnapshot({
    ...current,
    ...parseAppShellPreferenceUpdate(input),
  });

  cookieStore.set(workspaceAppShellPreferenceCookie, JSON.stringify(next), {
    httpOnly: true,
    sameSite: "lax",
    secure:
      process.env.NODE_ENV === "production" &&
      process.env.AFENDA_E2E_DEV_AUTH !== "1",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });

  return next;
}

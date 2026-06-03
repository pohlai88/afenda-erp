import type { NeonAuthUIProviderProps } from "@neondatabase/auth-ui";
import type { NeonAuthAdapter } from "@neondatabase/auth";

import { erpPreLoginPostAuthPath } from "../contracts/paths.shared";

/** OAuth providers enabled in Neon console for the active branch (MCP-validated: google). */
export const neonAuthUiSocialProviders = ["google"] as const satisfies ReadonlyArray<
  "google" | "github" | "vercel"
>;

export type NeonAuthUiSocialProvider = (typeof neonAuthUiSocialProviders)[number];

type NeonAuthUiProviderOptions = Omit<
  NeonAuthUIProviderProps<NeonAuthAdapter>,
  "authClient" | "children" | "navigate" | "Link"
>;

/** Default Neon Auth UI provider props — production branch, shared Neon email, Google OAuth only. Phone OTP off. */
export function resolveNeonAuthUiProviderOptions(
  overrides?: Partial<NeonAuthUiProviderOptions>,
): NeonAuthUiProviderOptions {
  return {
    redirectTo: erpPreLoginPostAuthPath,
    social: {
      providers: [...neonAuthUiSocialProviders],
    },
    credentials: {
      forgotPassword: true,
    },
    magicLink: true,
    ...overrides,
  };
}

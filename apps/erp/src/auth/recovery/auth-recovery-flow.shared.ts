export type AuthRecoveryStep = "request" | "reset";

export const AUTH_RECOVERY_SURFACE = "forgot-password" as const;
export const AUTH_RECOVERY_PROVIDER = "neon" as const;

export function resolveInitialRecoveryStep(
  initialEmail: string,
): AuthRecoveryStep {
  return initialEmail.trim() ? "reset" : "request";
}

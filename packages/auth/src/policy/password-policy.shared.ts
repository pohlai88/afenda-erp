export const AUTH_PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 128,
  requireUppercase: true,
  requireLowercase: true,
  requireNumber: true,
  requireSymbol: true,
} as const;

export type AuthPasswordRequirementKey =
  | "minLength"
  | "maxLength"
  | "uppercase"
  | "lowercase"
  | "number"
  | "symbol";

export type AuthPasswordRequirementResult = {
  key: AuthPasswordRequirementKey;
  label: string;
  met: boolean;
};

export function evaluatePasswordPolicy(
  password: string,
): AuthPasswordRequirementResult[] {
  return [
    {
      key: "minLength",
      label: `At least ${AUTH_PASSWORD_POLICY.minLength} characters`,
      met: password.length >= AUTH_PASSWORD_POLICY.minLength,
    },
    {
      key: "maxLength",
      label: `No more than ${AUTH_PASSWORD_POLICY.maxLength} characters`,
      met: password.length <= AUTH_PASSWORD_POLICY.maxLength,
    },
    {
      key: "uppercase",
      label: "One uppercase letter",
      met: !AUTH_PASSWORD_POLICY.requireUppercase || /[A-Z]/.test(password),
    },
    {
      key: "lowercase",
      label: "One lowercase letter",
      met: !AUTH_PASSWORD_POLICY.requireLowercase || /[a-z]/.test(password),
    },
    {
      key: "number",
      label: "One number",
      met: !AUTH_PASSWORD_POLICY.requireNumber || /\d/.test(password),
    },
    {
      key: "symbol",
      label: "One symbol",
      met:
        !AUTH_PASSWORD_POLICY.requireSymbol || /[^A-Za-z0-9\s]/.test(password),
    },
  ];
}

export function isPasswordPolicySatisfied(password: string): boolean {
  return evaluatePasswordPolicy(password).every(
    (requirement) => requirement.met,
  );
}

export function getPasswordPolicyFailureMessage(
  password: string,
): string | null {
  const unmet = evaluatePasswordPolicy(password).find(
    (requirement) => !requirement.met,
  );

  return unmet ? "Password does not meet the enterprise policy." : null;
}

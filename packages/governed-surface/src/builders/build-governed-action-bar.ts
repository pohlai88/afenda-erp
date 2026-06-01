export type GovernedActionTone = "primary" | "secondary" | "danger" | "ghost";

export type GovernedActionDescriptor = {
  actionId: string;
  label: string;
  tone?: GovernedActionTone;
  requiredPermission?: string;
  disabledReason?: string;
  confirm?: {
    title: string;
    description?: string;
  };
};

export type GovernedActionBarConfiguration = {
  primary?: GovernedActionDescriptor;
  secondary?: readonly GovernedActionDescriptor[];
  overflow?: readonly GovernedActionDescriptor[];
};

export function buildGovernedActionBar(
  input: GovernedActionBarConfiguration,
): GovernedActionBarConfiguration {
  return {
    ...(input.primary ? { primary: input.primary } : {}),
    ...(input.secondary?.length ? { secondary: input.secondary } : {}),
    ...(input.overflow?.length ? { overflow: input.overflow } : {}),
  };
}

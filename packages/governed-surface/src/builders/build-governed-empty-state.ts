export type GovernedEmptyStateKind =
  | "no-data"
  | "no-results"
  | "not-configured"
  | "access-denied"
  | "error";

export type GovernedEmptyStateAction = {
  actionId: string;
  label: string;
};

export type GovernedEmptyStateConfiguration = {
  kind: GovernedEmptyStateKind;
  title: string;
  description?: string;
  action?: GovernedEmptyStateAction;
};

export function buildGovernedEmptyState(
  input: GovernedEmptyStateConfiguration,
): GovernedEmptyStateConfiguration {
  return {
    kind: input.kind,
    title: input.title,
    ...(input.description ? { description: input.description } : {}),
    ...(input.action ? { action: input.action } : {}),
  };
}

import { buildGovernedActionBar, type GovernedActionBarConfiguration } from "./build-governed-action-bar";

export type GovernedExceptionSeverity = "low" | "medium" | "high" | "critical";

export type GovernedExceptionItem = {
  id: string;
  title: string;
  description?: string;
  severity: GovernedExceptionSeverity;
  ownerLabel?: string;
  dueAt?: string;
  sourceRef?: string;
};

export type GovernedExceptionSurfaceConfiguration = {
  title: string;
  items: readonly GovernedExceptionItem[];
  actions?: GovernedActionBarConfiguration;
};

export function buildGovernedExceptionSurface(
  input: GovernedExceptionSurfaceConfiguration,
): GovernedExceptionSurfaceConfiguration {
  return {
    title: input.title,
    items: input.items,
    ...(input.actions ? { actions: buildGovernedActionBar(input.actions) } : {}),
  };
}

import type { EmptyState } from "./gov-list-surface-schema";

export type GovernedEmptyVariant = EmptyState["variant"];

export type GovernedEmptyBuilderInput = {
  title: string;
  description?: string;
  cta?: EmptyState["cta"];
};

function cleanText(value: string | undefined): string | undefined {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : undefined;
}

export function buildGovernedEmptyState(
  variant: GovernedEmptyVariant,
  input: GovernedEmptyBuilderInput,
): EmptyState {
  return {
    variant,
    title: cleanText(input.title) ?? "Unavailable",
    ...(cleanText(input.description)
      ? { description: cleanText(input.description) }
      : {}),
    ...(input.cta ? { cta: input.cta } : {}),
  };
}

export function buildForbiddenEmpty(
  input: Partial<GovernedEmptyBuilderInput> = {},
): EmptyState {
  return buildGovernedEmptyState("forbidden", {
    title: input.title ?? "Access restricted",
    description:
      input.description ??
      "You do not have permission to view this governed surface.",
    cta: input.cta,
  });
}

export function buildInvalidConfigEmpty(
  input: Partial<GovernedEmptyBuilderInput> = {},
): EmptyState {
  return buildGovernedEmptyState("error", {
    title: input.title ?? "Configuration unavailable",
    description:
      input.description ??
      "This governed surface could not be rendered because its metadata failed validation.",
    cta: input.cta,
  });
}

export function buildLoadErrorEmpty(
  input: Partial<GovernedEmptyBuilderInput> = {},
): EmptyState {
  return buildGovernedEmptyState("error", {
    title: input.title ?? "Unable to load data",
    description:
      input.description ??
      "The governed surface could not load its source data. Try again or contact an administrator.",
    cta: input.cta,
  });
}

export function buildNoDataEmpty(
  input: Partial<GovernedEmptyBuilderInput> = {},
): EmptyState {
  return buildGovernedEmptyState("muted", {
    title: input.title ?? "No records found",
    description: input.description ?? "There is no governed data to show yet.",
    cta: input.cta,
  });
}

export function buildCtaEmpty(input: GovernedEmptyBuilderInput): EmptyState {
  return buildGovernedEmptyState("cta", input);
}

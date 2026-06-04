import "server-only";

import { logUnexpectedServerError } from "./gov-governed-logging-server";
import { getGovernedSurfaceTranslations } from "./gov-governed-surface-copy";
import type { EmptyState } from "./gov-list-surface-schema";
import type { GovernedSurfaceSectionCardBody } from "./gov-governed-surface-section-card";

export type GovernedPatternEmptyState = EmptyState & { emptyId?: string };

type ParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: unknown };

export type ResolveMetadataSectionBodyInput<T> = {
  loadError?: GovernedPatternEmptyState;
  forbiddenPreset?: GovernedPatternEmptyState;
  parentAccessAllowed?: boolean;
  parse: () => ParseResult<T>;
  parseErrorLabel: string;
  parseContext: Record<string, string>;
  emptyStateIds: {
    loadError: string;
    invalid: string;
    forbidden: string;
  };
  invalid?: GovernedPatternEmptyState;
  forbidden?: GovernedPatternEmptyState;
  resolvePermission?: (data: T) => Promise<boolean>;
  buildReadyBody: (data: T) => GovernedSurfaceSectionCardBody;
};

export async function resolveMetadataSectionBody<T>(
  input: ResolveMetadataSectionBodyInput<T>,
): Promise<GovernedSurfaceSectionCardBody> {
  const t = await getGovernedSurfaceTranslations("Erp");

  if (input.loadError) {
    return {
      state: "invalid",
      model: {
        ...input.loadError,
        emptyId: input.loadError.emptyId ?? input.emptyStateIds.loadError,
      },
    };
  }

  if (input.forbiddenPreset) {
    return {
      state: "forbidden",
      model: input.forbiddenPreset,
    };
  }

  if (input.parentAccessAllowed === false) {
    return {
      state: "forbidden",
      model: {
        variant: "forbidden",
        title: input.forbidden?.title ?? t("GovernedSurface.forbiddenTitle"),
        description:
          input.forbidden?.description ??
          t("GovernedSurface.forbiddenDescription"),
        emptyId: input.forbidden?.emptyId ?? input.emptyStateIds.forbidden,
      },
    };
  }

  const parsed = input.parse();

  if (!parsed.success) {
    logUnexpectedServerError(
      input.parseErrorLabel,
      parsed.error,
      input.parseContext,
    );

    return {
      state: "invalid",
      model: {
        variant: "error",
        title: input.invalid?.title ?? t("GovernedSurface.invalidConfigTitle"),
        description:
          input.invalid?.description ??
          t("GovernedSurface.invalidConfigDescription"),
        emptyId: input.invalid?.emptyId ?? input.emptyStateIds.invalid,
      },
    };
  }

  if (input.resolvePermission) {
    const allowed = await input.resolvePermission(parsed.data);
    if (!allowed) {
      return {
        state: "forbidden",
        model: {
          variant: "forbidden",
          title: input.forbidden?.title ?? t("GovernedSurface.forbiddenTitle"),
          description:
            input.forbidden?.description ??
            t("GovernedSurface.forbiddenDescription"),
          emptyId: input.forbidden?.emptyId ?? input.emptyStateIds.forbidden,
        },
      };
    }
  }

  return input.buildReadyBody(parsed.data);
}

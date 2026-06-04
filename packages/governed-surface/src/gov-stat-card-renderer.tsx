import { Card, CardContent } from "@afenda/ui/card";
import { GovernedEmpty } from "./gov-governed-empty";
import {
  parseStatCardConfiguration,
  type StatCardDensity,
  type StatCardItem,
} from "./gov-stat-card-schema";
import {
  governedParseErrorCopy,
  governedRendererCopy,
} from "./gov-governed-renderer-copy-shared";
import { GOVERNED_STAT_GRID_CLASS } from "./stat-card-layout.shared";
import { diagnosticsDataAttributes } from "./gov-governed-diagnostics-shared";
import {
  governedIdentityAttributes,
  governedTestId,
} from "./gov-governed-identity-shared";

import type { GovernedComponentRendererDiagnostics } from "./gov-registry";
import { StatCardBody } from "./gov-stat-card-body-client";

export type StatCardRendererProps = {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
  surfaceKey?: string;
  sectionKey?: string;
  componentKey?: string;
};

export function StatCardRenderer({
  configuration,
  diagnostics = "user",
  surfaceKey,
  sectionKey,
  componentKey,
}: StatCardRendererProps) {
  const parsed = parseStatCardConfiguration(configuration);

  if (!parsed.success) {
    const copy = governedParseErrorCopy(diagnostics, "statCard");
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: copy.title,
          description: copy.description,
        }}
      />
    );
  }

  const { stats, density } = parsed.data;
  const resolvedComponentKey =
    componentKey ?? sectionKey ?? surfaceKey ?? "stat-card";

  if (stats.length === 0) {
    return (
      <GovernedEmpty
        model={{
          variant: "muted",
          title: governedRendererCopy.empty.statCard.title,
          description: governedRendererCopy.empty.statCard.description,
        }}
      />
    );
  }

  return (
    <section
      aria-label="Statistics"
      className="@container"
      {...governedIdentityAttributes({
        surfaceKey,
        sectionKey,
        componentKey: resolvedComponentKey,
      })}
      {...diagnosticsDataAttributes({
        state: "ready",
        testId: governedTestId("stat-card", resolvedComponentKey),
      })}
    >
      <div className={GOVERNED_STAT_GRID_CLASS[density]}>
        {stats.map((stat) => (
          <StatTile
            key={stat.label}
            stat={stat}
            density={density}
          />
        ))}
      </div>
    </section>
  );
}

function StatTile({
  stat,
  density,
}: {
  stat: StatCardItem;
  density: StatCardDensity;
}) {
  return (
    <Card className="@container/tile overflow-hidden border-border shadow-elevation-1 transition-shadow hover:shadow-elevation-2">
      <CardContent className="p-0">
        <StatCardBody stat={stat} density={density} />
      </CardContent>
    </Card>
  );
}

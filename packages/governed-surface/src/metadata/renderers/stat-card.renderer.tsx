import { Card, CardContent } from "@afenda/ui/card";
import { GovernedEmpty } from "../../client";
import {
  parseStatCardConfiguration,
  type StatCardDensity,
  type StatCardItem,
} from "../../schemas/stat-card.schema";
import {
  governedParseErrorCopy,
  governedRendererCopy,
} from "../../i18n/governed-renderer-copy.shared";
import { GOVERNED_STAT_GRID_CLASS } from "../../stat-card-layout.shared";

import type { GovernedComponentRendererDiagnostics } from "../registry";
import { StatCardBody } from "./stat-card-body.client";

export type StatCardRendererProps = {
  configuration: unknown;
  diagnostics?: GovernedComponentRendererDiagnostics;
};

export function StatCardRenderer({
  configuration,
  diagnostics = "user",
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
    <section aria-label="Statistics" className="@container">
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

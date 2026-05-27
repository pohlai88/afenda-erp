import { Card, CardContent } from "@afenda/ui/card";
import { GovernedEmpty } from "../../client";
import {
  parseStatCardConfiguration,
  type StatCardDensity,
  type StatCardItem,
} from "../../schemas/stat-card.schema";

import type { GovernedComponentRendererDiagnostics } from "../registry";
import { StatCardBody } from "./stat-card-body.client";

const GRID_DENSITY_CLASS: Record<StatCardDensity, string> = {
  comfortable: "grid grid-cols-1 gap-3 @sm:grid-cols-2 @2xl:grid-cols-4",
  compact: "grid grid-cols-1 gap-2 @sm:grid-cols-2",
};

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
    return (
      <GovernedEmpty
        model={{
          variant: "error",
          title: "Card unavailable",
          description:
            diagnostics === "operator"
              ? "The stat card configuration failed validation."
              : "This card could not be loaded safely.",
        }}
      />
    );
  }

  const { stats, density } = parsed.data;

  return (
    <section aria-label="Statistics" className="@container">
      <div className={GRID_DENSITY_CLASS[density]}>
        {stats.map((stat, index) => (
          <StatTile
            key={`${index}-${stat.label}`}
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
    <Card className="@container/tile overflow-hidden">
      <CardContent className="p-0">
        <StatCardBody stat={stat} density={density} />
      </CardContent>
    </Card>
  );
}

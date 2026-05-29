import { listHrPositionCatalog } from "../data/hr-positions.query.server";
import { GovernedPatternCListSection } from "@afenda/governed-surface/server";
import {
  buildGovernedListSurface,
  GOVERNED_METADATA_SCHEMA_VERSION,
} from "@afenda/governed-surface";
import { formatErpDateTime } from "@afenda/kernel";

export const hrPositionsSurfaceKey = "hr.workforce.positions.list";

export async function HrPositionsSection({
  organizationId,
}: {
  organizationId: string;
}) {
  const positions = await listHrPositionCatalog({
    organizationId,
    limit: 100,
  });

  const listConfiguration = buildGovernedListSurface({
    __schemaVersion: GOVERNED_METADATA_SCHEMA_VERSION,
    dataNature: "table",
    presentationProfile: "erp-operational-table",
    requiresErpPermission: {
      module: "hr",
      object: "positions",
      function: "read",
    },
    pagination: {
      pageSize: positions.length || 1,
      totalCount: positions.length,
      hasNextPage: false,
    },
    surface: {
      header: {
        title: "Position catalog",
        description: "Roles linked to departments.",
      },
      columnsId: "hr-workforce-positions",
      rowKey: "id",
      empty: {
        variant: "muted",
        title: "No positions",
        description: "Run the HR workforce seed to load demo positions.",
      },
    },
    columns: [
      { id: "title", header: "Title", priority: "primary", pin: "start", minWidth: 180 },
      { id: "code", header: "Code", minWidth: 100 },
      { id: "department", header: "Department", minWidth: 160 },
      { id: "status", header: "Status", minWidth: 100 },
      { id: "updatedAt", header: "Updated", minWidth: 180 },
    ],
    rows: positions.map((position) => ({
      id: position.id,
      cells: {
        title: position.title,
        code: position.code,
        department: position.departmentName,
        status: position.positionStatus,
        updatedAt: formatErpDateTime(position.updatedAt),
      },
    })),
  });

  return (
    <GovernedPatternCListSection
      title="Positions"
      description="Bounded catalog window from hr_positions."
      surfaceKey={hrPositionsSurfaceKey}
      listConfiguration={listConfiguration}
      parentAccessAllowed
      layout="embedded"
    />
  );
}

"use client";

import type { ReactNode } from "react";

import type { HrOrgChartNode } from "@afenda/db";
import { SectionPanel } from "@afenda/ui";

import { hrOrgUiCopy } from "../surface/hr.workforce.org-ui.copy.shared";
import { formatOrgEnumLabel } from "../surface/hr.workforce.org-list.shared";

function buildOrgChartTree(nodes: readonly HrOrgChartNode[]) {
  const byParent = new Map<string | null, HrOrgChartNode[]>();
  for (const node of nodes) {
    const key = node.parentDepartmentId;
    const bucket = byParent.get(key) ?? [];
    bucket.push(node);
    byParent.set(key, bucket);
  }

  function renderBranch(parentId: string | null, depth: number): ReactNode {
    const children = byParent.get(parentId) ?? [];
    if (children.length === 0) return null;

    return (
      <ul className="list-none space-y-2" style={{ paddingLeft: depth * 16 }}>
        {children.map((node) => (
          <li key={node.id} className="rounded-section border px-3 py-2">
            <div className="type-control">{node.name}</div>
            <div className="type-caption">
              {node.code} · {formatOrgEnumLabel(node.unitType)} ·{" "}
              {formatOrgEnumLabel(node.orgUnitStatus)}
              {node.managerDisplayName ? ` · ${node.managerDisplayName}` : ""}
            </div>
            {renderBranch(node.id, depth + 1)}
          </li>
        ))}
      </ul>
    );
  }

  return renderBranch(null, 0);
}

export function HrOrgChartTreePanel({
  nodes,
}: {
  nodes: readonly HrOrgChartNode[];
}) {
  const copy = hrOrgUiCopy.orgChart;

  return (
    <SectionPanel
      headingLevel={2}
      title={copy.title}
      description={copy.description}
    >
      {nodes.length === 0 ? (
        <p className="type-muted">{copy.emptyDescription}</p>
      ) : (
        buildOrgChartTree(nodes)
      )}
    </SectionPanel>
  );
}

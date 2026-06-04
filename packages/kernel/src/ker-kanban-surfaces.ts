import type { ModuleId } from "@afenda/config/module-ids";
import type { GovernedKanbanBoardConfigurationInput } from "./ker-governed-surface-contract";

// ─── Work-item kanban board ───────────────────────────────────────────────────

const WORK_ITEM_COLUMNS: Array<{
  id: string;
  label: string;
  badgeTone?: "default" | "positive" | "attention" | "critical";
}> = [
  { id: "pending", label: "Pending" },
  { id: "in-review", label: "In Review" },
  { id: "escalated", label: "Escalated", badgeTone: "attention" },
  { id: "scheduled", label: "Scheduled" },
  { id: "completed", label: "Completed", badgeTone: "positive" },
];

const WORK_ITEM_COLUMN_IDS = new Set(WORK_ITEM_COLUMNS.map((c) => c.id));

type WorkItemKanbanRow = {
  id: string;
  subject: string;
  status: string;
  priority: string;
  owner: string;
};

function resolvePriorityBadgeTone(
  priority: string,
): "default" | "positive" | "attention" | "critical" | undefined {
  if (priority === "high") return "attention";
  if (priority === "low") return "positive";
  return undefined;
}

/**
 * Builds a read-only kanban board configuration for module work items,
 * bucketed by status column. Unknown statuses fall into "pending".
 */
export function buildModuleWorkItemKanbanSurface(input: {
  moduleId: ModuleId;
  workItems: readonly WorkItemKanbanRow[];
}): GovernedKanbanBoardConfigurationInput {
  return {
    dataNature: "kanban",
    interactionMode: "read-only",
    requiresErpPermission: {
      module: input.moduleId,
      object: "work-items",
      function: "read",
    },
    copy: {
      boardAriaLabel: `${input.moduleId} work item board`,
      emptyColumn: "No items in this stage.",
    },
    columns: WORK_ITEM_COLUMNS,
    cards: input.workItems.map((item) => ({
      id: item.id,
      columnId: WORK_ITEM_COLUMN_IDS.has(item.status) ? item.status : "pending",
      title: item.subject,
      subtitle: item.owner,
      tone: resolvePriorityBadgeTone(item.priority),
      badges: item.priority !== "medium" ? [item.priority] : undefined,
    })),
  };
}

export function getModuleWorkItemKanbanSurfaceKey(moduleId: ModuleId) {
  return `${moduleId}.work-items.kanban`;
}

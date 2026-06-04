import type { SyncOrgResult } from "./knowledge.sync.server";
import { syncOrgKnowledge } from "./knowledge.sync.server";

/**
 * Domain entry for org-wide knowledge source sync.
 * Adapters stay pure; all writes flow through pipeline-commit.
 */
export async function syncOrgKnowledgeDomain(
  organizationId: string,
): Promise<SyncOrgResult> {
  return syncOrgKnowledge(organizationId);
}

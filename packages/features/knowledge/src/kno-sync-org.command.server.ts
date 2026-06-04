import { syncOrgKnowledgeDomain } from "../domain/knowledge.sync-org.domain.server";
import type { SyncOrgResult } from "./knowledge.sync.server";

/** Command: sync all enabled knowledge sources for one organization. */
export async function executeKnowledgeSyncOrgCommand(input: {
  organizationId: string;
}): Promise<SyncOrgResult> {
  return syncOrgKnowledgeDomain(input.organizationId);
}

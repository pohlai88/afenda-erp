import type { KnowledgeSourceKind } from "./kno-core.contract";
import type { KnowledgeSourceAdapter } from "./kno-source-adapter.contract";
import type { KnowledgeGitHubRepoSourceConfig } from "./kno-source-github-repo.schema";
import type { KnowledgeManualSourceConfig } from "./kno-source-manual.schema";
import { githubRepoSourceAdapter } from "./kno-source-github-repo.server";
import { manualSourceAdapter } from "./kno-source-manual.server";

type RegisteredKnowledgeSourceAdapter =
  | KnowledgeSourceAdapter<KnowledgeManualSourceConfig>
  | KnowledgeSourceAdapter<KnowledgeGitHubRepoSourceConfig>;

const registry = new Map<
  KnowledgeSourceKind,
  RegisteredKnowledgeSourceAdapter
>();

registry.set("manual", manualSourceAdapter);
registry.set("github_repo", githubRepoSourceAdapter);

export function getKnowledgeSourceAdapter(
  kind: KnowledgeSourceKind,
): RegisteredKnowledgeSourceAdapter | undefined {
  return registry.get(kind);
}

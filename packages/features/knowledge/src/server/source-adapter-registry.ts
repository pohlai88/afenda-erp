import type { KnowledgeSourceKind } from "../constants";
import type { KnowledgeSourceAdapter } from "./source-adapter";
import { githubRepoSourceAdapter } from "./source-github-repo";
import { manualSourceAdapter } from "./source-manual";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry = new Map<string, KnowledgeSourceAdapter<any>>([
  ["manual", manualSourceAdapter],
  ["github_repo", githubRepoSourceAdapter],
]);

export function getKnowledgeSourceAdapter(
  kind: KnowledgeSourceKind,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): KnowledgeSourceAdapter<any> | undefined {
  return registry.get(kind);
}

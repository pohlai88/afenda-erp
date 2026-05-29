import { KnowledgeAdminRoutePage } from "@/workspace-routes/knowledge-route";
import type { WorkspaceRouteInstant } from "@/workspace-routes/workspace-route-instant";
import type { Metadata } from "next";

export const unstable_instant = {
  prefetch: "static",
} as const satisfies WorkspaceRouteInstant;

export const metadata: Metadata = {
  title: "Knowledge — Admin",
  description: "Manage knowledge sources, chunks, and retrieval settings.",
};

export default function KnowledgePage() {
  return <KnowledgeAdminRoutePage />;
}

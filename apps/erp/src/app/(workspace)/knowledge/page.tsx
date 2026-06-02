import { KnowledgeAdminRoutePage } from "@/routes/workspace/knowledge/knowledge-route";
import type { Metadata } from "next";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

export const metadata: Metadata = {
  title: "Knowledge — Admin",
  description: "Manage knowledge sources, chunks, and retrieval settings.",
};

export default function KnowledgePage() {
  return <KnowledgeAdminRoutePage />;
}

export const assistantPromptDefinitions = [
  {
    id: "workflow-summary",
    label: "Summarize workflow queue",
    prompt:
      "Summarize the current workflow queue, escalations, and high-priority items across my accessible modules.",
  },
  {
    id: "approval-risk",
    label: "Review approval risk",
    prompt:
      "Review approval bottlenecks, escalations, and missing owner checks. Recommend the next human-approved action.",
  },
  {
    id: "extraction-review",
    label: "Guide extraction review",
    prompt:
      "Explain how to review uploaded documents, validate extracted fields, and prepare a human-approved correction proposal.",
  },
  {
    id: "module-pressure",
    label: "Assess module pressure",
    prompt:
      "Identify which operational modules show the highest pressure from records, workflow items, and documents under my role.",
  },
] as const;

export type AssistantPromptDefinition =
  (typeof assistantPromptDefinitions)[number];

export function getAssistantPromptDefinitions() {
  return assistantPromptDefinitions;
}

export function getAssistantEmptyStateHint() {
  return assistantPromptDefinitions
    .map((prompt) => prompt.label.toLowerCase())
    .join(", ");
}

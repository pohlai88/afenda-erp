export const approvalsUiCopy = {
  queue: {
    title: "Operator approval queue",
    description:
      "Pending approval work items assigned to this tenant. Approve or reject when you hold approvals.decide.",
    columns: {
      subject: "Work item",
      owner: "Owner",
      status: "Status",
      priority: "Priority",
      due: "Due",
      route: "Route",
      escalation: "Escalation",
    },
    actionsHeader: "Decision",
    approveActionLabel: "Approve",
    rejectActionLabel: "Reject",
    openActionLabel: "Open",
    emptyTitle: "No approval work items",
    emptyDescription: "Pending approvals will appear here when routed to this queue.",
    emptyDescriptionReadOnly:
      "You can view the queue but cannot record decisions without approvals.decide.",
  },
} as const;

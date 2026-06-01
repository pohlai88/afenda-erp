export type ApprovalQueueListRow = {
  id: string;
  subject: string;
  owner: string;
  status: string;
  priority: string;
  dueAt: string;
  route: string;
  escalated: boolean;
  sourceRecordHref: `/${string}` | null;
  decisionComplete: boolean;
};

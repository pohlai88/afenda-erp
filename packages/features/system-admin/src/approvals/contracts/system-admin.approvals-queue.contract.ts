export type SystemAdminApprovalQueueListRow = {
  id: string;
  subject: string;
  owner: string;
  status: string;
  priority: string;
  due: string;
  dueAt: string;
  route: string;
  escalated: boolean;
  sourceRecordHref: `/${string}` | null;
  decisionComplete: boolean;
};

export type LynxOperatorCheckpointTool = {
  id: string;
  access: "read" | "write";
  risk: "low" | "medium" | "high";
  requiresApproval: boolean;
};

export type LynxOperatorCheckpoint = {
  version: 1;
  checkpointId: string;
  runId: string;
  workflowId: string;
  workflowSessionId: string;
  stage: "before-tool-loop";
  createdAt: string;
  tools: LynxOperatorCheckpointTool[];
};

export function createLynxOperatorCheckpoint(input: {
  runId: string;
  workflowId: string;
  workflowSessionId: string;
  tools: readonly LynxOperatorCheckpointTool[];
}): LynxOperatorCheckpoint {
  return {
    version: 1,
    checkpointId: crypto.randomUUID(),
    runId: input.runId,
    workflowId: input.workflowId,
    workflowSessionId: input.workflowSessionId,
    stage: "before-tool-loop",
    createdAt: new Date().toISOString(),
    tools: [...input.tools],
  };
}

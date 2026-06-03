import type {
  LynxRecoveryPlaybookOutput,
  SolutionProviderRun,
} from "../schemas/lynx.solution-provider.schema";

export type LynxSolutionRunComponentData = {
  run: SolutionProviderRun;
  playbook: LynxRecoveryPlaybookOutput;
  organizationId: string;
  workflowId: string;
  generatedAt: string;
};

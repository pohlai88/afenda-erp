import "server-only";
import { MetadataUiPrimitiveTimeline } from "../../primitives/timeline.server";
import {
  parseMetadataUiApprovalTimeline,
  type MetadataUiApprovalTimelineInput,
} from "../../schemas/approval-timeline.schema";
import { MetadataUiEmptyState } from "../../shell/empty-state.server";

export type MetadataUiApprovalTimelineRendererProps = Readonly<{
  metadata: MetadataUiApprovalTimelineInput;
}>;

export function MetadataUiApprovalTimelineRenderer({
  metadata,
}: MetadataUiApprovalTimelineRendererProps) {
  const timeline = parseMetadataUiApprovalTimeline(metadata);

  if (timeline.steps.length === 0) {
    return (
      <MetadataUiEmptyState
        title="No approval steps recorded"
        description="Steps appear here when an approval flow is active for this record."
      />
    );
  }

  return <MetadataUiPrimitiveTimeline timeline={timeline} />;
}

export default MetadataUiApprovalTimelineRenderer;

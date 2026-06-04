import "server-only";

import type { ReactNode } from "react";

import {
  parseMetadataUiApprovalTimeline,
  type MetadataUiApprovalTimelineInput,
} from "../../schemas/approval-timeline.schema";
import { MetadataUiSectionShell } from "../../shell/section-shell.server";
import { MetadataUiApprovalTimelineRenderer } from "./approval-timeline-renderer.server";

export type MetadataUiApprovalTimelineSectionProps = Readonly<{
  metadata: MetadataUiApprovalTimelineInput;
  children?: ReactNode;
}>;

export function MetadataUiApprovalTimelineSection({
  metadata,
  children,
}: MetadataUiApprovalTimelineSectionProps) {
  const timeline = parseMetadataUiApprovalTimeline(metadata);

  return (
    <MetadataUiSectionShell
      id={timeline.key}
      sectionKind="approval-timeline"
      title={timeline.title}
      description={timeline.description}
      presentation={timeline.presentation}
      diagnostics={timeline.diagnostics}
    >
      {children ?? <MetadataUiApprovalTimelineRenderer metadata={timeline} />}
    </MetadataUiSectionShell>
  );
}

export default MetadataUiApprovalTimelineSection;

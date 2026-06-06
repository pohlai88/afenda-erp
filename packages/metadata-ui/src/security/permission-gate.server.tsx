import "server-only";

import type { ReactNode } from "react";

import type {
  MetadataUiPermissionContract,
  MetadataUiPermissionContractInput,
} from "../contracts/permission.contract";
import {
  resolveMetadataUiPermission,
  type MetadataUiPermissionResolution,
  type MetadataUiPermissionSubject,
} from "./permission-resolver.server";
import { MetadataUiPrimitiveEmptyState } from "../primitives/empty.server";

export type MetadataUiPermissionRenderNode =
  | ReactNode
  | ((resolution: MetadataUiPermissionResolution) => ReactNode);

export type MetadataUiPermissionGateProps = Readonly<{
  permission?: MetadataUiPermissionContractInput | MetadataUiPermissionContract;
  subject?: MetadataUiPermissionSubject;
  children: MetadataUiPermissionRenderNode;
  fallback?: MetadataUiPermissionRenderNode;
}>;

function renderMetadataUiPermissionNode(
  node: MetadataUiPermissionRenderNode | undefined,
  resolution: MetadataUiPermissionResolution,
): ReactNode {
  return typeof node === "function" ? node(resolution) : node;
}

function MetadataUiPermissionFallback({
  resolution,
}: Readonly<{
  resolution: MetadataUiPermissionResolution;
}>) {
  if (resolution.visibility === "hidden") {
    return null;
  }

  const title = resolution.failure.title ?? "Access unavailable";
  const description =
    resolution.failure.description ??
    "Access is not available for this metadata surface.";

  return (
    <div
      data-metadata-ui-permission-state={resolution.state}
      data-metadata-ui-permission-visibility={resolution.visibility}
      aria-disabled={resolution.visibility === "disabled" ? true : undefined}
    >
      <MetadataUiPrimitiveEmptyState
        kind="forbidden"
        tone="warning"
        title={title}
        description={description}
      />
    </div>
  );
}

export function MetadataUiPermissionGate({
  permission,
  subject = {},
  children,
  fallback,
}: MetadataUiPermissionGateProps) {
  const resolution = resolveMetadataUiPermission(permission, subject);

  if (resolution.allowed) {
    return renderMetadataUiPermissionNode(children, resolution);
  }

  const fallbackNode = renderMetadataUiPermissionNode(fallback, resolution);

  if (fallbackNode) {
    return fallbackNode;
  }

  return <MetadataUiPermissionFallback resolution={resolution} />;
}

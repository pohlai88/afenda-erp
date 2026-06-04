import "server-only";

import type { ReactNode } from "react";

import type { MetadataUiPermissionContract } from "../contracts/permission.contract";
import type { MetadataUiPresentationContract } from "../contracts/presentation.contract";
import type { MetadataUiSectionContract } from "../contracts/section.contract";
import type { MetadataUiDomAttributes } from "../identity/identity.shared";
import {
  getMetadataUiSectionCapabilities,
  type MetadataUiSectionCapability,
} from "../registry/section-capability-registry.server";
import type { MetadataUiPermissionSubject } from "../security/permission-resolver.server";
import type { MetadataUiServerActionRegistry } from "../server-actions/action-registry.server";
import type { MetadataUiRuntimeDiagnostic } from "./runtime-diagnostics.shared";

export type MetadataUiRendererContextBySection<Value> = Readonly<
  Record<string, Value>
>;

export type MetadataUiRendererContextInput = Readonly<{
  childrenBySectionKey?: MetadataUiRendererContextBySection<ReactNode>;
  domAttributesBySectionKey?: MetadataUiRendererContextBySection<MetadataUiDomAttributes>;
  diagnostics?: readonly MetadataUiRuntimeDiagnostic[];
  diagnosticsBySectionKey?: MetadataUiRendererContextBySection<
    readonly MetadataUiRuntimeDiagnostic[]
  >;
  presentationBySectionKey?: MetadataUiRendererContextBySection<MetadataUiPresentationContract>;
  permissionBySectionKey?: MetadataUiRendererContextBySection<MetadataUiPermissionContract>;
  permissionSubject?: MetadataUiPermissionSubject;
  actionRegistry?: MetadataUiServerActionRegistry;
}>;

export type MetadataUiRendererContext = MetadataUiRendererContextInput;

export type MetadataUiRendererDataContext = MetadataUiRendererContext;

export type MetadataUiResolvedSectionRenderContext = Readonly<{
  sectionKey: string;
  children?: ReactNode;
  domAttributes?: MetadataUiDomAttributes;
  diagnostics: readonly MetadataUiRuntimeDiagnostic[];
  presentation: MetadataUiPresentationContract;
  permission?: MetadataUiPermissionContract;
  permissionSubject?: MetadataUiPermissionSubject;
  actionRegistry?: MetadataUiServerActionRegistry;
  capabilities: readonly MetadataUiSectionCapability[];
}>;

function mergeMetadataUiRendererContextRecord<Value>(
  base: MetadataUiRendererContextBySection<Value> | undefined,
  extension: MetadataUiRendererContextBySection<Value> | undefined,
): MetadataUiRendererContextBySection<Value> | undefined {
  if (!base && !extension) {
    return undefined;
  }

  return {
    ...(base ?? {}),
    ...(extension ?? {}),
  };
}

export function createMetadataUiRendererContext(
  context: MetadataUiRendererContextInput = {},
): MetadataUiRendererContext {
  return context;
}

export function extendMetadataUiRendererContext(
  base: MetadataUiRendererContext | undefined,
  extension: MetadataUiRendererContextInput,
): MetadataUiRendererContext {
  return createMetadataUiRendererContext({
    ...base,
    ...extension,
    childrenBySectionKey: mergeMetadataUiRendererContextRecord(
      base?.childrenBySectionKey,
      extension.childrenBySectionKey,
    ),
    domAttributesBySectionKey: mergeMetadataUiRendererContextRecord(
      base?.domAttributesBySectionKey,
      extension.domAttributesBySectionKey,
    ),
    diagnostics: [
      ...(base?.diagnostics ?? []),
      ...(extension.diagnostics ?? []),
    ],
    diagnosticsBySectionKey: mergeMetadataUiRendererContextRecord(
      base?.diagnosticsBySectionKey,
      extension.diagnosticsBySectionKey,
    ),
    presentationBySectionKey: mergeMetadataUiRendererContextRecord(
      base?.presentationBySectionKey,
      extension.presentationBySectionKey,
    ),
    permissionBySectionKey: mergeMetadataUiRendererContextRecord(
      base?.permissionBySectionKey,
      extension.permissionBySectionKey,
    ),
  });
}

export function resolveMetadataUiSectionRenderContext(
  section: MetadataUiSectionContract,
  context?: MetadataUiRendererContext,
): MetadataUiResolvedSectionRenderContext {
  const sectionKey = section.id;

  return {
    sectionKey,
    children: context?.childrenBySectionKey?.[sectionKey],
    domAttributes: context?.domAttributesBySectionKey?.[sectionKey],
    diagnostics: [
      ...(context?.diagnostics ?? []),
      ...(context?.diagnosticsBySectionKey?.[sectionKey] ?? []),
    ],
    presentation:
      context?.presentationBySectionKey?.[sectionKey] ?? section.presentation,
    permission: context?.permissionBySectionKey?.[sectionKey] ?? section.permission,
    permissionSubject: context?.permissionSubject,
    actionRegistry: context?.actionRegistry,
    capabilities: getMetadataUiSectionCapabilities(section.kind),
  };
}

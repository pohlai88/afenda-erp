import "server-only";

import {
  parseMetadataUiRendererContract,
  type MetadataUiRendererContract,
  type MetadataUiRendererContractForSectionKind,
  type MetadataUiRendererContractInput,
  type MetadataUiRendererId,
} from "../contracts/renderer.contract";
import type { MetadataUiSectionKind } from "../contracts/section.contract";
import { METADATA_UI_ACTION_BAR_SCHEMA_ID } from "../schemas/action-bar.schema";
import { METADATA_UI_AUDIT_PANEL_SCHEMA_ID } from "../schemas/audit-panel.schema";
import { METADATA_UI_APPROVAL_TIMELINE_SCHEMA_ID } from "../schemas/approval-timeline.schema";
import { METADATA_UI_CHART_SCHEMA_ID } from "../schemas/chart.schema";
import { METADATA_UI_DETAIL_TABS_SCHEMA_ID } from "../schemas/detail-tabs.schema";
import { METADATA_UI_FORM_SCHEMA_ID } from "../schemas/form.schema";
import { METADATA_UI_KANBAN_SCHEMA_ID } from "../schemas/kanban.schema";
import { METADATA_UI_LIST_SCHEMA_ID } from "../schemas/list.schema";
import { METADATA_UI_MULTI_STEP_FORM_SCHEMA_ID } from "../schemas/multi-step-form.schema";
import { METADATA_UI_PAGE_HEADER_SCHEMA_ID } from "../schemas/page-header.schema";
import { METADATA_UI_SCORECARD_FORM_SCHEMA_ID } from "../schemas/scorecard-form.schema";
import { METADATA_UI_STAT_SCHEMA_ID } from "../schemas/stat.schema";

type MetadataUiServerRendererEntries =
  readonly MetadataUiRendererContract[];

type MetadataUiRendererContractFromInput<
  Input extends MetadataUiRendererContractInput,
> = MetadataUiRendererContract &
  Pick<Input, Extract<keyof Input, "id" | "sectionKind">>;

type MetadataUiRendererContractsFromInputs<
  Entries extends readonly MetadataUiRendererContractInput[],
> = {
  readonly [Index in keyof Entries]: MetadataUiRendererContractFromInput<
    Entries[Index]
  >;
};

export type MetadataUiServerRendererRegistryById<
  Entries extends MetadataUiServerRendererEntries,
> = {
  [Entry in Entries[number] as Entry["id"]]: Entry;
};

export type MetadataUiServerRendererRegistryBySectionKind<
  Entries extends MetadataUiServerRendererEntries,
> = {
  [Entry in Entries[number] as Entry["sectionKind"]]: Entry;
};

export type MetadataUiServerRendererId<
  Entries extends MetadataUiServerRendererEntries,
> = Entries[number]["id"];

export type MetadataUiServerRenderedSectionKind<
  Entries extends MetadataUiServerRendererEntries,
> = Entries[number]["sectionKind"];

function defineMetadataUiServerRenderer<
  const Input extends MetadataUiRendererContractInput,
>(input: Input): MetadataUiRendererContract {
  return parseMetadataUiRendererContract(input);
}

function defineMetadataUiServerRenderers<
  const Entries extends readonly MetadataUiRendererContractInput[],
>(entries: Entries): MetadataUiRendererContractsFromInputs<Entries> {
  return entries.map((entry) =>
    defineMetadataUiServerRenderer(entry),
  ) as MetadataUiRendererContractsFromInputs<Entries>;
}

export const METADATA_UI_SERVER_RENDERER_REGISTRY =
  defineMetadataUiServerRenderers([
    {
      id: "metadata-ui.renderer.list",
      sectionKind: "list",
      schemaId: METADATA_UI_LIST_SCHEMA_ID,
      modulePath: "sections/list/list-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for list sections.",
    },
    {
      id: "metadata-ui.renderer.stat",
      sectionKind: "stat",
      schemaId: METADATA_UI_STAT_SCHEMA_ID,
      modulePath: "sections/stat/stat-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for stat sections.",
    },
    {
      id: "metadata-ui.renderer.chart",
      sectionKind: "chart",
      schemaId: METADATA_UI_CHART_SCHEMA_ID,
      modulePath: "sections/chart/chart-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for chart sections.",
    },
    {
      id: "metadata-ui.renderer.action-bar",
      sectionKind: "action-bar",
      schemaId: METADATA_UI_ACTION_BAR_SCHEMA_ID,
      modulePath: "sections/action-bar/action-bar-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for action-bar sections.",
    },
    {
      id: "metadata-ui.renderer.form",
      sectionKind: "form",
      schemaId: METADATA_UI_FORM_SCHEMA_ID,
      modulePath: "sections/form/form-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for form sections.",
    },
    {
      id: "metadata-ui.renderer.multi-step-form",
      sectionKind: "multi-step-form",
      schemaId: METADATA_UI_MULTI_STEP_FORM_SCHEMA_ID,
      modulePath: "sections/multi-step-form/multi-step-form-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for multi-step-form sections.",
    },
    {
      id: "metadata-ui.renderer.scorecard-form",
      sectionKind: "scorecard-form",
      schemaId: METADATA_UI_SCORECARD_FORM_SCHEMA_ID,
      modulePath: "sections/scorecard-form/scorecard-form-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for scorecard-form sections.",
    },
    {
      id: "metadata-ui.renderer.kanban",
      sectionKind: "kanban",
      schemaId: METADATA_UI_KANBAN_SCHEMA_ID,
      modulePath: "sections/kanban/kanban-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for kanban sections.",
    },
    {
      id: "metadata-ui.renderer.audit-panel",
      sectionKind: "audit-panel",
      schemaId: METADATA_UI_AUDIT_PANEL_SCHEMA_ID,
      modulePath: "sections/audit-panel/audit-panel-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for audit-panel sections.",
    },
    {
      id: "metadata-ui.renderer.approval-timeline",
      sectionKind: "approval-timeline",
      schemaId: METADATA_UI_APPROVAL_TIMELINE_SCHEMA_ID,
      modulePath: "sections/approval-timeline/approval-timeline-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for approval-timeline sections.",
    },
    {
      id: "metadata-ui.renderer.detail-tabs",
      sectionKind: "detail-tabs",
      schemaId: METADATA_UI_DETAIL_TABS_SCHEMA_ID,
      modulePath: "sections/detail-tabs/detail-tabs-renderer.server",
      exportName: "default",
      description: "Server renderer metadata for detail-tabs sections.",
    },
    {
      id: "metadata-ui.renderer.page-header",
      sectionKind: "page-header",
      schemaId: METADATA_UI_PAGE_HEADER_SCHEMA_ID,
      modulePath: "sections/page-header/page-header.server",
      exportName: "default",
      description: "Server renderer metadata for page-header sections.",
    },
  ] as const);

export const METADATA_UI_SERVER_RENDERER_REGISTRY_BY_ID =
  Object.fromEntries(
    METADATA_UI_SERVER_RENDERER_REGISTRY.map((renderer) => [
      renderer.id,
      renderer,
    ]),
  ) as MetadataUiServerRendererRegistryById<
    typeof METADATA_UI_SERVER_RENDERER_REGISTRY
  >;

export const METADATA_UI_SERVER_RENDERER_REGISTRY_BY_SECTION_KIND =
  Object.fromEntries(
    METADATA_UI_SERVER_RENDERER_REGISTRY.map((renderer) => [
      renderer.sectionKind,
      renderer,
    ]),
  ) as MetadataUiServerRendererRegistryBySectionKind<
    typeof METADATA_UI_SERVER_RENDERER_REGISTRY
  >;

export type MetadataUiRegisteredServerRendererId =
  MetadataUiServerRendererId<typeof METADATA_UI_SERVER_RENDERER_REGISTRY>;

export type MetadataUiRegisteredServerSectionKind =
  MetadataUiServerRenderedSectionKind<
    typeof METADATA_UI_SERVER_RENDERER_REGISTRY
  >;

export function getMetadataUiServerRendererById<
  Id extends MetadataUiRegisteredServerRendererId,
>(id: Id): MetadataUiServerRendererRegistryById<
  typeof METADATA_UI_SERVER_RENDERER_REGISTRY
>[Id] {
  return METADATA_UI_SERVER_RENDERER_REGISTRY_BY_ID[id];
}

export function getMetadataUiServerRendererForSectionKind<
  SectionKind extends MetadataUiRegisteredServerSectionKind,
>(sectionKind: SectionKind): MetadataUiRendererContractForSectionKind<SectionKind> {
  return METADATA_UI_SERVER_RENDERER_REGISTRY_BY_SECTION_KIND[
    sectionKind
  ] as MetadataUiRendererContractForSectionKind<SectionKind>;
}

export function hasMetadataUiServerRendererForSectionKind(
  sectionKind: MetadataUiSectionKind,
): sectionKind is MetadataUiRegisteredServerSectionKind {
  return sectionKind in METADATA_UI_SERVER_RENDERER_REGISTRY_BY_SECTION_KIND;
}

export function resolveMetadataUiServerRendererForSectionKind(
  sectionKind: MetadataUiSectionKind,
): MetadataUiRendererContract | undefined {
  if (!hasMetadataUiServerRendererForSectionKind(sectionKind)) {
    return undefined;
  }

  return getMetadataUiServerRendererForSectionKind(sectionKind);
}

export function resolveMetadataUiServerRendererById(
  id: MetadataUiRendererId,
): MetadataUiRendererContract | undefined {
  const registryById: Record<string, MetadataUiRendererContract> =
    METADATA_UI_SERVER_RENDERER_REGISTRY_BY_ID;

  return registryById[id];
}

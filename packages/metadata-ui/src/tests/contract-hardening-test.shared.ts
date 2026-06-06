import { describe, expect, it } from "vitest";

import { parseMetadataUiPresentationContract } from "../contracts/presentation.contract";
import { parseMetadataUiRegistryContract } from "../contracts/registry.contract";
import { parseMetadataUiRendererContract } from "../contracts/renderer.contract";
import { parseMetadataUiRuntimeModuleContract } from "../contracts/runtime.contract";
import { parseMetadataUiSectionContract } from "../contracts/section.contract";
import {
  createAuditTrailPanel,
  safeCreateAuditPanel,
} from "../builders/audit-panel.builder";
import {
  createAuditTab,
  createContentTab,
  createDetailTabsSet,
  safeCreateDetailTabs,
} from "../builders/detail-tabs.builder";
import {
  createFileField,
  createFormSection,
  createSectionedForm,
  createTextField,
  safeCreateForm,
} from "../builders/form.builder";
import {
  createList,
  createListColumn,
  createListFilter,
  createListRowAction,
  createListToolbar,
  safeCreateList,
} from "../builders/list.builder";
import {
  createDialogSurface,
  createEmbeddedSurface,
  createSurfaceChrome,
  createWorkspaceSurface,
  withSurfaceVariant,
  safeCreateSurfaceChrome,
} from "../builders/surface-chrome.builder";

describe("@afenda/metadata-ui contract hardening", () => {
  it("normalizes presentation metadata and rejects chrome drift", () => {
    const presentation = parseMetadataUiPresentationContract({
      profileId: " metadata-ui.presentation.dense-table ",
      chrome: {
        surface: "card",
        density: "compact",
        emphasis: "medium",
        tone: "neutral",
      },
      layout: {
        layout: "table",
        alignment: "start",
        width: "full",
      },
      visibility: {
        showHeader: true,
        showDescription: false,
        showChrome: true,
        showDivider: true,
      },
      responsive: {
        collapseBelow: "md",
        priority: 70,
      },
      metadata: {
        role: "dense-data-section",
      },
    });

    expect(presentation.profileId).toBe(
      "metadata-ui.presentation.dense-table",
    );

    expect(() =>
      parseMetadataUiPresentationContract({
        chrome: {
          surface: "section",
          density: "comfortable",
          emphasis: "medium",
          tone: "neutral",
        },
        layout: {
          layout: "stack",
          alignment: "start",
          width: "full",
        },
        visibility: {
          showHeader: true,
          showDescription: true,
          showChrome: false,
          showDivider: true,
        },
        responsive: {
          priority: 50,
        },
        metadata: {},
      }),
    ).toThrow(/hidden chrome cannot request a divider/i);
  });

  it("binds runtime modules to their runtime doors and file suffixes", () => {
    const runtimeModule = parseMetadataUiRuntimeModuleContract({
      id: "metadata-ui.runtime.list",
      runtime: "server",
      fileSuffix: ".server.ts",
      directive: "server-only",
      allowedDoors: ["index", "server"],
      metadata: {},
    });

    expect(runtimeModule.fileSuffix).toBe(".server.ts");

    expect(() =>
      parseMetadataUiRuntimeModuleContract({
        id: "metadata-ui.runtime.list.client",
        runtime: "client",
        fileSuffix: ".server.ts",
        directive: "use-client",
        allowedDoors: ["index", "client"],
        metadata: {},
      }),
    ).toThrow(/requires one of: \.client\.ts, \.client\.tsx/i);

    expect(() =>
      parseMetadataUiRuntimeModuleContract({
        id: "metadata-ui.runtime.list.server",
        runtime: "server",
        fileSuffix: ".server.ts",
        directive: "use-client",
        allowedDoors: ["index", "server"],
        metadata: {},
      }),
    ).toThrow(/must use one of: server-only/i);

    expect(() =>
      parseMetadataUiRuntimeModuleContract({
        id: "metadata-ui.runtime.action.invalid",
        runtime: "action",
        fileSuffix: ".action.ts",
        directive: "use-server",
        allowedDoors: ["client"],
        metadata: {},
      }),
    ).toThrow(/cannot be exported through client/i);
  });

  it("pins renderer metadata to section-specific ids and module paths", () => {
    const renderer = parseMetadataUiRendererContract({
      id: "metadata-ui.renderer.list",
      sectionKind: "list",
      runtime: "server",
      schemaId: "metadata-ui.schema.list",
      modulePath: "sections/list/list-renderer.server",
      metadata: {},
    });

    expect(renderer.id).toBe("metadata-ui.renderer.list");
    expect(renderer.exportName).toBe("default");

    expect(() =>
      parseMetadataUiRendererContract({
        id: "metadata-ui.renderer.list",
        sectionKind: "list",
        runtime: "server",
        schemaId: "metadata-ui.schema.list",
        modulePath: "sections/list/list.server",
        exportName: "default",
        metadata: {},
      }),
    ).toThrow(/modulePath must be sections\/list\/list-renderer\.server/i);

    expect(() =>
      parseMetadataUiRendererContract({
        id: "metadata-ui.renderer.list",
        sectionKind: "list",
        runtime: "server",
        schemaId: "metadata-ui.schema.list",
        modulePath: "sections/list/list-renderer.server",
        exportName: "renderer",
        metadata: {},
      }),
    ).toThrow(/exportName must be default/i);
  });

  it("trims audit panel chrome text and keeps safe-create canonical", () => {
    const panel = createAuditTrailPanel({
      key: "metadata-ui.fixture.audit-panel",
      title: "  Audit trail  ",
      description: "  Trimmed description  ",
      events: [],
    });

    expect(panel.title).toBe("Audit trail");
    expect(panel.description).toBe("Trimmed description");

    const parsed = safeCreateAuditPanel({
      key: "metadata-ui.fixture.audit-panel",
      title: "Audit trail",
      events: [],
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.title).toBe("Audit trail");
    }
  });

  it("trims detail tab inputs and keeps safe-create canonical", () => {
    const content = createContentTab({
      key: " metadata-ui.fixture.tab.overview ",
      label: " Overview ",
      sectionKey: " metadata-ui.fixture.section.overview ",
      description: " Overview tab ",
      defaultSelected: true,
    });
    const audit = createAuditTab({
      key: " metadata-ui.fixture.tab.audit ",
      sectionKey: " metadata-ui.fixture.section.audit ",
      label: " Audit ",
      description: " Audit tab ",
    });
    const tabs = createDetailTabsSet({
      key: " metadata-ui.fixture.detail-tabs ",
      title: " Detail tabs ",
      description: " Tab set ",
      tabs: [content, audit],
    });

    expect(content.key).toBe("metadata-ui.fixture.tab.overview");
    expect(content.label).toBe("Overview");
    expect(content.sectionKey).toBe("metadata-ui.fixture.section.overview");
    expect(audit.label).toBe("Audit");
    expect(audit.sectionKey).toBe("metadata-ui.fixture.section.audit");
    expect(tabs.key).toBe("metadata-ui.fixture.detail-tabs");
    expect(tabs.title).toBe("Detail tabs");
    expect(tabs.description).toBe("Tab set");

    const parsed = safeCreateDetailTabs({
      key: "metadata-ui.fixture.detail-tabs",
      title: "Detail tabs",
      tabs: [content, audit],
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.tabs).toHaveLength(2);
    }
  });

  it("trims form builder inputs and keeps nested metadata canonical", () => {
    const textField = createTextField({
      key: " metadata-ui.fixture.field.name ",
      name: " metadata-ui.fixture.field.name ",
      label: " Name ",
      description: " Primary name ",
      placeholder: " Enter name ",
    });
    const fileField = createFileField({
      key: " metadata-ui.fixture.field.attachment ",
      name: " metadata-ui.fixture.field.attachment ",
      label: " Attachment ",
      description: " File upload ",
      fileUpload: {
        hostUploadKey: " metadata-ui.fixture.upload ",
        description: " Upload descriptor ",
        blockedReason: " Upload blocked ",
      },
    });
    const section = createFormSection({
      key: " metadata-ui.fixture.section.main ",
      title: " Main ",
      description: " Main section ",
      fields: [textField, fileField],
    });
    const form = createSectionedForm({
      key: " metadata-ui.fixture.form.invoice ",
      title: " Invoice form ",
      description: " Form description ",
      sections: [section],
    });

    expect(textField.key).toBe("metadata-ui.fixture.field.name");
    expect(textField.label).toBe("Name");
    expect(textField.description).toBe("Primary name");
    expect(textField.placeholder).toBe("Enter name");
    expect(fileField.fileUpload?.hostUploadKey).toBe(
      "metadata-ui.fixture.upload",
    );
    expect(fileField.fileUpload?.description).toBe("Upload descriptor");
    expect(fileField.fileUpload?.blockedReason).toBe("Upload blocked");
    expect(section.key).toBe("metadata-ui.fixture.section.main");
    expect(section.title).toBe("Main");
    expect(section.description).toBe("Main section");
    expect(form.key).toBe("metadata-ui.fixture.form.invoice");
    expect(form.title).toBe("Invoice form");
    expect(form.description).toBe("Form description");

    const parsed = safeCreateForm({
      key: "metadata-ui.fixture.form.invoice",
      title: "Invoice form",
      description: "Form description",
      mode: "view",
      layout: "sectioned",
      state: "invalid",
      errorSummary: {
        title: "Review fields",
        errors: [
          {
            fieldKey: "metadata-ui.fixture.field.name",
            message: "Name is required.",
          },
        ],
      },
      sections: [section],
      actions: [],
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.title).toBe("Invoice form");
      expect(parsed.data.errorSummary.title).toBe("Review fields");
      expect(parsed.data.errorSummary.errors[0]?.fieldKey).toBe(
        "metadata-ui.fixture.field.name",
      );
    }
  });

  it("trims list builder inputs and keeps server-window metadata canonical", () => {
    const list = createList({
      key: " metadata-ui.fixture.list.invoice ",
      title: " Invoice list ",
      description: " Invoice list description ",
      rowKey: " id ",
      selectableField: " canSelect ",
      selectionDisabledReasonField: " selectionDisabledReason ",
      columns: [
        createListColumn({
          key: " metadata-ui.fixture.column.name ",
          field: " name ",
          label: " Name ",
          description: " Display name ",
        }),
      ],
      filters: [
        createListFilter({
          key: " metadata-ui.fixture.filter.status ",
          field: " status ",
          label: " Status ",
          operator: "equals",
        }),
      ],
      defaultSort: [
        {
          field: " name ",
          direction: "asc",
        },
      ],
      rowActions: [
        createListRowAction({
          action: {
            id: "metadata-ui.fixture.view-row",
            label: "View",
            execution: {
              kind: "navigation",
              href: "/workspace/list",
            },
          },
          stateField: " rowActionState ",
          disabledReasonField: " rowActionDisabledReason ",
        }),
      ],
      trailingCells: [
        {
          key: " metadata-ui.fixture.trailing.status ",
          kind: "status",
          label: " Status ",
          statusField: " status ",
          stateField: " trailingState ",
          disabledReasonField: " trailingDisabledReason ",
        },
      ],
      toolbar: createListToolbar({
        enabled: true,
        searchPlaceholder: " Search current window ",
        showSavedViews: true,
        savedViews: [
          {
            key: " metadata-ui.fixture.saved-view ",
            label: " My view ",
            href: " /workspace/list?view=my-view ",
            active: true,
          },
        ],
        resetLabel: " Reset ",
      }),
    });

    expect(list.key).toBe("metadata-ui.fixture.list.invoice");
    expect(list.title).toBe("Invoice list");
    expect(list.description).toBe("Invoice list description");
    expect(list.rowKey).toBe("id");
    expect(list.selectableField).toBe("canSelect");
    expect(list.selectionDisabledReasonField).toBe(
      "selectionDisabledReason",
    );
    expect(list.columns[0]?.key).toBe("metadata-ui.fixture.column.name");
    expect(list.columns[0]?.label).toBe("Name");
    expect(list.columns[0]?.description).toBe("Display name");
    expect(list.filters[0]?.field).toBe("status");
    expect(list.defaultSort[0]?.field).toBe("name");
    expect(list.rowActions[0]?.stateField).toBe("rowActionState");
    expect(list.rowActions[0]?.disabledReasonField).toBe(
      "rowActionDisabledReason",
    );
    expect(list.trailingCells[0]?.key).toBe(
      "metadata-ui.fixture.trailing.status",
    );
    expect(list.trailingCells[0]?.statusField).toBe("status");
    expect(list.trailingCells[0]?.stateField).toBe("trailingState");
    expect(list.toolbar.searchPlaceholder).toBe("Search current window");
    expect(list.toolbar.savedViews[0]?.key).toBe(
      "metadata-ui.fixture.saved-view",
    );
    expect(list.toolbar.savedViews[0]?.label).toBe("My view");
    expect(list.toolbar.savedViews[0]?.href).toBe(
      "/workspace/list?view=my-view",
    );
    expect(list.toolbar.resetLabel).toBe("Reset");

    const parsed = safeCreateList({
      key: "metadata-ui.fixture.list.invoice",
      columns: [
        {
          key: "metadata-ui.fixture.column.name",
          field: "name",
          label: "Name",
        },
      ],
    });

    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.columns).toHaveLength(1);
    }
  });

  it("trims surface chrome inputs and keeps safe-create canonical", () => {
    const surface = createSurfaceChrome({
      key: " metadata-ui.fixture.surface ",
      title: " Surface chrome ",
      description: " Surface chrome description ",
      sections: [
        {
          sectionKey: " metadata-ui.fixture.section.main ",
        },
      ],
    });
    const workspace = createWorkspaceSurface({
      key: " metadata-ui.fixture.workspace ",
      title: " Workspace shell ",
      sections: [
        {
          sectionKey: " metadata-ui.fixture.section.workspace ",
        },
      ],
    });
    const dialog = createDialogSurface({
      key: " metadata-ui.fixture.dialog ",
      title: " Dialog shell ",
      sections: [
        {
          sectionKey: " metadata-ui.fixture.section.dialog ",
          region: "footer",
        },
      ],
    });
    const embedded = createEmbeddedSurface({
      key: " metadata-ui.fixture.embedded ",
      title: " Embedded shell ",
      sections: [
        {
          sectionKey: " metadata-ui.fixture.section.embedded ",
        },
      ],
    });
    const variantSurface = withSurfaceVariant(surface, "record");
    const parsed = safeCreateSurfaceChrome({
      key: "metadata-ui.fixture.surface",
      sections: [{ sectionKey: "metadata-ui.fixture.section.main" }],
    });

    expect(surface.key).toBe("metadata-ui.fixture.surface");
    expect(surface.title).toBe("Surface chrome");
    expect(surface.description).toBe("Surface chrome description");
    expect(surface.sections[0]?.sectionKey).toBe(
      "metadata-ui.fixture.section.main",
    );
    expect(surface.sections[0]?.region).toBe("primary");
    expect(surface.sections[0]?.order).toBe(0);
    expect(surface.sections[0]?.lazy).toBe(false);
    expect(workspace.variant).toBe("workspace");
    expect(dialog.variant).toBe("dialog");
    expect(embedded.variant).toBe("embedded");
    expect(variantSurface.variant).toBe("record");
    expect(dialog.sections[0]?.region).toBe("footer");
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.key).toBe("metadata-ui.fixture.surface");
    }
  });

  it("pins section metadata to its renderer and schema ids", () => {
    const section = parseMetadataUiSectionContract({
      id: "metadata-ui.section.list",
      kind: "list",
      title: "List",
      runtime: "server",
      lifecycle: "active",
      composition: "standalone",
      schemaId: "metadata-ui.schema.list",
      rendererId: "metadata-ui.renderer.list",
      presentation: {
        chrome: {
          surface: "section",
          density: "comfortable",
          emphasis: "medium",
          tone: "neutral",
        },
        layout: {
          layout: "stack",
          alignment: "start",
          width: "full",
        },
        visibility: {
          showHeader: true,
          showDescription: true,
          showChrome: true,
          showDivider: false,
        },
        responsive: {
          priority: 50,
        },
        metadata: {},
      },
      actions: [],
      children: [],
      metadata: {},
    });

    expect(section.rendererId).toBe("metadata-ui.renderer.list");

    expect(() =>
      parseMetadataUiSectionContract({
        id: "metadata-ui.section.list",
        kind: "list",
        title: "List",
        runtime: "server",
        lifecycle: "active",
        composition: "standalone",
        schemaId: "metadata-ui.schema.list",
        rendererId: "metadata-ui.renderer.stat",
        presentation: {
          chrome: {
            surface: "section",
            density: "comfortable",
            emphasis: "medium",
            tone: "neutral",
          },
          layout: {
            layout: "stack",
            alignment: "start",
            width: "full",
          },
          visibility: {
            showHeader: true,
            showDescription: true,
            showChrome: true,
            showDivider: false,
          },
          responsive: {
            priority: 50,
          },
          metadata: {},
        },
        actions: [],
        children: [],
        metadata: {},
      }),
    ).toThrow(/rendererId must be metadata-ui\.renderer\.list/i);

    expect(() =>
      parseMetadataUiSectionContract({
        id: "metadata-ui.section.stat",
        kind: "list",
        title: "List",
        runtime: "server",
        lifecycle: "active",
        composition: "standalone",
        schemaId: "metadata-ui.schema.list",
        rendererId: "metadata-ui.renderer.list",
        presentation: {
          chrome: {
            surface: "section",
            density: "comfortable",
            emphasis: "medium",
            tone: "neutral",
          },
          layout: {
            layout: "stack",
            alignment: "start",
            width: "full",
          },
          visibility: {
            showHeader: true,
            showDescription: true,
            showChrome: true,
            showDivider: false,
          },
          responsive: {
            priority: 50,
          },
          metadata: {},
        },
        actions: [],
        children: [],
        metadata: {},
      }),
    ).toThrow(/Section id must be metadata-ui\.section\.list/i);
  });

  it("requires registry entries to keep section-kind ownership explicit", () => {
    const registry = parseMetadataUiRegistryContract({
      kind: "component",
      id: "metadata-ui.component.registry",
      lifecycle: "active",
      components: [
        {
          id: "metadata-ui.section.list",
          kind: "section",
          runtime: "server",
          label: "List section",
          description: "Server section entry for metadata-driven lists.",
          capabilities: ["render", "compose"],
          metadata: {
            sectionKind: "list",
          },
        },
        {
          id: "metadata-ui.renderer.list",
          kind: "renderer",
          runtime: "server",
          label: "List renderer",
          description: "Registered server renderer for list sections.",
          capabilities: ["render"],
          rendererId: "metadata-ui.renderer.list",
          metadata: {
            sectionKind: "list",
          },
        },
        {
          id: "metadata-ui.client.list-table",
          kind: "client-island",
          runtime: "client",
          label: "List table client island",
          description: "Client island for interactive list table behavior.",
          capabilities: ["interact"],
          metadata: {
            sectionKind: "list",
          },
        },
      ],
      metadata: {},
    });

    expect(registry.kind).toBe("component");

    expect(() =>
      parseMetadataUiRegistryContract({
        kind: "component",
        id: "metadata-ui.registry",
        lifecycle: "active",
        components: [
          {
            id: "metadata-ui.section.list",
            kind: "section",
            runtime: "server",
            label: "List section",
            description: "Server section entry for metadata-driven lists.",
            capabilities: ["render", "compose"],
            metadata: {
              sectionKind: "list",
            },
          },
          {
            id: "metadata-ui.renderer.list",
            kind: "renderer",
            runtime: "server",
            label: "List renderer",
            description: "Registered server renderer for list sections.",
            capabilities: ["render"],
            rendererId: "metadata-ui.renderer.list",
            metadata: {
              sectionKind: "list",
            },
          },
          {
            id: "metadata-ui.section.list-copy",
            kind: "section",
            runtime: "server",
            label: "Duplicate section",
            description: "Duplicate section kind ownership should fail.",
            capabilities: ["render", "compose"],
            metadata: {
              sectionKind: "list",
            },
          },
        ],
        metadata: {},
      }),
    ).toThrow(/must use the metadata-ui\.component\. prefix/i);

    expect(() =>
      parseMetadataUiRegistryContract({
        kind: "renderer",
        id: "metadata-ui.component.registry",
        lifecycle: "active",
        renderers: [
          {
            id: "metadata-ui.renderer.list",
            sectionKind: "list",
            runtime: "server",
            schemaId: "metadata-ui.schema.list",
            modulePath: "sections/list/list-renderer.server",
            exportName: "default",
            metadata: {},
          },
        ],
        metadata: {},
      }),
    ).toThrow(/must use the metadata-ui\.renderer\. prefix/i);
  });
});

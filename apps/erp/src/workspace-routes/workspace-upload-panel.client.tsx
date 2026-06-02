"use client";

import type { ModuleId } from "@afenda/kernel";
import { useState } from "react";

import { DocumentUploadForm } from "@/workspace-routes/document-upload-form";

export function WorkspaceUploadPanelClient({
  modules,
  storageConfigured,
}: {
  modules: readonly { id: ModuleId; label: string }[];
  storageConfigured: boolean;
}) {
  const defaultModuleId = modules[0]?.id ?? "finance";
  const [moduleId, setModuleId] = useState<ModuleId>(defaultModuleId);

  return (
    <div className="grid gap-3">
      <label className="grid gap-1">
        <span className="type-body font-medium text-foreground">Module</span>
        <select
          className="w-full rounded-control border border-input bg-background px-3 py-2 type-control"
          value={moduleId}
          onChange={(event) => setModuleId(event.target.value as ModuleId)}
        >
          {modules.map((module) => (
            <option key={module.id} value={module.id}>
              {module.label}
            </option>
          ))}
        </select>
      </label>
      <DocumentUploadForm
        key={moduleId}
        moduleId={moduleId}
        storageConfigured={storageConfigured}
      />
    </div>
  );
}

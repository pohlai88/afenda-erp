"use client";

import { isModuleId, type ModuleId } from "@afenda/kernel";
import {
  documentUploadAccept,
  formatUploadLimit,
  uploadTenantObject,
} from "@afenda/object-storage/client";
import { Button } from "@afenda/ui/button";
import { Label } from "@afenda/ui/label";
import { useRef, useState } from "react";

import type { GovernedFormField } from "../../schemas/multi-step-form.schema";

export type GovernedFileUploadValue = {
  blobUrl: string;
  pathname: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
};

function isFileUploadValue(value: unknown): value is GovernedFileUploadValue {
  return (
    typeof value === "object" &&
    value !== null &&
    typeof (value as GovernedFileUploadValue).blobUrl === "string" &&
    (value as GovernedFileUploadValue).blobUrl.length > 0
  );
}

export function GovernedFileUploadField({
  field,
  moduleId,
  enabled,
  value,
  onValueChange,
}: {
  field: GovernedFormField;
  moduleId: ModuleId;
  enabled: boolean;
  value: unknown;
  onValueChange: (next: GovernedFileUploadValue | "") => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const uploaded = isFileUploadValue(value) ? value : null;

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setMessage("Select a file first.");
      return;
    }

    setUploading(true);
    setMessage("Uploading…");

    try {
      const result = await uploadTenantObject({
        moduleId,
        file,
        title: file.name,
        registerTenantDocument: false,
        access: "private",
      });

      onValueChange({
        blobUrl: result.blobUrl,
        pathname: result.pathname,
        contentType: result.contentType,
        sizeBytes: result.sizeBytes,
        etag: result.etag,
      });
      setMessage("Upload complete.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Upload failed. Try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        ref={fileInputRef}
        id={`wizard-field-${field.id}`}
        type="file"
        accept={field.accept ?? documentUploadAccept}
        disabled={!enabled || uploading}
        className="w-full rounded-control border border-input bg-background px-3 py-2 type-control file:mr-3 file:rounded-control file:border-0 file:bg-primary file:px-3 file:py-1.5 file:type-control file:font-medium file:text-primary-foreground"
      />
      <p className="type-caption text-muted-foreground">
        Max size {formatUploadLimit()}.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={!enabled || uploading}
          onClick={() => void handleUpload()}
        >
          {uploading ? "Uploading…" : "Upload file"}
        </Button>
        {uploaded ? (
          <span className="type-caption text-emerald-700">
            {uploaded.pathname.split("/").pop()}
          </span>
        ) : null}
      </div>
      {message ? (
        <output className="type-caption text-muted-foreground">{message}</output>
      ) : null}
      {field.required && !uploaded ? (
        <span className="sr-only">
          <Label htmlFor={`wizard-field-${field.id}`}>
            {field.label} upload required
          </Label>
        </span>
      ) : null}
    </div>
  );
}

export function resolveGovernedFormModuleId(
  moduleId: string | undefined,
): ModuleId | null {
  if (!moduleId || !isModuleId(moduleId)) {
    return null;
  }

  return moduleId;
}

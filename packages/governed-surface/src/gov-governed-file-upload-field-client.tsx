"use client";

import { isModuleId, type ModuleId } from "@afenda/kernel";
import {
  documentUploadAccept,
  formatUploadLimit,
  uploadTenantObject,
} from "@afenda/object-storage/client";
import { Alert, AlertDescription } from "@afenda/ui/alert";
import { Badge } from "@afenda/ui/badge";
import { Button } from "@afenda/ui/button";
import { Input } from "@afenda/ui/input";
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
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const uploaded = isFileUploadValue(value) ? value : null;

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setErrorMessage("Select a file first.");
      setStatusMessage(null);
      return;
    }

    setUploading(true);
    setErrorMessage(null);
    setStatusMessage("Uploading...");

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
      setStatusMessage("Upload complete.");
    } catch (error) {
      setStatusMessage(null);
      setErrorMessage(
        error instanceof Error ? error.message : "Upload failed. Try again.",
      );
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Input
        ref={fileInputRef}
        id={`wizard-field-${field.id}`}
        type="file"
        accept={field.accept ?? documentUploadAccept}
        disabled={!enabled || uploading}
      />
      <p className="type-caption">
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
          <Badge variant="secondary">
            {uploaded.pathname.split("/").pop()}
          </Badge>
        ) : null}
      </div>
      {errorMessage ? (
        <Alert variant="destructive">
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : statusMessage ? (
        <output className="type-muted">
          {statusMessage}
        </output>
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

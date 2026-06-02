"use client";

import type { ModuleId } from "@afenda/kernel";
import {
  documentUploadAccept,
  formatUploadLimit,
  uploadTenantObject,
} from "@afenda/object-storage/client";
import { Button } from "@afenda/ui/button";
import { Field, FieldLabel } from "@afenda/ui/field";
import { useRef, useState } from "react";

export type HrObjectStorageUploadResult = {
  blobUrl: string;
  pathname: string;
  contentType: string;
  sizeBytes: number;
  etag?: string;
};

type UploadTone = "neutral" | "positive" | "warning";

function toneClassName(tone: UploadTone) {
  if (tone === "positive") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }
  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }
  return "border-border/60 bg-muted/30 text-muted-foreground";
}

/** Shared HR bridge — uploads via @afenda/object-storage without ERP document registry. */
export function HrObjectStorageFileField({
  moduleId,
  idPrefix,
  label,
  hint,
  required = true,
  defaultTitle,
  onUploaded,
}: {
  moduleId: ModuleId;
  idPrefix: string;
  label: string;
  hint?: string;
  required?: boolean;
  defaultTitle?: string;
  onUploaded: (result: HrObjectStorageUploadResult) => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ message: string; tone: UploadTone }>({
    message: "Select a file, then upload before submitting the form.",
    tone: "neutral",
  });
  const [uploaded, setUploaded] = useState<HrObjectStorageUploadResult | null>(
    null,
  );

  async function handleUpload() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) {
      setStatus({ message: "Select a file first.", tone: "warning" });
      return;
    }

    setUploading(true);
    setStatus({ message: "Uploading…", tone: "neutral" });

    try {
      const result = await uploadTenantObject({
        moduleId,
        file,
        title: defaultTitle?.trim() || file.name,
        registerTenantDocument: false,
        access: "private",
      });

      const mapped: HrObjectStorageUploadResult = {
        blobUrl: result.blobUrl,
        pathname: result.pathname,
        contentType: result.contentType,
        sizeBytes: result.sizeBytes,
        etag: result.etag,
      };

      setUploaded(mapped);
      onUploaded(mapped);
      setStatus({ message: "File uploaded. You can submit the form.", tone: "positive" });
    } catch (error) {
      setStatus({
        message:
          error instanceof Error ? error.message : "Upload failed. Try again.",
        tone: "warning",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <Field className="@md/field-group:col-span-2">
      <FieldLabel htmlFor={`${idPrefix}-file`}>{label}</FieldLabel>
      <input
        ref={fileInputRef}
        id={`${idPrefix}-file`}
        type="file"
        accept={documentUploadAccept}
        required={required && !uploaded}
        disabled={uploading}
        className="w-full rounded-control border border-input bg-background px-3 py-2 type-control file:mr-3 file:rounded-control file:border-0 file:bg-primary file:px-3 file:py-1.5 file:type-control file:font-medium file:text-primary-foreground"
      />
      {hint ? <p className="type-caption text-muted-foreground">{hint}</p> : null}
      <p className="type-caption text-muted-foreground">
        Max size {formatUploadLimit()}.
      </p>
      <div className="flex flex-wrap items-center gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          disabled={uploading}
          onClick={() => void handleUpload()}
        >
          {uploading ? "Uploading…" : "Upload file"}
        </Button>
        <output
          className={`rounded-control border px-2 py-1 type-caption ${toneClassName(status.tone)}`}
        >
          {status.message}
        </output>
      </div>
      <input
        type="hidden"
        name="blobUrl"
        value={uploaded?.blobUrl ?? ""}
        required={required}
      />
      <input type="hidden" name="pathname" value={uploaded?.pathname ?? ""} />
      <input
        type="hidden"
        name="mimeType"
        value={uploaded?.contentType ?? ""}
      />
      <input
        type="hidden"
        name="contentType"
        value={uploaded?.contentType ?? ""}
      />
      <input
        type="hidden"
        name="sizeBytes"
        value={uploaded ? String(uploaded.sizeBytes) : ""}
      />
      {uploaded?.etag ? (
        <input type="hidden" name="blobEtag" value={uploaded.etag} />
      ) : null}
    </Field>
  );
}

"use client";

import { documentWorkflowCopy } from "@afenda/kernel";
import type { ModuleId } from "@afenda/kernel";
import { upload } from "@vercel/blob/client";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import {
  buildTenantBlobPathname,
  shouldUseMultipartUpload,
} from "@/lib/api/blob-pathnames.shared";
import {
  documentUploadAccept,
  documentUploadContentTypes,
  documentUploadMaxSizeBytes,
  formatUploadLimit,
} from "@/app-env/upload-policy";

type UploadState = {
  message: string;
  tone: "neutral" | "positive" | "warning";
};

const uploadCopy = documentWorkflowCopy.upload;

const idleState: UploadState = {
  message: uploadCopy.idleMessage,
  tone: "neutral",
};

function getStateClassName(tone: UploadState["tone"]) {
  if (tone === "positive") {
    return "border-emerald-200 bg-emerald-50 text-emerald-800";
  }

  if (tone === "warning") {
    return "border-amber-200 bg-amber-50 text-amber-900";
  }

  return "border-line bg-surface text-muted";
}

function isAllowedContentType(contentType: string) {
  return documentUploadContentTypes.some((allowed) => allowed === contentType);
}

export function DocumentUploadForm({
  moduleId,
  blobConfigured,
  organizationId,
}: {
  moduleId: ModuleId;
  blobConfigured: boolean;
  organizationId: string;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [state, setState] = useState<UploadState>(
    blobConfigured
      ? idleState
      : {
          message: uploadCopy.blobUnavailableMessage,
          tone: "warning",
        },
  );
  const [isUploading, setIsUploading] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!blobConfigured) {
      setState({
        message: uploadCopy.blobUnavailableMessage,
        tone: "warning",
      });
      return;
    }

    const form = new FormData(event.currentTarget);
    const file = fileInputRef.current?.files?.[0] ?? null;

    if (!file) {
      setState({
        message: uploadCopy.selectDocumentWarning,
        tone: "warning",
      });
      return;
    }

    if (!isAllowedContentType(file.type)) {
      setState({
        message: uploadCopy.invalidTypeWarning,
        tone: "warning",
      });
      return;
    }

    if (file.size > documentUploadMaxSizeBytes) {
      setState({
        message: uploadCopy.sizeLimitWarning(formatUploadLimit()),
        tone: "warning",
      });
      return;
    }

    const title = String(form.get("title") || file.name).trim();
    const ownerEntityId = String(form.get("ownerEntityId") || "").trim();

    setIsUploading(true);
    setState({
      message: uploadCopy.uploadingMessage,
      tone: "neutral",
    });

    try {
      const pathname = buildTenantBlobPathname({
        organizationId,
        moduleId,
        filename: file.name,
      });

      await upload(pathname, file, {
        access: "private",
        handleUploadUrl: "/api/uploads",
        multipart: shouldUseMultipartUpload(file.size),
        clientPayload: JSON.stringify({
          moduleId,
          title,
          ownerEntityId: ownerEntityId || undefined,
          contentType: file.type,
          sizeBytes: file.size,
          access: "private",
        }),
      });

      event.currentTarget.reset();
      setState({
        message: uploadCopy.successMessage,
        tone: "positive",
      });
      router.refresh();
    } catch (error) {
      setState({
        message:
          error instanceof Error ? error.message : uploadCopy.failureMessage,
        tone: "warning",
      });
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <form
      className="grid gap-surface-lg rounded-section border border-line bg-surface-strong p-4"
      onSubmit={handleSubmit}
    >
      <div className="@container grid gap-3 @md:grid-cols-2">
        <label className="block">
          <span className="mb-2 block type-body font-medium text-foreground">
            {uploadCopy.titleLabel}
          </span>
          <input
            className="w-full rounded-section border border-line bg-surface px-3 py-2 type-body text-foreground outline-none transition focus:border-slate-400"
            maxLength={160}
            name="title"
            placeholder={uploadCopy.titlePlaceholder}
            type="text"
          />
        </label>
        <label className="block">
          <span className="mb-2 block type-body font-medium text-foreground">
            {uploadCopy.ownerEntityLabel}
          </span>
          <input
            className="w-full rounded-section border border-line bg-surface px-3 py-2 type-body text-foreground outline-none transition focus:border-slate-400"
            maxLength={160}
            name="ownerEntityId"
            placeholder={uploadCopy.ownerEntityPlaceholder}
            type="text"
          />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 block type-body font-medium text-foreground">
          {uploadCopy.fileLabel}
        </span>
        <input
          ref={fileInputRef}
          accept={documentUploadAccept}
          className="w-full rounded-section border border-dashed border-line bg-surface px-3 py-3 type-body text-muted file:mr-4 file:rounded-control file:border-0 file:bg-slate-950 file:px-3 file:py-2 file:type-body file:font-medium file:text-white"
          name="file"
          type="file"
        />
      </label>
      <div className="@container flex flex-col gap-3 @md:flex-row @md:items-center @md:justify-between">
        <div
          className={`rounded-section border px-3 py-2 type-body ${getStateClassName(state.tone)}`}
          role="status"
        >
          {state.message}
        </div>
        <button
          className="rounded-section bg-slate-950 px-surface-lg py-2 type-body font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
          disabled={isUploading || !blobConfigured}
          type="submit"
        >
          {isUploading ? uploadCopy.submittingLabel : uploadCopy.submitLabel}
        </button>
      </div>
    </form>
  );
}

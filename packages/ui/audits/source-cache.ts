/**
 * Single-pass UI source loader — read each primitive file once per audit run.
 */
import type { ShadcnFileFingerprint } from "./fingerprint.ts";
import { fingerprintContent } from "./fingerprint.ts";
import {
  fileNameFromPath,
  isShadcnPrimitiveFile,
  readUiFile,
  relPosix,
  walkUiTsxFiles,
} from "./shared.ts";

export type UiSourceFile = {
  path: string;
  fileName: string;
  rel: string;
  content: string;
  lines: string[];
  /** Present for shadcn primitives (excludes erp-shell, shell-frame). */
  fingerprint: ShadcnFileFingerprint | null;
};

export type UiSourceCache = {
  files: UiSourceFile[];
  byName: Map<string, UiSourceFile>;
  shadcnByName: Map<string, UiSourceFile>;
};

export function loadUiSourceCache(): UiSourceCache {
  const files: UiSourceFile[] = walkUiTsxFiles().map((path) => {
    const fileName = fileNameFromPath(path);
    const { content, lines } = readUiFile(path);
    return {
      path,
      fileName,
      rel: relPosix(path),
      content,
      lines,
      fingerprint: isShadcnPrimitiveFile(fileName) ? fingerprintContent(content) : null,
    };
  });

  const byName = new Map(files.map((file) => [file.fileName, file]));
  const shadcnByName = new Map(
    files.filter((file) => file.fingerprint != null).map((file) => [file.fileName, file]),
  );

  return { files, byName, shadcnByName };
}

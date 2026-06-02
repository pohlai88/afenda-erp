import fs from "node:fs";
import path from "node:path";
import { applyTemplateTokens } from "./scaffold-grammar.mts";

export function ensureDir(dirPath: string) {
  fs.mkdirSync(dirPath, { recursive: true });
}

export function writeIfMissing(filePath: string, content: string) {
  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, content, "utf8");
    return true;
  }
  return false;
}

export function writeFileAlways(filePath: string, content: string) {
  ensureDir(path.dirname(filePath));
  fs.writeFileSync(filePath, content, "utf8");
}

export function copyTreeIfMissing(sourcePath: string, targetPath: string) {
  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  if (fs.statSync(sourcePath).isDirectory()) {
    ensureDir(targetPath);
    for (const child of fs.readdirSync(sourcePath, { withFileTypes: true })) {
      copyTreeIfMissing(
        path.join(sourcePath, child.name),
        path.join(targetPath, child.name),
      );
    }
    return true;
  }

  return writeIfMissing(targetPath, fs.readFileSync(sourcePath, "utf8"));
}

export function copyTemplateFile(
  sourcePath: string,
  targetPath: string,
  tokens: Record<string, string>,
) {
  if (!fs.existsSync(sourcePath)) {
    return false;
  }

  const raw = fs.readFileSync(sourcePath, "utf8");
  writeFileAlways(targetPath, applyTemplateTokens(raw, tokens));
  return true;
}

import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptsDir, "..");
const repositoryRoot = path.resolve(packageRoot, "../../..");
const srcRoot = path.join(packageRoot, "src");
const templateRoot = path.join(packageRoot, "templates", "hr-slice");
const packageTestsRoot = path.join(packageRoot, "tests", "unit");

const ALLOWED_CATEGORIES = new Set([
  "employee-management",
  "industry-specific",
  "payroll-compensation",
  "talent-management",
  "time-attendance",
]);

type ScaffoldStats = {
  written: number;
  unchanged: number;
  skippedExisting: number;
};

type ScaffoldTokens = {
  readonly CAPABILITY_KEY_PREFIX: string;
  readonly CAPABILITY_SLUG: string;
  readonly CAPABILITY_TEST_PREFIX: string;
  readonly CAPABILITY_TITLE: string;
  readonly CATEGORY: string;
  readonly CATEGORY_TITLE: string;
  readonly CONSTANT_PREFIX: string;
  readonly DOMAIN_KEY: string;
  readonly DOMAIN_LAST: string;
  readonly DOMAIN_TAIL: string;
  readonly IDENTIFIER: string;
  readonly IDENTIFIER_CAMEL: string;
  readonly ROUTE_PATH: string;
  readonly SEARCH_PARAM: string;
};

function formatUsage(): string {
  return [
    "Usage: pnpm scaffold:hr-slice <category> <capability-slug> <domain-key> [--repair] [--dry-run]",
    "Example: pnpm scaffold:hr-slice talent-management succession-planning hr.talent.succession",
  ].join("\n");
}

function ensureDir(dirPath: string, dryRun: boolean): void {
  if (dryRun) {
    return;
  }
  fs.mkdirSync(dirPath, { recursive: true });
}

function assertKebabCase(value: string, label: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(
      `${label} must be lowercase kebab-case. Received: ${value}`,
    );
  }
}

function assertDomainKey(value: string): void {
  if (!/^hr\.[a-z0-9]+(?:\.[a-z0-9-]+)+$/.test(value)) {
    throw new Error(
      `Domain key must match hr.<domain>.<capability>. Received: ${value}`,
    );
  }
}

function toTitleCase(value: string): string {
  return value
    .split(/[-.]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
}

function toPascalCase(value: string): string {
  return value
    .split(/[-.]/)
    .filter(Boolean)
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join("");
}

function toCamelCase(value: string): string {
  const pascal = toPascalCase(value);
  return pascal.charAt(0).toLowerCase() + pascal.slice(1);
}

function buildTokens(input: {
  readonly category: string;
  readonly capabilitySlug: string;
  readonly domainKey: string;
}): ScaffoldTokens {
  const domainSegments = input.domainKey.split(".");
  const domainTail = domainSegments.slice(1).join(".");
  const domainLast = domainSegments[domainSegments.length - 1] ?? "";
  const identifier = toPascalCase(input.domainKey);
  const title = toTitleCase(input.capabilitySlug);

  return {
    CAPABILITY_KEY_PREFIX: `hr.${domainLast.replaceAll("-", "_")}`,
    CAPABILITY_SLUG: input.capabilitySlug,
    CAPABILITY_TEST_PREFIX: input.capabilitySlug.replaceAll("-", ""),
    CAPABILITY_TITLE: title,
    CATEGORY: input.category,
    CATEGORY_TITLE: toTitleCase(input.category),
    CONSTANT_PREFIX: input.domainKey
      .replaceAll(".", "_")
      .replaceAll("-", "_")
      .toUpperCase(),
    DOMAIN_KEY: input.domainKey,
    DOMAIN_LAST: domainLast,
    DOMAIN_TAIL: domainTail,
    IDENTIFIER: identifier,
    IDENTIFIER_CAMEL: toCamelCase(identifier),
    ROUTE_PATH: `/hr/${input.capabilitySlug}`,
    SEARCH_PARAM: `${toCamelCase(domainTail)}Search`,
  };
}

function applyTokens(value: string, tokens: ScaffoldTokens): string {
  let output = value;
  for (const [key, replacement] of Object.entries(tokens)) {
    output = output.replaceAll(`__${key}__`, replacement);
  }
  return output;
}

function applyPathTokens(value: string, tokens: ScaffoldTokens): string {
  const tokenized = applyTokens(value, tokens)
    .replaceAll("capability-slug", tokens.CAPABILITY_SLUG)
    .replaceAll("domain-key", tokens.DOMAIN_KEY);

  return tokenized.endsWith(".template")
    ? tokenized.slice(0, -".template".length)
    : tokenized;
}

function isPackageUnitTestTemplate(relativeSource: string): boolean {
  return (
    relativeSource.startsWith(`tests${path.sep}`) ||
    relativeSource.startsWith("tests/")
  );
}

function resolveTargetPath(input: {
  readonly relativeSource: string;
  readonly targetRoot: string;
  readonly tokens: ScaffoldTokens;
}): string {
  if (isPackageUnitTestTemplate(input.relativeSource)) {
    const relativeTestSource = input.relativeSource
      .replace(new RegExp(`^tests[${path.sep === "\\" ? "\\\\" : path.sep}/]`), "")
      .replace("__DOMAIN_KEY__", "__CAPABILITY_TEST_PREFIX__");
    return path.join(
      packageTestsRoot,
      applyPathTokens(relativeTestSource, input.tokens),
    );
  }

  return path.join(
    input.targetRoot,
    applyPathTokens(input.relativeSource, input.tokens),
  );
}

function listTemplateFiles(dir: string): readonly string[] {
  const files: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...listTemplateFiles(fullPath));
    } else {
      files.push(fullPath);
    }
  }
  return files;
}

function writeTemplateFile(input: {
  readonly sourcePath: string;
  readonly targetRoot: string;
  readonly tokens: ScaffoldTokens;
  readonly repair: boolean;
  readonly dryRun: boolean;
  readonly stats: ScaffoldStats;
}): void {
  const relativeSource = path.relative(templateRoot, input.sourcePath);
  const targetPath = resolveTargetPath({
    relativeSource,
    targetRoot: input.targetRoot,
    tokens: input.tokens,
  });
  const content = applyTokens(
    fs.readFileSync(input.sourcePath, "utf8"),
    input.tokens,
  );

  if (fs.existsSync(targetPath)) {
    const existing = fs.readFileSync(targetPath, "utf8");
    if (existing === content) {
      input.stats.unchanged += 1;
      return;
    }
    if (input.repair && isRepairableScaffold(existing)) {
      if (!input.dryRun) {
        fs.writeFileSync(targetPath, content, "utf8");
      }
      input.stats.written += 1;
      return;
    }
    input.stats.skippedExisting += 1;
    return;
  }

  ensureDir(path.dirname(targetPath), input.dryRun);
  if (!input.dryRun) {
    fs.writeFileSync(targetPath, content, "utf8");
  }
  input.stats.written += 1;
}

function isRepairableScaffold(existing: string): boolean {
  return (
    existing.includes("Scaffold placeholder from packages/_scaffold") ||
    existing.includes("Scaffold placeholder from packages/_template-definition.") ||
    existing.includes("@afenda-bucket")
    existing.includes("Scaffolded HR Suite workbench") ||
    existing.includes("Replace scaffold rows") ||
    existing.includes('status: z.literal("scaffold-only")') ||
    (existing.includes('code: "TBD"') &&
      existing.includes('status: "scaffold-only"'))
  );
}

function parseArgs(argv: readonly string[]): {
  readonly category: string;
  readonly capabilitySlug: string;
  readonly domainKey: string;
  readonly repair: boolean;
  readonly dryRun: boolean;
} {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(formatUsage());
    process.exit(0);
  }

  const flags = new Set(argv.filter((arg) => arg.startsWith("--")));
  const positional = argv.filter((arg) => !arg.startsWith("--"));
  const [category, capabilitySlug, domainKey] = positional;

  if (!category || !capabilitySlug || !domainKey || positional.length !== 3) {
    throw new Error(formatUsage());
  }

  for (const flag of flags) {
    if (flag !== "--repair" && flag !== "--dry-run") {
      throw new Error(`Unknown scaffold flag: ${flag}\n${formatUsage()}`);
    }
  }

  return {
    category,
    capabilitySlug,
    domainKey,
    repair: flags.has("--repair"),
    dryRun: flags.has("--dry-run"),
  };
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));

  if (!ALLOWED_CATEGORIES.has(args.category)) {
    throw new Error(
      `Unsupported HR category: ${args.category}. Allowed: ${[...ALLOWED_CATEGORIES].join(", ")}`,
    );
  }
  assertKebabCase(args.capabilitySlug, "Capability slug");
  assertDomainKey(args.domainKey);

  if (!fs.existsSync(templateRoot)) {
    throw new Error(
      `Missing HR slice template root: ${path.relative(repositoryRoot, templateRoot)}`,
    );
  }

  const targetRoot = path.join(srcRoot, args.category, args.capabilitySlug);
  if (fs.existsSync(targetRoot) && !args.repair) {
    throw new Error(
      `${path.relative(repositoryRoot, targetRoot)} already exists. Re-run with --repair to fill missing scaffold files without overwriting implementation.`,
    );
  }

  const tokens = buildTokens(args);
  const stats: ScaffoldStats = { written: 0, unchanged: 0, skippedExisting: 0 };
  ensureDir(targetRoot, args.dryRun);

  for (const sourcePath of listTemplateFiles(templateRoot)) {
    writeTemplateFile({
      sourcePath,
      targetRoot,
      tokens,
      repair: args.repair,
      dryRun: args.dryRun,
      stats,
    });
  }

  const mode = args.dryRun ? "dry-run" : args.repair ? "repair" : "create";
  console.log(
    `[scaffold:hr-slice] ${mode} ${args.category}/${args.capabilitySlug} (${stats.written} written, ${stats.unchanged} unchanged, ${stats.skippedExisting} existing skipped)`,
  );
}

try {
  main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}

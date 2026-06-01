import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import ts from "typescript";

const scriptsDir = path.dirname(fileURLToPath(import.meta.url));
const packageRoot = path.resolve(scriptsDir, "..");
const repositoryRoot = path.resolve(packageRoot, "../../..");

const ALLOWED_CATEGORIES = new Set([
  "employee-management",
  "industry-specific",
  "payroll-compensation",
  "talent-management",
  "time-attendance",
]);

type Edit = {
  readonly index: number;
  readonly text: string;
  readonly description: string;
};

type FileChange = {
  readonly path: string;
  readonly descriptions: readonly string[];
  readonly changed: boolean;
};

type WireArgs = {
  readonly category: string;
  readonly capabilitySlug: string;
  readonly domainKey: string;
  readonly capabilityPrefix?: string;
  readonly label?: string;
  readonly dryRun: boolean;
  readonly withAdapter: boolean;
};

type WireTokens = {
  readonly appAdapterPath: string;
  readonly capabilityPrefix: string;
  readonly capabilitySlug: string;
  readonly capabilities: readonly string[];
  readonly category: string;
  readonly constantPrefix: string;
  readonly domainKey: string;
  readonly featureArea: string;
  readonly identifier: string;
  readonly identifierCamel: string;
  readonly label: string;
  readonly routePath: `/${string}`;
  readonly routePathsExport: string;
};

function usage(): string {
  return [
    "Usage: pnpm wire:hr-slice <category> <capability-slug> <domain-key> [--capability-prefix <prefix>] [--label <label>] [--no-adapter] [--dry-run]",
    "Example: pnpm wire:hr-slice industry-specific union-management hr.industry.ucb --capability-prefix hr.ucb --label \"Union Management\"",
  ].join("\n");
}

function assertKebabCase(value: string, label: string): void {
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)) {
    throw new Error(`${label} must be lowercase kebab-case. Received: ${value}`);
  }
}

function assertDomainKey(value: string): void {
  if (!/^hr\.[a-z0-9]+(?:\.[a-z0-9-]+)+$/.test(value)) {
    throw new Error(
      `Domain key must match hr.<domain>.<capability>. Received: ${value}`,
    );
  }
}

function assertCapabilityPrefix(value: string): void {
  if (!/^hr\.[a-z0-9_]+(?:[.-][a-z0-9_]+)*$/.test(value)) {
    throw new Error(
      `Capability prefix must start with hr. and use lowercase capability segments. Received: ${value}`,
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

function buildTokens(args: WireArgs): WireTokens {
  const domainSegments = args.domainKey.split(".");
  const domainLast = domainSegments[domainSegments.length - 1];
  if (!domainLast) {
    throw new Error(`Domain key must include a capability segment: ${args.domainKey}`);
  }

  const capabilityPrefix =
    args.capabilityPrefix ?? `hr.${domainLast.replaceAll("-", "_")}`;
  assertCapabilityPrefix(capabilityPrefix);

  const identifier = toPascalCase(args.domainKey);
  const capabilities = [
    `${capabilityPrefix}.read`,
    `${capabilityPrefix}.write`,
    `${capabilityPrefix}.approve`,
    `${capabilityPrefix}.audit.read`,
    `${capabilityPrefix}.restricted.read`,
    `${capabilityPrefix}.integration.expose`,
  ];

  return {
    appAdapterPath: path.join(
      repositoryRoot,
      "apps",
      "erp",
      "src",
      "lib",
      "hr-sections",
      `${args.capabilitySlug}.server.tsx`,
    ),
    capabilityPrefix,
    capabilitySlug: args.capabilitySlug,
    capabilities,
    category: args.category,
    constantPrefix: args.domainKey
      .replaceAll(".", "_")
      .replaceAll("-", "_")
      .toUpperCase(),
    domainKey: args.domainKey,
    featureArea: `${args.category}/${args.capabilitySlug}`,
    identifier,
    identifierCamel: toCamelCase(identifier),
    label: args.label ?? toTitleCase(args.capabilitySlug),
    routePath: `/hr/${args.capabilitySlug}`,
    routePathsExport: `${toCamelCase(identifier)}RoutePaths`,
  };
}

function resolveRoutePathExport(tokens: WireTokens): string {
  const contractPath = path.join(
    packageRoot,
    "src",
    tokens.featureArea,
    "contracts",
    `${tokens.domainKey}-route.contract.ts`,
  );
  if (!fs.existsSync(contractPath)) {
    return tokens.routePathsExport;
  }

  const sourceFile = parseSource(contractPath, readFile(contractPath));
  const constInitializers = new Map<string, ts.Expression>();
  const exportedNames = new Set<string>();

  for (const statement of sourceFile.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    const isExported = statement.modifiers?.some(
      (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
    );
    if (!isExported) continue;

    for (const declaration of statement.declarationList.declarations) {
      if (!ts.isIdentifier(declaration.name) || !declaration.initializer) continue;
      constInitializers.set(
        declaration.name.text,
        unwrapInitializer(declaration.initializer),
      );
      exportedNames.add(declaration.name.text);
    }
  }

  const hubObjectNames = new Set<string>();
  for (const [name, initializer] of constInitializers) {
    if (!ts.isObjectLiteralExpression(initializer)) continue;
    const hubProperty = initializer.properties.find(
      (property): property is ts.PropertyAssignment =>
        ts.isPropertyAssignment(property) &&
        propertyNameText(property.name) === "hub",
    );
    if (
      hubProperty &&
      ts.isStringLiteral(hubProperty.initializer) &&
      hubProperty.initializer.text === tokens.routePath
    ) {
      hubObjectNames.add(name);
    }
  }

  const candidates = new Set(hubObjectNames);
  let addedAlias = true;
  while (addedAlias) {
    addedAlias = false;
    for (const [name, initializer] of constInitializers) {
      if (
        !candidates.has(name) &&
        ts.isIdentifier(initializer) &&
        candidates.has(initializer.text)
      ) {
        candidates.add(name);
        addedAlias = true;
      }
    }
  }

  const routePathCandidates = [...candidates].filter(
    (candidate) =>
      exportedNames.has(candidate) && candidate.endsWith("RoutePaths"),
  );
  if (routePathCandidates.length === 0) {
    return tokens.routePathsExport;
  }

  const registry = readFile(
    path.join(
      repositoryRoot,
      "apps",
      "erp",
      "src",
      "lib",
      "hr-sections",
      "registry.server.ts",
    ),
  );
  const nav = readFile(
    path.join(
      packageRoot,
      "src",
      "hr-suite-integration",
      "navigation",
      "hr-suite-nav.contract.ts",
    ),
  );
  const existingCandidate = routePathCandidates.find(
    (candidate) => registry.includes(candidate) || nav.includes(candidate),
  );
  if (existingCandidate) {
    return existingCandidate;
  }

  return routePathCandidates.includes(tokens.routePathsExport)
    ? tokens.routePathsExport
    : routePathCandidates[0];
}

function parseArgs(argv: readonly string[]): WireArgs {
  if (argv.includes("--help") || argv.includes("-h")) {
    console.log(usage());
    process.exit(0);
  }

  const positional: string[] = [];
  let capabilityPrefix: string | undefined;
  let label: string | undefined;
  let dryRun = false;
  let withAdapter = true;

  for (let index = 0; index < argv.length; index += 1) {
    const arg = argv[index];
    if (!arg) continue;
    if (arg === "--dry-run") {
      dryRun = true;
      continue;
    }
    if (arg === "--no-adapter") {
      withAdapter = false;
      continue;
    }
    if (arg === "--capability-prefix") {
      capabilityPrefix = argv[index + 1];
      index += 1;
      if (!capabilityPrefix) {
        throw new Error(`Missing value for --capability-prefix.\n${usage()}`);
      }
      continue;
    }
    if (arg === "--label") {
      label = argv[index + 1];
      index += 1;
      if (!label) {
        throw new Error(`Missing value for --label.\n${usage()}`);
      }
      continue;
    }
    if (arg.startsWith("--")) {
      throw new Error(`Unknown wire flag: ${arg}\n${usage()}`);
    }
    positional.push(arg);
  }

  const [category, capabilitySlug, domainKey] = positional;
  if (!category || !capabilitySlug || !domainKey || positional.length !== 3) {
    throw new Error(usage());
  }

  if (!ALLOWED_CATEGORIES.has(category)) {
    throw new Error(
      `Unsupported HR category: ${category}. Allowed: ${[...ALLOWED_CATEGORIES].join(", ")}`,
    );
  }
  assertKebabCase(capabilitySlug, "Capability slug");
  assertDomainKey(domainKey);

  return {
    category,
    capabilitySlug,
    domainKey,
    capabilityPrefix,
    label,
    dryRun,
    withAdapter,
  };
}

function readFile(filePath: string): string {
  return fs.readFileSync(filePath, "utf8");
}

function relativePath(filePath: string): string {
  return path.relative(repositoryRoot, filePath).replaceAll(path.sep, "/");
}

function parseSource(filePath: string, content: string): ts.SourceFile {
  return ts.createSourceFile(
    filePath,
    content,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  );
}

function applyEdits(content: string, edits: readonly Edit[]): string {
  return [...edits]
    .sort((left, right) => right.index - left.index)
    .reduce(
      (current, edit) =>
        `${current.slice(0, edit.index)}${edit.text}${current.slice(edit.index)}`,
      content,
    );
}

function writeFileWithEdits(input: {
  readonly filePath: string;
  readonly dryRun: boolean;
  readonly edits: readonly Edit[];
}): FileChange {
  const content = readFile(input.filePath);
  if (input.edits.length === 0) {
    return { path: input.filePath, descriptions: [], changed: false };
  }

  const updated = applyEdits(content, input.edits);
  if (updated === content) {
    return { path: input.filePath, descriptions: [], changed: false };
  }

  if (!input.dryRun) {
    fs.writeFileSync(input.filePath, updated, "utf8");
  }

  return {
    path: input.filePath,
    descriptions: input.edits.map((edit) => edit.description),
    changed: true,
  };
}

function createFileChange(input: {
  readonly filePath: string;
  readonly content: string;
  readonly dryRun: boolean;
  readonly description: string;
}): FileChange {
  if (fs.existsSync(input.filePath)) {
    return { path: input.filePath, descriptions: [], changed: false };
  }

  if (!input.dryRun) {
    fs.mkdirSync(path.dirname(input.filePath), { recursive: true });
    fs.writeFileSync(input.filePath, input.content, "utf8");
  }

  return {
    path: input.filePath,
    descriptions: [input.description],
    changed: true,
  };
}

function findVariableDeclaration(
  sourceFile: ts.SourceFile,
  name: string,
): ts.VariableDeclaration {
  let found: ts.VariableDeclaration | undefined;

  function visit(node: ts.Node): void {
    if (
      ts.isVariableDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.name.text === name
    ) {
      found = node;
      return;
    }
    ts.forEachChild(node, visit);
  }

  visit(sourceFile);
  if (!found) {
    throw new Error(
      `Could not find variable "${name}" in ${relativePath(sourceFile.fileName)}`,
    );
  }
  return found;
}

function unwrapInitializer(expression: ts.Expression): ts.Expression {
  if (
    ts.isAsExpression(expression) ||
    ts.isSatisfiesExpression(expression) ||
    ts.isParenthesizedExpression(expression)
  ) {
    return unwrapInitializer(expression.expression);
  }
  return expression;
}

function getObjectLiteralInitializer(
  sourceFile: ts.SourceFile,
  name: string,
): ts.ObjectLiteralExpression {
  const declaration = findVariableDeclaration(sourceFile, name);
  const initializer = declaration.initializer
    ? unwrapInitializer(declaration.initializer)
    : undefined;
  if (!initializer || !ts.isObjectLiteralExpression(initializer)) {
    throw new Error(
      `Variable "${name}" is not an object literal in ${relativePath(sourceFile.fileName)}`,
    );
  }
  return initializer;
}

function getArrayLiteralInitializer(
  sourceFile: ts.SourceFile,
  name: string,
): ts.ArrayLiteralExpression {
  const declaration = findVariableDeclaration(sourceFile, name);
  const initializer = declaration.initializer
    ? unwrapInitializer(declaration.initializer)
    : undefined;
  if (!initializer || !ts.isArrayLiteralExpression(initializer)) {
    throw new Error(
      `Variable "${name}" is not an array literal in ${relativePath(sourceFile.fileName)}`,
    );
  }
  return initializer;
}

function getSetArrayInitializer(
  sourceFile: ts.SourceFile,
  name: string,
): ts.ArrayLiteralExpression {
  const declaration = findVariableDeclaration(sourceFile, name);
  const initializer = declaration.initializer;
  if (
    !initializer ||
    !ts.isNewExpression(initializer) ||
    initializer.arguments?.length !== 1
  ) {
    throw new Error(
      `Variable "${name}" is not a single-argument Set in ${relativePath(sourceFile.fileName)}`,
    );
  }

  const [argument] = initializer.arguments;
  if (!argument || !ts.isArrayLiteralExpression(argument)) {
    throw new Error(
      `Variable "${name}" Set argument is not an array in ${relativePath(sourceFile.fileName)}`,
    );
  }
  return argument;
}

function propertyNameText(name: ts.PropertyName): string | null {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name) || ts.isNumericLiteral(name)) {
    return name.text;
  }
  return null;
}

function hasObjectProperty(
  objectLiteral: ts.ObjectLiteralExpression,
  key: string,
): boolean {
  return objectLiteral.properties.some(
    (property) =>
      ts.isPropertyAssignment(property) &&
      propertyNameText(property.name) === key,
  );
}

function hasArrayString(arrayLiteral: ts.ArrayLiteralExpression, value: string): boolean {
  return arrayLiteral.elements.some(
    (element) => ts.isStringLiteral(element) && element.text === value,
  );
}

function hasArrayExpressionText(
  sourceFile: ts.SourceFile,
  arrayLiteral: ts.ArrayLiteralExpression,
  value: string,
): boolean {
  return arrayLiteral.elements.some(
    (element) => element.getText(sourceFile) === value,
  );
}

function objectInsertionEdit(input: {
  readonly sourceFile: ts.SourceFile;
  readonly objectLiteral: ts.ObjectLiteralExpression;
  readonly text: string;
  readonly description: string;
}): Edit {
  return {
    index: input.objectLiteral.getEnd() - 1,
    text: input.text,
    description: input.description,
  };
}

function arrayInsertionEdit(input: {
  readonly sourceFile: ts.SourceFile;
  readonly arrayLiteral: ts.ArrayLiteralExpression;
  readonly text: string;
  readonly description: string;
}): Edit {
  return {
    index: input.arrayLiteral.getEnd() - 1,
    text: input.text,
    description: input.description,
  };
}

function findImportDeclaration(
  sourceFile: ts.SourceFile,
  moduleSpecifier: string,
): ts.ImportDeclaration | undefined {
  return sourceFile.statements.find(
    (statement): statement is ts.ImportDeclaration =>
      ts.isImportDeclaration(statement) &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === moduleSpecifier,
  );
}

function getNamedImports(
  sourceFile: ts.SourceFile,
  moduleSpecifier: string,
): ts.NamedImports {
  const declaration = findImportDeclaration(sourceFile, moduleSpecifier);
  if (!declaration?.importClause?.namedBindings) {
    throw new Error(
      `Could not find named import from "${moduleSpecifier}" in ${relativePath(sourceFile.fileName)}`,
    );
  }
  const { namedBindings } = declaration.importClause;
  if (!ts.isNamedImports(namedBindings)) {
    throw new Error(
      `Import from "${moduleSpecifier}" is not a named import in ${relativePath(sourceFile.fileName)}`,
    );
  }
  return namedBindings;
}

function hasNamedImport(namedImports: ts.NamedImports, name: string): boolean {
  return namedImports.elements.some((element) => element.name.text === name);
}

function namedImportInsertionEdit(input: {
  readonly sourceFile: ts.SourceFile;
  readonly namedImports: ts.NamedImports;
  readonly name: string;
  readonly description: string;
}): Edit | null {
  if (hasNamedImport(input.namedImports, input.name)) {
    return null;
  }

  const lastElement = input.namedImports.elements.at(-1);
  return {
    index: lastElement?.getEnd() ?? input.namedImports.getEnd() - 1,
    text: lastElement ? `,\n  ${input.name}` : `\n  ${input.name}\n`,
    description: input.description,
  };
}

function hasExportFrom(sourceFile: ts.SourceFile, moduleSpecifier: string): boolean {
  return sourceFile.statements.some(
    (statement) =>
      ts.isExportDeclaration(statement) &&
      statement.moduleSpecifier !== undefined &&
      ts.isStringLiteral(statement.moduleSpecifier) &&
      statement.moduleSpecifier.text === moduleSpecifier,
  );
}

function hasExportModifier(node: { readonly modifiers?: ts.NodeArray<ts.ModifierLike> }) {
  return node.modifiers?.some(
    (modifier) => modifier.kind === ts.SyntaxKind.ExportKeyword,
  );
}

function resolveRelativeModule(fromFile: string, moduleSpecifier: string): string | null {
  if (!moduleSpecifier.startsWith(".")) {
    return null;
  }

  const basePath = path.resolve(path.dirname(fromFile), moduleSpecifier);
  const candidates = [
    basePath,
    `${basePath}.ts`,
    `${basePath}.tsx`,
    `${basePath}.mts`,
    path.join(basePath, "index.ts"),
    path.join(basePath, "index.tsx"),
  ];
  return (
    candidates.find(
      (candidate) => fs.existsSync(candidate) && fs.statSync(candidate).isFile(),
    ) ?? null
  );
}

function collectExportedNames(
  filePath: string,
  seen = new Set<string>(),
): Set<string> {
  const names = new Set<string>();
  if (!fs.existsSync(filePath) || seen.has(filePath)) {
    return names;
  }
  seen.add(filePath);

  const sourceFile = parseSource(filePath, readFile(filePath));
  for (const statement of sourceFile.statements) {
    if (ts.isExportDeclaration(statement)) {
      if (
        statement.exportClause &&
        ts.isNamedExports(statement.exportClause)
      ) {
        for (const element of statement.exportClause.elements) {
          names.add(element.name.text);
        }
        continue;
      }

      if (
        statement.moduleSpecifier &&
        ts.isStringLiteral(statement.moduleSpecifier)
      ) {
        const resolved = resolveRelativeModule(
          filePath,
          statement.moduleSpecifier.text,
        );
        if (!resolved) continue;
        for (const name of collectExportedNames(resolved, seen)) {
          names.add(name);
        }
      }
      continue;
    }

    if (ts.isVariableStatement(statement) && hasExportModifier(statement)) {
      for (const declaration of statement.declarationList.declarations) {
        if (ts.isIdentifier(declaration.name)) {
          names.add(declaration.name.text);
        }
      }
      continue;
    }

    if (
      (ts.isFunctionDeclaration(statement) ||
        ts.isClassDeclaration(statement) ||
        ts.isInterfaceDeclaration(statement) ||
        ts.isTypeAliasDeclaration(statement) ||
        ts.isEnumDeclaration(statement)) &&
      hasExportModifier(statement) &&
      statement.name
    ) {
      names.add(statement.name.text);
    }
  }

  return names;
}

function finalTopLevelExportEnd(sourceFile: ts.SourceFile): number {
  const exports = sourceFile.statements.filter((statement) =>
    ts.isExportDeclaration(statement),
  );
  const lastExport = exports.at(-1);
  if (!lastExport) {
    throw new Error(`No export declarations found in ${relativePath(sourceFile.fileName)}`);
  }
  return lastExport.getEnd();
}

function appManifestEdits(sourceFile: ts.SourceFile, tokens: WireTokens): Edit[] {
  const manifest = getObjectLiteralInitializer(sourceFile, "hrSectionManifest");
  if (hasObjectProperty(manifest, tokens.capabilitySlug)) return [];

  return [
    objectInsertionEdit({
      sourceFile,
      objectLiteral: manifest,
      description: `add ${tokens.capabilitySlug} manifest entry`,
      text: `\n  "${tokens.capabilitySlug}": {\n    label: ${JSON.stringify(tokens.label)},\n    featureArea: ${JSON.stringify(tokens.featureArea)},\n  },`,
    }),
  ];
}

function appRegistryEdits(sourceFile: ts.SourceFile, tokens: WireTokens): Edit[] {
  const edits: Edit[] = [];
  const namedImports = getNamedImports(
    sourceFile,
    "@afenda/feature-hr-suite/metadata",
  );
  const importEdit = namedImportInsertionEdit({
    sourceFile,
    namedImports,
    name: tokens.routePathsExport,
    description: `import ${tokens.routePathsExport}`,
  });
  if (importEdit) edits.push(importEdit);

  const sectionLoaders = getObjectLiteralInitializer(sourceFile, "sectionLoaders");
  if (!hasObjectProperty(sectionLoaders, tokens.capabilitySlug)) {
    edits.push(
      objectInsertionEdit({
        sourceFile,
        objectLiteral: sectionLoaders,
        description: `add ${tokens.capabilitySlug} section loader`,
        text: `\n  "${tokens.capabilitySlug}": () => import("./${tokens.capabilitySlug}.server"),`,
      }),
    );
  }

  const hrRoutePaths = getArrayLiteralInitializer(sourceFile, "hrRoutePaths");
  const routePathSpread = `...Object.values(${tokens.routePathsExport})`;
  if (!hasArrayExpressionText(sourceFile, hrRoutePaths, routePathSpread)) {
    edits.push(
      arrayInsertionEdit({
        sourceFile,
        arrayLiteral: hrRoutePaths,
        description: `add ${tokens.routePathsExport} route paths`,
        text: `\n  ${routePathSpread},`,
      }),
    );
  }

  const hrSectionHubPaths = getSetArrayInitializer(sourceFile, "hrSectionHubPaths");
  const hubExpression = `${tokens.routePathsExport}.hub`;
  if (!hasArrayExpressionText(sourceFile, hrSectionHubPaths, hubExpression)) {
    edits.push(
      arrayInsertionEdit({
        sourceFile,
        arrayLiteral: hrSectionHubPaths,
        description: `add ${tokens.routePathsExport}.hub`,
        text: `\n  ${hubExpression},`,
      }),
    );
  }

  return edits;
}

function navEdits(sourceFile: ts.SourceFile, tokens: WireTokens): Edit[] {
  const edits: Edit[] = [];
  const importPath = `../../${tokens.featureArea}/contracts/${tokens.domainKey}-route.contract`;
  if (!findImportDeclaration(sourceFile, importPath)) {
    const importStatements = sourceFile.statements.filter((statement) =>
      ts.isImportDeclaration(statement),
    );
    const lastImport = importStatements.at(-1);
    if (!lastImport) {
      throw new Error(`No imports found in ${relativePath(sourceFile.fileName)}`);
    }
    edits.push({
      index: lastImport.getEnd(),
      description: `import ${tokens.routePathsExport} into HR nav`,
      text: `\nimport { ${tokens.routePathsExport} } from "${importPath}";`,
    });
  }

  const navItems = getArrayLiteralInitializer(sourceFile, "hrModuleNavItems");
  const navItemExists = navItems.elements.some(
    (element) =>
      ts.isObjectLiteralExpression(element) &&
      element.properties.some(
        (property) =>
          ts.isPropertyAssignment(property) &&
          propertyNameText(property.name) === "href" &&
          property.initializer.getText(sourceFile) === `${tokens.routePathsExport}.hub`,
      ),
  );

  if (!navItemExists) {
    edits.push(
      arrayInsertionEdit({
        sourceFile,
        arrayLiteral: navItems,
        description: `add ${tokens.label} HR nav item`,
        text: `\n  {\n    href: ${tokens.routePathsExport}.hub,\n    label: ${JSON.stringify(tokens.label)},\n    requiredCapabilities: [${tokens.capabilities
      .slice(0, 3)
      .map((capability) => JSON.stringify(capability))
      .join(", ")}],\n  },`,
      }),
    );
  }

  return edits;
}

function packageServerEdits(sourceFile: ts.SourceFile, tokens: WireTokens): Edit[] {
  const moduleSpecifier = `./${tokens.featureArea}/server`;
  if (hasExportFrom(sourceFile, moduleSpecifier)) return [];
  return [
    {
      index: finalTopLevelExportEnd(sourceFile),
      description: `export ${tokens.featureArea} server door`,
      text: `\nexport * from ${JSON.stringify(moduleSpecifier)};`,
    },
  ];
}

function packageMetadataEdits(sourceFile: ts.SourceFile, tokens: WireTokens): Edit[] {
  const moduleSpecifier = `./${tokens.featureArea}/metadata`;
  if (hasExportFrom(sourceFile, moduleSpecifier)) return [];

  const expectedExports = [
    `get${tokens.identifier}ListSurfaceKeys`,
    `${tokens.constantPrefix}_LIST_SEARCH_PARAM_MODEL_FIELDS`,
    `${tokens.constantPrefix}_LIST_SEARCH_PARAMS_BY_KEY`,
    `${tokens.constantPrefix}_LIST_SURFACE_COLUMNS_BY_KEY`,
    `${tokens.constantPrefix}_LIST_SURFACE_KEYS`,
    `${tokens.constantPrefix}_READ_ONLY_LIST_SURFACE_KEYS`,
    `${tokens.identifierCamel}AuditTrailSurfaceKey`,
    `${tokens.identifierCamel}OverviewKpiSurfaceKey`,
    `${tokens.identifierCamel}WorkbenchSurfaceKey`,
    `${tokens.identifierCamel}RoutePaths`,
    `${tokens.identifierCamel}UiCopy`,
    `parse${tokens.identifier}SearchParams`,
    `to${tokens.identifier}PageModelInput`,
    `type ${tokens.identifier}ListSurfaceKey`,
    `type ${tokens.identifier}PageModelInput`,
    `type ${tokens.identifier}RoutePath`,
    `type ${tokens.identifier}SearchParams`,
  ];
  const sliceMetadataPath = path.join(
    packageRoot,
    "src",
    tokens.featureArea,
    "metadata.ts",
  );
  const availableExports = collectExportedNames(sliceMetadataPath);
  const hasExpectedExports =
    availableExports.size === 0 ||
    expectedExports.every((exportName) =>
      availableExports.has(exportName.replace(/^type /, "")),
    );

  return [
    {
      index: sourceFile.getEnd(),
      description: `export ${tokens.featureArea} metadata door`,
      text: hasExpectedExports
        ? `\n\nexport {\n  ${expectedExports.join(",\n  ")},\n} from ${JSON.stringify(moduleSpecifier)};`
        : `\n\nexport * from ${JSON.stringify(moduleSpecifier)};`,
    },
  ];
}

function authEdits(sourceFile: ts.SourceFile, tokens: WireTokens): Edit[] {
  const appCapabilities = getArrayLiteralInitializer(sourceFile, "appCapabilities");
  const missingCapabilities = tokens.capabilities.filter(
    (capability) => !hasArrayString(appCapabilities, capability),
  );
  if (missingCapabilities.length === 0) return [];

  return [
    arrayInsertionEdit({
      sourceFile,
      arrayLiteral: appCapabilities,
      description: `add ${missingCapabilities.length} ${tokens.capabilityPrefix} auth capabilities`,
      text: missingCapabilities
        .map((capability) => `\n  ${JSON.stringify(capability)},`)
        .join(""),
    }),
  ];
}

function kernelCapabilityEdits(sourceFile: ts.SourceFile, tokens: WireTokens): Edit[] {
  const routeByCapability = getObjectLiteralInitializer(sourceFile, "routeByCapability");
  const missingCapabilities = tokens.capabilities.filter(
    (capability) => !hasObjectProperty(routeByCapability, capability),
  );
  if (missingCapabilities.length === 0) return [];

  return [
    objectInsertionEdit({
      sourceFile,
      objectLiteral: routeByCapability,
      description: `route ${missingCapabilities.length} ${tokens.capabilityPrefix} execution capabilities`,
      text: missingCapabilities
        .map(
          (capability) =>
            `\n  ${JSON.stringify(capability)}: ${JSON.stringify(tokens.routePath)},`,
        )
        .join(""),
    }),
  ];
}

function seedPermissionEdits(sourceFile: ts.SourceFile, tokens: WireTokens): Edit[] {
  const permissionCatalog = getArrayLiteralInitializer(sourceFile, "permissionCatalog");
  const missingCapabilities = tokens.capabilities.filter((capability) => {
    return !permissionCatalog.elements.some(
      (element) =>
        ts.isObjectLiteralExpression(element) &&
        element.properties.some(
          (property) =>
            ts.isPropertyAssignment(property) &&
            propertyNameText(property.name) === "key" &&
            ts.isStringLiteral(property.initializer) &&
            property.initializer.text === capability,
        ),
    );
  });

  if (missingCapabilities.length === 0) return [];

  const entries = missingCapabilities
    .map((capability) => {
      const action = capability.slice(tokens.capabilityPrefix.length + 1);
      return [
        "  {",
        `    key: ${JSON.stringify(capability)},`,
        '    module: "hr",',
        `    label: ${JSON.stringify(`${toTitleCase(action)} ${tokens.label}`)},`,
        `    description: ${JSON.stringify(`Allows ${action.replaceAll(".", " ")} access for ${tokens.label}.`)},`,
        "  },",
      ].join("\n");
    })
    .join("\n");

  return [
    arrayInsertionEdit({
      sourceFile,
      arrayLiteral: permissionCatalog,
      description: `seed ${missingCapabilities.length} ${tokens.capabilityPrefix} permissions`,
      text: `\n${entries}`,
    }),
  ];
}

function appAdapterContent(tokens: WireTokens): string {
  const shortName = tokens.identifier
    .replace(/^Hr[A-Z][a-z]+/, "")
    .replace(/[^A-Za-z0-9]/g, "");
  const failureGuardName = `is${shortName || tokens.identifier}AccessFailure`;
  const contextResolverName = `resolve${shortName || tokens.identifier}PageContext`;

  return `import {
  ${tokens.identifierCamel}UiCopy,
  parse${tokens.identifier}SearchParams,
  to${tokens.identifier}PageModelInput,
} from "@afenda/feature-hr-suite/metadata";
import {
  build${tokens.identifier}PageModel,
  ${tokens.identifier}AccessDeniedPanel,
  ${tokens.identifier}Section,
  require${tokens.identifier}Read,
} from "@afenda/feature-hr-suite/server";
import {
  ExecutionAccessDeniedError,
  ExecutionContextRequiredError,
} from "@afenda/kernel/execution";
import type { Metadata } from "next";

import type { HrSectionPageProps } from "./registry.server";

export const metadata: Metadata = {
  title: \`\${${tokens.identifierCamel}UiCopy.page.title} - HR\`,
  description: ${tokens.identifierCamel}UiCopy.page.description,
};

function ${failureGuardName}(error: unknown) {
  return (
    error instanceof ExecutionContextRequiredError ||
    error instanceof ExecutionAccessDeniedError
  );
}

async function ${contextResolverName}(
  searchParams?: HrSectionPageProps["searchParams"],
) {
  const [guard, resolvedSearchParams] = await Promise.all([
    require${tokens.identifier}Read(),
    searchParams ?? Promise.resolve(undefined),
  ]);
  const parsed = parse${tokens.identifier}SearchParams(resolvedSearchParams);

  return to${tokens.identifier}PageModelInput({
    organizationId: guard.organization.id,
    canReadAudit: guard.canReadAudit,
    searchParams: parsed,
  });
}

export default async function ${tokens.identifier}Page({
  searchParams,
}: HrSectionPageProps) {
  try {
    const modelInput = await ${contextResolverName}(searchParams);
    const pageModel = await build${tokens.identifier}PageModel(modelInput);
    return <${tokens.identifier}Section pageModel={pageModel} />;
  } catch (error) {
    if (${failureGuardName}(error)) {
      return <${tokens.identifier}AccessDeniedPanel />;
    }
    throw error;
  }
}
`;
}

function assertSliceExistsForWrite(tokens: WireTokens): void {
  const sliceRoot = path.join(packageRoot, "src", tokens.featureArea);
  if (!fs.existsSync(sliceRoot)) {
    throw new Error(
      `Cannot wire missing HR slice ${tokens.featureArea}. Run scaffold:hr-slice or implement the slice first.`,
    );
  }
  const requiredFiles = [
    path.join(sliceRoot, "metadata.ts"),
    path.join(sliceRoot, "server.ts"),
    path.join(
      sliceRoot,
      "contracts",
      `${tokens.domainKey}-route.contract.ts`,
    ),
  ];
  const missingFiles = requiredFiles.filter((filePath) => !fs.existsSync(filePath));
  if (missingFiles.length > 0) {
    throw new Error(
      `Cannot wire incomplete HR slice ${tokens.featureArea}. Missing: ${missingFiles
        .map(relativePath)
        .join(", ")}`,
    );
  }
}

function assertAdapterExportsAvailable(tokens: WireTokens): void {
  const metadataExports = collectExportedNames(
    path.join(packageRoot, "src", tokens.featureArea, "metadata.ts"),
  );
  const serverExports = collectExportedNames(
    path.join(packageRoot, "src", tokens.featureArea, "server.ts"),
  );
  const requiredMetadataExports = [
    `${tokens.identifierCamel}UiCopy`,
    `parse${tokens.identifier}SearchParams`,
    `to${tokens.identifier}PageModelInput`,
  ];
  const requiredServerExports = [
    `build${tokens.identifier}PageModel`,
    `${tokens.identifier}AccessDeniedPanel`,
    `${tokens.identifier}Section`,
    `require${tokens.identifier}Read`,
  ];
  const missing = [
    ...requiredMetadataExports.filter((name) => !metadataExports.has(name)),
    ...requiredServerExports.filter((name) => !serverExports.has(name)),
  ];

  if (missing.length > 0) {
    throw new Error(
      `Cannot create generated app adapter for ${tokens.featureArea}; missing exports: ${missing.join(", ")}. Add the exports or rerun with --no-adapter and create a custom adapter.`,
    );
  }
}

function createAppAdapterChange(input: {
  readonly tokens: WireTokens;
  readonly dryRun: boolean;
}): FileChange {
  if (!input.dryRun && !fs.existsSync(input.tokens.appAdapterPath)) {
    assertAdapterExportsAvailable(input.tokens);
  }

  return createFileChange({
    filePath: input.tokens.appAdapterPath,
    content: appAdapterContent(input.tokens),
    dryRun: input.dryRun,
    description: `create ${input.tokens.capabilitySlug} app adapter`,
  });
}

function updateAstFile(input: {
  readonly filePath: string;
  readonly dryRun: boolean;
  readonly buildEdits: (sourceFile: ts.SourceFile) => readonly Edit[];
}): FileChange {
  const content = readFile(input.filePath);
  const sourceFile = parseSource(input.filePath, content);
  return writeFileWithEdits({
    filePath: input.filePath,
    dryRun: input.dryRun,
    edits: input.buildEdits(sourceFile),
  });
}

function main(): void {
  const args = parseArgs(process.argv.slice(2));
  const initialTokens = buildTokens(args);
  const tokens: WireTokens = {
    ...initialTokens,
    routePathsExport: resolveRoutePathExport(initialTokens),
  };
  const changes: FileChange[] = [];

  if (!args.dryRun) {
    assertSliceExistsForWrite(tokens);
  }

  changes.push(
    updateAstFile({
      filePath: path.join(
        repositoryRoot,
        "apps",
        "erp",
        "src",
        "lib",
        "hr-sections",
        "manifest.shared.ts",
      ),
      dryRun: args.dryRun,
      buildEdits: (sourceFile) => appManifestEdits(sourceFile, tokens),
    }),
    updateAstFile({
      filePath: path.join(
        repositoryRoot,
        "apps",
        "erp",
        "src",
        "lib",
        "hr-sections",
        "registry.server.ts",
      ),
      dryRun: args.dryRun,
      buildEdits: (sourceFile) => appRegistryEdits(sourceFile, tokens),
    }),
    updateAstFile({
      filePath: path.join(packageRoot, "src", "metadata.ts"),
      dryRun: args.dryRun,
      buildEdits: (sourceFile) => packageMetadataEdits(sourceFile, tokens),
    }),
    updateAstFile({
      filePath: path.join(packageRoot, "src", "server.ts"),
      dryRun: args.dryRun,
      buildEdits: (sourceFile) => packageServerEdits(sourceFile, tokens),
    }),
    updateAstFile({
      filePath: path.join(
        packageRoot,
        "src",
        "hr-suite-integration",
        "navigation",
        "hr-suite-nav.contract.ts",
      ),
      dryRun: args.dryRun,
      buildEdits: (sourceFile) => navEdits(sourceFile, tokens),
    }),
    updateAstFile({
      filePath: path.join(repositoryRoot, "packages", "auth", "src", "index.ts"),
      dryRun: args.dryRun,
      buildEdits: (sourceFile) => authEdits(sourceFile, tokens),
    }),
    updateAstFile({
      filePath: path.join(
        repositoryRoot,
        "packages",
        "kernel",
        "src",
        "execution-kernel",
        "capabilities",
        "execution-capabilities.ts",
      ),
      dryRun: args.dryRun,
      buildEdits: (sourceFile) => kernelCapabilityEdits(sourceFile, tokens),
    }),
    updateAstFile({
      filePath: path.join(
        repositoryRoot,
        "packages",
        "db",
        "scripts",
        "seed-permissions.mts",
      ),
      dryRun: args.dryRun,
      buildEdits: (sourceFile) => seedPermissionEdits(sourceFile, tokens),
    }),
  );

  if (args.withAdapter) {
    changes.push(createAppAdapterChange({ tokens, dryRun: args.dryRun }));
  }

  const changed = changes.filter((change) => change.changed);
  const mode = args.dryRun ? "dry-run" : "write";
  console.log(
    `[wire:hr-slice] ${mode} ${tokens.featureArea} (${changed.length} files changed)`,
  );
  for (const change of changed) {
    console.log(`- ${relativePath(change.path)}`);
    for (const description of change.descriptions) {
      console.log(`  - ${description}`);
    }
  }
}

try {
  main();
} catch (error) {
  if (process.env.DEBUG_HR_WIRE === "1" && error instanceof Error) {
    console.error(error.stack ?? error.message);
  } else {
    console.error(error instanceof Error ? error.message : String(error));
  }
  process.exit(1);
}

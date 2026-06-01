export type SystemAdminCsvParseResult = {
  headers: readonly string[];
  records: readonly Record<string, string>[];
  errors: readonly string[];
};

function normalizeLineEndings(value: string) {
  return value.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function parseCsvLine(line: string) {
  const cells: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const next = line[index + 1];

    if (char === '"' && inQuotes && next === '"') {
      current += '"';
      index += 1;
      continue;
    }

    if (char === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (char === "," && !inQuotes) {
      cells.push(current.trim());
      current = "";
      continue;
    }

    current += char;
  }

  cells.push(current.trim());
  return { cells, inQuotes };
}

export function parseSystemAdminCsv(input: string): SystemAdminCsvParseResult {
  const lines = normalizeLineEndings(input)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

  if (lines.length === 0) {
    return {
      headers: [],
      records: [],
      errors: ["CSV source did not contain any rows."],
    };
  }

  const headerLine = parseCsvLine(lines[0] ?? "");
  if (headerLine.inQuotes) {
    return {
      headers: [],
      records: [],
      errors: ["CSV header contains an unterminated quoted value."],
    };
  }

  const headers = headerLine.cells.map((header) => header.trim()).filter(Boolean);
  const errors: string[] = [];

  if (headers.length === 0) {
    errors.push("CSV source did not contain headers.");
  }

  if (new Set(headers.map((header) => header.toLowerCase())).size !== headers.length) {
    errors.push("CSV source contains duplicate headers.");
  }

  const records = lines.slice(1).flatMap((line, index) => {
    const parsed = parseCsvLine(line);
    const rowNumber = index + 2;

    if (parsed.inQuotes) {
      errors.push(`Row ${rowNumber} contains an unterminated quoted value.`);
      return [];
    }

    if (parsed.cells.length !== headers.length) {
      errors.push(
        `Row ${rowNumber} has ${parsed.cells.length} cell(s); expected ${headers.length}.`,
      );
      return [];
    }

    return [
      Object.fromEntries(
        headers.map((header, cellIndex) => [header, parsed.cells[cellIndex] ?? ""]),
      ),
    ];
  });

  return { headers, records, errors };
}

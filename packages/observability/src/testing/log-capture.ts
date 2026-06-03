export type CapturedLogLine = {
  level: "log" | "warn" | "error";
  line: string;
};

export function captureConsoleLogs(callback: () => void) {
  const captured: CapturedLogLine[] = [];
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;
  const capture = (
    level: CapturedLogLine["level"],
    values: readonly unknown[],
  ) => {
    captured.push({
      level,
      line: values.map(formatConsoleValue).join(" "),
    });
  };

  console.log = (...values: unknown[]) => {
    capture("log", values);
  };
  console.warn = (...values: unknown[]) => {
    capture("warn", values);
  };
  console.error = (...values: unknown[]) => {
    capture("error", values);
  };

  try {
    callback();
  } finally {
    console.log = originalLog;
    console.warn = originalWarn;
    console.error = originalError;
  }

  return captured;
}

function formatConsoleValue(value: unknown) {
  if (typeof value === "string") {
    return value;
  }

  try {
    return JSON.stringify(value) ?? String(value);
  } catch {
    return String(value);
  }
}

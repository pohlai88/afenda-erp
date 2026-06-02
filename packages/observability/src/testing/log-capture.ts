export type CapturedLogLine = {
  level: "log" | "warn" | "error";
  line: string;
};

export function captureConsoleLogs(callback: () => void) {
  const captured: CapturedLogLine[] = [];
  const originalLog = console.log;
  const originalWarn = console.warn;
  const originalError = console.error;

  console.log = (line: string) => {
    captured.push({ level: "log", line });
  };
  console.warn = (line: string) => {
    captured.push({ level: "warn", line });
  };
  console.error = (line: string) => {
    captured.push({ level: "error", line });
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

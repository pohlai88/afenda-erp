export type NetworkDiagnosisRow = {
  label: string;
  detail: string;
  verdict: "pass" | "warn" | "fail";
};

export async function runNetworkDiagnosisChecks(): Promise<NetworkDiagnosisRow[]> {
  const rows: NetworkDiagnosisRow[] = [];
  rows.push({
    label: "Online state",
    detail: navigator.onLine ? "Browser reports online." : "Browser reports offline.",
    verdict: navigator.onLine ? "pass" : "warn",
  });
  rows.push({
    label: "Cookies",
    detail: navigator.cookieEnabled ? "Cookies enabled." : "Cookies disabled.",
    verdict: navigator.cookieEnabled ? "pass" : "warn",
  });
  rows.push({
    label: "User agent",
    detail: navigator.userAgent,
    verdict: "pass",
  });
  return rows;
}

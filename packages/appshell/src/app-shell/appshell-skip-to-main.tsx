export function AppShellSkipToMain({
  label,
  mainId = "app-shell-main",
}: {
  label: string;
  mainId?: string;
}) {
  return (
    <a
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:border focus:border-border focus:bg-background focus:px-3 focus:py-2 focus:text-sm focus:text-foreground focus:shadow-lg focus:outline-none"
      href={`#${mainId}`}
    >
      {label}
    </a>
  );
}

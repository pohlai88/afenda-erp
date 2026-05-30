/** Minimal chrome for interface-lab — no workspace shell. */
export default function InterfaceLabLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <div className="min-h-dvh bg-background text-foreground">{children}</div>;
}

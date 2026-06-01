import { DevSignInFloatingPanel } from "@/app/(auth)/_components/dev-sign-in-floating-panel";
import { Toaster } from "@afenda/ui/sonner";

export const unstable_instant = {
  prefetch: "static",
  unstable_disableValidation: true,
};

/**
 * Authenticated ERP shell (Next.js route group — URL unchanged).
 * Workspace pages own their route chrome directly.
 */
export default function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      {children}
      <Toaster richColors />
      <DevSignInFloatingPanel />
    </>
  );
}

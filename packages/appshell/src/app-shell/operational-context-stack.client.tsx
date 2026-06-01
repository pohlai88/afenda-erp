"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import {
  APP_SHELL_OPERATIONAL_CONTEXT_PRIORITY,
  appShellOperationalContextStackToEntries,
  type AppShellOperationalContextEntry,
  type AppShellOperationalContextStack,
  type AppShellOperationalContextStackPatch,
} from "./operational-context-stack.shared";

type Registration = {
  id: string;
  priority: number;
  patch: AppShellOperationalContextStackPatch;
};

type OperationalContextRuntime = {
  entries: AppShellOperationalContextEntry[];
  register: (registration: Registration) => () => void;
};

const AppShellOperationalContextRuntimeContext =
  createContext<OperationalContextRuntime | null>(null);

function mergeOperationalContext(
  baseStack: AppShellOperationalContextStack | null,
  registrations: readonly Registration[],
) {
  if (!baseStack) {
    return null;
  }

  const merged: AppShellOperationalContextStack = { ...baseStack };

  for (const registration of [...registrations].sort(
    (a, b) => a.priority - b.priority,
  )) {
    for (const [level, node] of Object.entries(registration.patch)) {
      if (node === null) {
        delete merged[level as keyof AppShellOperationalContextStack];
        continue;
      }

      if (node) {
        merged[level as keyof AppShellOperationalContextStack] = node as never;
      }
    }
  }

  return merged;
}

export function AppShellOperationalContextProvider({
  baseStack,
  children,
}: {
  baseStack: AppShellOperationalContextStack | null;
  children: ReactNode;
}) {
  const [registrations, setRegistrations] = useState<Registration[]>([]);

  const runtime = useMemo<OperationalContextRuntime>(() => {
    const mergedStack = mergeOperationalContext(baseStack, registrations);

    return {
      entries: appShellOperationalContextStackToEntries(mergedStack),
      register(registration) {
        setRegistrations((current) => {
          const filtered = current.filter((item) => item.id !== registration.id);
          return [...filtered, registration];
        });

        return () => {
          setRegistrations((current) =>
            current.filter((item) => item.id !== registration.id),
          );
        };
      },
    };
  }, [baseStack, registrations]);

  return (
    <AppShellOperationalContextRuntimeContext.Provider value={runtime}>
      {children}
    </AppShellOperationalContextRuntimeContext.Provider>
  );
}

export function AppShellOperationalContextRegistration({
  id,
  priority = APP_SHELL_OPERATIONAL_CONTEXT_PRIORITY.surface,
  patch,
}: {
  id: string;
  priority?: number;
  patch: AppShellOperationalContextStackPatch;
}) {
  const runtime = useContext(AppShellOperationalContextRuntimeContext);

  if (!runtime) {
    throw new Error(
      "AppShellOperationalContextRegistration must be used inside AppShellOperationalContextProvider.",
    );
  }

  useEffect(() => runtime.register({ id, priority, patch }), [
    id,
    patch,
    priority,
    runtime,
  ]);

  return null;
}

export function useAppShellOperationalContextEntries() {
  const runtime = useContext(AppShellOperationalContextRuntimeContext);

  if (!runtime) {
    throw new Error(
      "useAppShellOperationalContextEntries must be used inside AppShellOperationalContextProvider.",
    );
  }

  return runtime.entries;
}

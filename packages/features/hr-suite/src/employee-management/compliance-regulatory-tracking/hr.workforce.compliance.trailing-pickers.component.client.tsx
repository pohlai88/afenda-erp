"use client";

import { createContext, useContext, type ReactNode } from "react";

import type { HrComplianceDocumentPickerOption } from "./hr.workforce.compliance-evidence-links.shared";

type ComplianceEmployeePickerOption = {
  value: string;
  label: string;
};

type ComplianceTrailingPickerContextValue = {
  employeeOptions: readonly ComplianceEmployeePickerOption[];
  documentOptions: readonly HrComplianceDocumentPickerOption[];
};

const ComplianceTrailingPickerContext =
  createContext<ComplianceTrailingPickerContextValue>({
    employeeOptions: [],
    documentOptions: [],
  });

export function HrComplianceTrailingPickerProvider({
  employeeOptions,
  documentOptions,
  children,
}: {
  employeeOptions: readonly ComplianceEmployeePickerOption[];
  documentOptions: readonly HrComplianceDocumentPickerOption[];
  children: ReactNode;
}) {
  return (
    <ComplianceTrailingPickerContext.Provider
      value={{ employeeOptions, documentOptions }}
    >
      {children}
    </ComplianceTrailingPickerContext.Provider>
  );
}

export function useHrComplianceTrailingPickers() {
  return useContext(ComplianceTrailingPickerContext);
}

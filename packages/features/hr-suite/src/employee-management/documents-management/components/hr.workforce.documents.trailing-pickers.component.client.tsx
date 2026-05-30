"use client";

import { createContext, useContext, type ReactNode } from "react";

type DocumentsEmployeePickerOption = {
  value: string;
  label: string;
};

type DocumentsTrailingPickerContextValue = {
  employeeOptions: readonly DocumentsEmployeePickerOption[];
};

const DocumentsTrailingPickerContext =
  createContext<DocumentsTrailingPickerContextValue>({
    employeeOptions: [],
  });

export function HrDocumentsTrailingPickerProvider({
  employeeOptions,
  children,
}: {
  employeeOptions: readonly DocumentsEmployeePickerOption[];
  children: ReactNode;
}) {
  return (
    <DocumentsTrailingPickerContext.Provider value={{ employeeOptions }}>
      {children}
    </DocumentsTrailingPickerContext.Provider>
  );
}

export function useHrDocumentsTrailingPickers() {
  return useContext(DocumentsTrailingPickerContext);
}

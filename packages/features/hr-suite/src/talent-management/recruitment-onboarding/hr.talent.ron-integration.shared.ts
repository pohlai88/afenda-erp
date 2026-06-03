import type {
  HrRonCandidateConversionReference,
  HrRonStore,
} from "./hr.talent.ron-store.shared";

export type HrRonEmployeeRecordsConversionRef =
  HrRonCandidateConversionReference;

export type HrRonPayrollReadinessRef = {
  employeeReferenceId: string;
  salaryAmount: number;
  salaryCurrency: string;
  payrollReady: boolean;
};

export type HrRonDocumentReadinessRef = {
  employeeReferenceId: string;
  requiredDocumentCount: number;
  completedDocumentCount: number;
};

export type HrRonLifecycleReadinessRef = {
  employeeReferenceId: string;
  lifecycleReady: boolean;
};

export function listHrRonEmployeeRecordsConversionRefs(input: {
  store: HrRonStore;
  authorized: boolean;
}): readonly HrRonEmployeeRecordsConversionRef[] {
  return input.authorized ? input.store.conversions : [];
}

export function listHrRonPayrollReadinessRefs(input: {
  store: HrRonStore;
  authorized: boolean;
}): readonly HrRonPayrollReadinessRef[] {
  if (!input.authorized) {
    return [];
  }
  return input.store.conversions.map((conversion) => ({
    employeeReferenceId: conversion.employeeReferenceId,
    salaryAmount: conversion.salaryAmount,
    salaryCurrency: conversion.salaryCurrency,
    payrollReady: input.store.readiness.some(
      (snapshot) =>
        snapshot.employeeReferenceId === conversion.employeeReferenceId &&
        snapshot.domain === "payroll" &&
        snapshot.status === "completed",
    ),
  }));
}

export function listHrRonDocumentReadinessRefs(input: {
  store: HrRonStore;
  authorized: boolean;
}): readonly HrRonDocumentReadinessRef[] {
  if (!input.authorized) {
    return [];
  }
  return input.store.conversions.map((conversion) => {
    const tasks = input.store.onboardingTasks.filter(
      (task) =>
        task.employeeReferenceId === conversion.employeeReferenceId &&
        task.documentReference != null,
    );
    return {
      employeeReferenceId: conversion.employeeReferenceId,
      requiredDocumentCount: tasks.length,
      completedDocumentCount: tasks.filter((task) => task.status === "completed")
        .length,
    };
  });
}

export function listHrRonLifecycleReadinessRefs(input: {
  store: HrRonStore;
  authorized: boolean;
}): readonly HrRonLifecycleReadinessRef[] {
  if (!input.authorized) {
    return [];
  }
  return input.store.conversions.map((conversion) => ({
    employeeReferenceId: conversion.employeeReferenceId,
    lifecycleReady: input.store.readiness.some(
      (snapshot) =>
        snapshot.employeeReferenceId === conversion.employeeReferenceId &&
        snapshot.domain === "employee_lifecycle" &&
        snapshot.status === "completed",
    ),
  }));
}

"use client";

import { useParams } from "next/navigation";

import { HR_MODULE_ID } from "@/lib/hr-route.shared";

import {
  HrCompliancePageSkeleton,
  SystemAdminSectionSkeleton,
} from "./route-states";

export function ModuleSectionRouteSkeleton() {
  const params = useParams<{ moduleId?: string }>();

  if (params.moduleId === HR_MODULE_ID) {
    return <HrCompliancePageSkeleton />;
  }

  return <SystemAdminSectionSkeleton />;
}

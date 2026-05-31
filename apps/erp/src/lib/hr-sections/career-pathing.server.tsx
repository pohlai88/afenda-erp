import { hrTalentCareerPathingUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  HrCareerPathingAccessDeniedPanel,
  HrCareerPathingSection,
  buildHrCareerPathPageModel,
  requireHrCareerPathingRead,
  toHrCareerPathingPageModelInput,
} from "@afenda/feature-hr-suite/server";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: `${hrTalentCareerPathingUiCopy.page.title} — HR`,
  description: hrTalentCareerPathingUiCopy.page.description,
};

export default async function HrCareerPathingPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : undefined;

  let guard: Awaited<ReturnType<typeof requireHrCareerPathingRead>>;

  try {
    guard = await requireHrCareerPathingRead();
  } catch {
    return <HrCareerPathingAccessDeniedPanel />;
  }

  const pageModel = await buildHrCareerPathPageModel(
    toHrCareerPathingPageModelInput({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      canWrite: guard.canWrite,
      searchParams: resolvedSearchParams,
    }),
  );

  return <HrCareerPathingSection pageModel={pageModel} />;
}

import { hrTalentCareerPathingUiCopy } from "@afenda/feature-hr-suite/metadata";
import {
  HrTalentCareerPathingAccessDeniedPanel,
  HrTalentCareerPathingPage,
  buildHrTalentCareerPathingPageModel,
  requireHrTalentRead,
  toHrTalentCareerPathingPageModelInput,
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

  let guard: Awaited<ReturnType<typeof requireHrTalentRead>>;

  try {
    guard = await requireHrTalentRead();
  } catch {
    return <HrTalentCareerPathingAccessDeniedPanel />;
  }

  const pageModel = await buildHrTalentCareerPathingPageModel(
    toHrTalentCareerPathingPageModelInput({
      organizationId: guard.organization.id,
      actorAuthUserId: guard.session.id,
      canWrite: guard.canWriteTalent,
      searchParams: resolvedSearchParams,
    }),
  );

  return (
    <HrTalentCareerPathingPage
      model={pageModel}
      canWrite={guard.canWriteTalent}
    />
  );
}

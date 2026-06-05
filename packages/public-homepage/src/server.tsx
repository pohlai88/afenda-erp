import "server-only";

import { Suspense } from "react";

import { HomepageShell } from "./pub-homepage-shell-server";
import { homepageContent } from "./pub-homepage-content";
import { homepageContentSchema } from "./pub-homepage-schema";
import { buildHomepageMetadata } from "./pub-homepage-seo";

const content = homepageContentSchema.parse(homepageContent);

export const metadata = buildHomepageMetadata(content);

type SearchParams =
  | Promise<Record<string, string | string[] | undefined>>
  | Record<string, string | string[] | undefined>;

export default async function PublicHomepageRoute({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  return (
    <Suspense fallback={<HomepageShell />}>
      <PublicHomepageRouteContent searchParams={searchParams} />
    </Suspense>
  );
}

async function PublicHomepageRouteContent({
  searchParams,
}: {
  searchParams?: SearchParams;
}) {
  const resolvedSearchParams = searchParams ? await searchParams : {};
  const intro = resolvedSearchParams.intro;
  const initialSkip = intro === "0";

  return <HomepageShell initialSkip={initialSkip} />;
}

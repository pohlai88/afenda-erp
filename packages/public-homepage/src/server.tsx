import "server-only";

import { HomepageShell } from "./components/homepage-shell.server";
import { homepageContent } from "./content/homepage.content";
import { homepageContentSchema } from "./schemas/homepage.schema";
import { buildHomepageMetadata } from "./seo/homepage-seo";

const content = homepageContentSchema.parse(homepageContent);

export const metadata = buildHomepageMetadata(content);

export default function PublicHomepageRoute() {
  return <HomepageShell />;
}

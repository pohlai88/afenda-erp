import "server-only";

import { HomepageShell } from "./pub-homepage-shell-server";
import { homepageContent } from "./pub-homepage-content";
import { homepageContentSchema } from "./pub-homepage-schema";
import { buildHomepageMetadata } from "./pub-homepage-seo";

const content = homepageContentSchema.parse(homepageContent);

export const metadata = buildHomepageMetadata(content);

export default function PublicHomepageRoute() {
  return <HomepageShell />;
}

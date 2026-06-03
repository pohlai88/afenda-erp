import type { Metadata } from "next";

import type { HomepageContent } from "./pub-homepage-schema";

export function buildHomepageMetadata(content: HomepageContent): Metadata {
  return {
    title: content.title,
    description: content.description,
    alternates: {
      canonical: "/",
    },
  };
}

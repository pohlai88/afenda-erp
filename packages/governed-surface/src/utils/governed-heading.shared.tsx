import type { ComponentPropsWithoutRef, ReactNode } from "react";

import { cn } from "@afenda/ui/utils";

export type GovernedHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;

export type GovernedHeadingVariant =
  | "page"
  | "section"
  | "card"
  | "subsection"
  | "inline";

const HEADING_TAGS = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const;

const HEADING_VARIANT_CLASS: Record<GovernedHeadingVariant, string> = {
  page: "type-page-title",
  section: "type-section-title",
  card: "type-subtitle",
  subsection: "type-label",
  inline: "type-control font-medium",
};

export type GovernedHeadingProps = {
  level: GovernedHeadingLevel;
  variant?: GovernedHeadingVariant;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"h1">, "children">;

export function GovernedHeading({
  level,
  variant,
  children,
  className,
  ...props
}: GovernedHeadingProps) {
  const Tag = HEADING_TAGS[level];

  return (
    <Tag
      {...props}
      className={cn(variant ? HEADING_VARIANT_CLASS[variant] : undefined, className)}
    >
      {children}
    </Tag>
  );
}

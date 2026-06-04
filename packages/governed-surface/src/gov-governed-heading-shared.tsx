import type { ComponentPropsWithoutRef, JSX, ReactNode } from "react";
import { cn } from "@afenda/ui/utils";

export type GovernedHeadingLevel = 1 | 2 | 3 | 4 | 5 | 6;
export type GovernedHeadingVariant =
  | "page"
  | "section"
  | "card"
  | "subsection"
  | "inline";

export type GovernedHeadingProps = {
  level: GovernedHeadingLevel;
  variant?: GovernedHeadingVariant;
  children: ReactNode;
} & Omit<ComponentPropsWithoutRef<"h1">, "children">;

const headingTags = {
  1: "h1",
  2: "h2",
  3: "h3",
  4: "h4",
  5: "h5",
  6: "h6",
} as const satisfies Record<GovernedHeadingLevel, keyof JSX.IntrinsicElements>;

const headingVariantClass = {
  page: "type-page-title",
  section: "type-section-title",
  card: "type-subtitle",
  subsection: "type-label",
  inline: "type-control font-medium",
} as const satisfies Record<GovernedHeadingVariant, string>;

export function GovernedHeading({
  level,
  variant,
  children,
  className,
  ...props
}: GovernedHeadingProps) {
  const Tag = headingTags[level];

  return (
    <Tag
      {...props}
      className={cn(variant ? headingVariantClass[variant] : undefined, className)}
    >
      {children}
    </Tag>
  );
}

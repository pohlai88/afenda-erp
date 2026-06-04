"use client";

import { useState, type FormHTMLAttributes } from "react";
import { cn } from "@afenda/ui/utils";

export type MetadataUiClientFormProps =
  FormHTMLAttributes<HTMLFormElement> &
    Readonly<{
      metadataState?: string;
    }>;

export function MetadataUiClientForm({
  className,
  metadataState = "clean",
  onChange,
  ...props
}: MetadataUiClientFormProps) {
  const [dirty, setDirty] = useState(false);

  return (
    <form
      className={cn("grid gap-surface-md", className)}
      data-metadata-ui-form-state={metadataState}
      data-metadata-ui-form-dirty={dirty || metadataState === "dirty"}
      onChange={(event) => {
        setDirty(true);
        onChange?.(event);
      }}
      {...props}
    />
  );
}

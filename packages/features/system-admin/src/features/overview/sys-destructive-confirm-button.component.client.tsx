"use client";

import type { ActionDescriptor } from "@afenda/governed-surface/schemas";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@afenda/ui/alert-dialog";
import { Button } from "@afenda/ui/button";
import type { ComponentProps, ReactNode } from "react";

export type SystemAdminDestructiveConfirmCopy = NonNullable<
  ActionDescriptor["confirm"]
>;

export function SystemAdminDestructiveConfirmButton({
  confirm,
  onConfirm,
  disabled,
  variant = "destructive",
  size = "sm",
  children,
}: {
  confirm: SystemAdminDestructiveConfirmCopy;
  onConfirm: () => void;
  disabled?: boolean;
  variant?: ComponentProps<typeof Button>["variant"];
  size?: ComponentProps<typeof Button>["size"];
  children: ReactNode;
}) {
  const confirmVariant = variant === "destructive" ? "destructive" : "default";

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button type="button" size={size} variant={variant} disabled={disabled}>
          {children}
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{confirm.title}</AlertDialogTitle>
          {confirm.description ? (
            <AlertDialogDescription>{confirm.description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction variant={confirmVariant} onClick={onConfirm}>
            {confirm.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

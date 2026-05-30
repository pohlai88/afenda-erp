"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@afenda/ui/dialog";

/** Static open dialog for screenshot regression (layer 4 visual gate). */
export function DialogOpenFixture() {
  return (
    <section
      className="flex flex-col gap-surface-md rounded-card border border-border bg-card p-surface-md"
      data-visual-fixture="dialog-open"
    >
      <Dialog defaultOpen>
        <DialogContent className="relative inset-auto top-auto left-auto translate-x-0 translate-y-0">
          <DialogHeader>
            <DialogTitle>Confirm assignment</DialogTitle>
            <DialogDescription>
              Preview surface for modal spacing, radius, and elevation tokens.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </section>
  );
}

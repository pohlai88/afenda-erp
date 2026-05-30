/**
 * Interface lab — primitive preview matrix for visual regression.
 *
 * Route: /interface-lab/primitives
 */
import { Button } from "@afenda/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@afenda/ui/dialog";
import { Input } from "@afenda/ui/input";
import { Label } from "@afenda/ui/label";

import { DialogOpenFixture } from "./dialog-open-fixture.client";

export default function InterfaceLabPrimitivesPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-surface-lg p-surface-lg">
      <header className="flex flex-col gap-surface-xs">
        <h1 className="type-page-title">Interface lab — primitives</h1>
        <p className="type-muted">
          Approved previews for Playwright visual regression (`pnpm test:visual`).
        </p>
      </header>

      <section
        className="flex flex-col gap-surface-md rounded-card border border-border bg-card p-surface-md"
        data-visual-fixture="button-matrix"
      >
        <h2 className="type-section-title">Button</h2>
        <div className="flex flex-wrap gap-surface-sm">
          <Button variant="default">Default</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="link">Link</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      <section
        className="flex flex-col gap-surface-md rounded-card border border-border bg-card p-surface-md"
        data-visual-fixture="input-field"
      >
        <h2 className="type-section-title">Input</h2>
        <div className="flex flex-col gap-surface-xs">
          <Label htmlFor="lab-input">Employee ID</Label>
          <Input id="lab-input" placeholder="EMP-001" />
          <Input disabled placeholder="Disabled" />
        </div>
      </section>

      <section
        className="flex flex-col gap-surface-md rounded-card border border-border bg-card p-surface-md"
        data-visual-fixture="dialog-trigger"
      >
        <h2 className="type-section-title">Dialog trigger</h2>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline">Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm assignment</DialogTitle>
              <DialogDescription>
                Interactive trigger — use dialog-open fixture for snapshots.
              </DialogDescription>
            </DialogHeader>
          </DialogContent>
        </Dialog>
      </section>

      <DialogOpenFixture />
    </main>
  );
}

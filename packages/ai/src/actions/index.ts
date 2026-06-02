/**
 * Action operations for the AI machine layer.
 *
 * This bucket aggregates all state-mutation actions available in @afenda/ai:
 * - Sandbox lifecycle: create → approve/reject/discard → execute
 * - Executor registration and dispatch
 *
 * All write-path actions route through the sandbox/approval flow.
 * Direct table writes from AI tool execute bodies are prohibited.
 */

// ---------------------------------------------------------------------------
// Sandbox lifecycle actions
// ---------------------------------------------------------------------------

export {
  createActionSandbox,
  approveActionSandbox,
  rejectActionSandbox,
  discardActionSandbox,
  type CreateActionSandboxInput,
} from "./ai.sandbox.actions.server";

// Sandbox DB executors live in @afenda/feature-system-admin (lynx/data) per ARCH-1002.

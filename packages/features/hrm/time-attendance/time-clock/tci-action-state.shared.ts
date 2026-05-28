/**
 * Client-serializable Server Action result shapes for time-clock integration.
 * Keep out of `"use server"` modules — Next.js action stubs export async functions only.
 */

export type TimeClockMutationFormState =
  | { ok: true; deviceId: string }
  | { ok: false; errors: Record<string, string | undefined> }

export type TimeClockDeviceMutationFormState = TimeClockMutationFormState

export type TimeClockExceptionDecisionFormState =
  | { ok: true; exceptionId: string; eventId?: string }
  | { ok: false; errors: Record<string, string | undefined> }

export type ReplayOfflineTimeClockBatchFormState =
  | {
      ok: true
      batchId: string
      accepted: number
      duplicates: number
      rejected: number
    }
  | { ok: false; errors: Record<string, string | undefined> }

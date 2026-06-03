import {
  requireExecutionContext,
  resolveExecutionContext,
} from "@afenda/kernel/server";
import { cache } from "react";

export const getWorkspaceExecutionContext = cache(resolveExecutionContext);
export const requireWorkspaceExecutionContext = cache(requireExecutionContext);

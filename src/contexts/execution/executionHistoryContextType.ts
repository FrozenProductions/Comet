import { createContext } from "react";
import type { ExecutionHistoryContextType } from "../../types/execution/executionHistory";

export const ExecutionHistoryContext =
    createContext<ExecutionHistoryContextType | null>(null);

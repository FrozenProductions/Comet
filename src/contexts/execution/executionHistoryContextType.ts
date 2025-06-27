import { createContext } from "react";
import type { ExecutionHistoryContextType } from "../../types/execution";

export const ExecutionHistoryContext = createContext<ExecutionHistoryContextType | null>(null); 
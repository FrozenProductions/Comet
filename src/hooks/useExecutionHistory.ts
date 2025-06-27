import { useContext } from "react";
import { ExecutionHistoryContext } from "../contexts/execution/executionHistoryContextType";
import type { ExecutionHistoryContextType } from "../types/execution";

export const useExecutionHistory = (): ExecutionHistoryContextType => {
    const context = useContext(ExecutionHistoryContext);
    if (!context) {
        throw new Error("useExecutionHistory must be used within an ExecutionHistoryProvider");
    }
    return context;
}; 
import { useContext } from "react";
import { ExecutionHistoryContext } from "../../contexts/execution/executionHistoryContextType";
import type { ExecutionHistoryContextType } from "../../types/execution/executionHistory";

/**
 * Hook for accessing execution history state and functionality
 * Must be used within an ExecutionHistoryProvider component
 * Returns execution history context containing state and methods for managing execution history
 */
export const useExecutionHistory = (): ExecutionHistoryContextType => {
    const context = useContext(ExecutionHistoryContext);
    if (!context) {
        throw new Error(
            "useExecutionHistory must be used within an ExecutionHistoryProvider",
        );
    }
    return context;
};

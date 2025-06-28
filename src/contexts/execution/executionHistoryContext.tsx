import { FC, ReactNode, useCallback, useState, useEffect } from "react";
import { nanoid } from "nanoid";
import type { ExecutionRecord } from "../../types/executionHistory";
import { loadExecutionHistory, saveExecutionRecord, clearExecutionHistory } from "../../services/executionHistoryService";
import { ExecutionHistoryContext } from "./executionHistoryContextType";

export const ExecutionHistoryProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [history, setHistory] = useState<ExecutionRecord[]>([]);

    useEffect(() => {
        const initHistory = async () => {
            const loadedHistory = await loadExecutionHistory();
            setHistory(loadedHistory);
        };

        initHistory();
    }, []);

    const addExecution = useCallback(async (execution: Omit<ExecutionRecord, "id" | "timestamp">) => {
        const newExecution: ExecutionRecord = {
            ...execution,
            id: nanoid(),
            timestamp: Date.now(),
        };

        try {
            await saveExecutionRecord(newExecution);
            setHistory((prev) => [newExecution, ...prev]);
        } catch (error) {
            console.error("Failed to save execution record:", error);
        }
    }, []);

    const clearHistory = useCallback(async () => {
        try {
            await clearExecutionHistory();
            setHistory([]);
        } catch (error) {
            console.error("Failed to clear execution history:", error);
        }
    }, []);

    return (
        <ExecutionHistoryContext.Provider
            value={{
                history,
                addExecution,
                clearHistory,
            }}
        >
            {children}
        </ExecutionHistoryContext.Provider>
    );
}; 
import { invoke } from "@tauri-apps/api/tauri";
import type { ExecutionRecord } from "../../types/execution/executionHistory";

/**
 * Loads the execution history from storage
 * Returns an array of execution records or empty array if loading fails
 */
export const loadExecutionHistory = async (): Promise<ExecutionRecord[]> => {
    try {
        return await invoke<ExecutionRecord[]>("load_execution_history");
    } catch (error) {
        console.error("Failed to load execution history:", error);
        return [];
    }
};

/**
 * Saves a single execution record to storage
 * @param record The execution record to save
 * @param maxItems The maximum number of records to keep
 */
export const saveExecutionRecord = async (
    record: ExecutionRecord,
    maxItems: number,
): Promise<void> => {
    try {
        await invoke("save_execution_record", { record, maxItems });
    } catch (error) {
        console.error("Failed to save execution record:", error);
    }
};

/**
 * Clears all execution history from storage
 */
export const clearExecutionHistory = async (): Promise<void> => {
    try {
        await invoke("clear_execution_history");
    } catch (error) {
        console.error("Failed to clear execution history:", error);
    }
};

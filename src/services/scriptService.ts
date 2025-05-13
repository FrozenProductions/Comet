import { invoke } from "@tauri-apps/api/tauri";
import type { ScriptExecutionResult } from "../types/script";

export const scriptService = {
    async executeScript(script: string): Promise<ScriptExecutionResult> {
        try {
            await invoke("execute_script", { script });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            };
        }
    },

    async saveScript(
        path: string,
        content: string
    ): Promise<ScriptExecutionResult> {
        try {
            await invoke("save_script", { path, content });
            return { success: true };
        } catch (error) {
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            };
        }
    },
};

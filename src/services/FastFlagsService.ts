import { invoke } from "@tauri-apps/api/tauri";
import { FastFlagsResponse } from "../types/fastFlags";

export class FastFlagsService {
    private static serializeValue(value: string): any {
        if (!isNaN(Number(value))) {
            return Number(value);
        }

        if (value.toLowerCase() === "true") return true;
        if (value.toLowerCase() === "false") return false;

        return value;
    }

    private static serializeFlags(
        flags: Record<string, any>,
    ): Record<string, any> {
        const serialized: Record<string, any> = {};
        for (const [key, value] of Object.entries(flags)) {
            serialized[key] =
                typeof value === "string" ? this.serializeValue(value) : value;
        }
        return serialized;
    }

    static async readFlags(): Promise<FastFlagsResponse> {
        try {
            const response = await invoke<FastFlagsResponse>("read_fast_flags");
            return response;
        } catch (error) {
            console.error("[FastFlags] Error reading flags:", error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            };
        }
    }

    static async saveFlags(
        flags: Record<string, any>,
    ): Promise<FastFlagsResponse> {
        try {
            const serializedFlags = this.serializeFlags(flags);
            const response = await invoke<FastFlagsResponse>(
                "save_fast_flags",
                { flags: serializedFlags },
            );
            return response;
        } catch (error) {
            console.error("[FastFlags] Error saving flags:", error);
            return {
                success: false,
                error:
                    error instanceof Error
                        ? error.message
                        : "Unknown error occurred",
            };
        }
    }
}

/**
 * Cleans up the fast flags file after profile deletion
 * @returns Object containing success status and optional error message
 * @throws Error if the cleanup operation fails
 */
export const cleanupFastFlags = async (): Promise<{
    success: boolean;
    error?: string;
}> => {
    try {
        return await invoke<{ success: boolean; error?: string }>(
            "cleanup_fast_flags",
        );
    } catch (error) {
        console.error("Failed to clean up fast flags file:", error);
        throw error;
    }
};

/**
 * Opens the fast flags directory in the system file explorer
 * @throws Error if the directory cannot be opened
 */
export const openFastFlagsDirectory = async (): Promise<void> => {
    try {
        await invoke("open_fast_flags_directory");
    } catch (error) {
        console.error("Failed to open fast flags directory:", error);
        throw error;
    }
};

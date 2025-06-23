import { invoke } from "@tauri-apps/api/tauri";
import { FastFlagsResponse } from "../types/fastFlags";
import { FastFlagCategory } from "../types/fastFlags";

const serializeValue = (value: string): any => {
    if (!isNaN(Number(value))) {
        return Number(value);
    }

    if (value.toLowerCase() === "true") return true;
    if (value.toLowerCase() === "false") return false;

    return value;
};

const serializeFlags = (flags: Record<string, any>): Record<string, any> => {
    const serialized: Record<string, any> = {};
    for (const [key, value] of Object.entries(flags)) {
        serialized[key] =
            typeof value === "string" ? serializeValue(value) : value;
    }
    return serialized;
};

/**
 * Reads fast flags from storage
 * @returns Promise with fast flags response
 * @throws Error if reading flags fails
 */
export const readFlags = async (): Promise<FastFlagsResponse> => {
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
};

/**
 * Saves fast flags to storage
 * @param flags Record of flags to save
 * @returns Promise with save operation response
 * @throws Error if saving flags fails
 */
export const saveFlags = async (
    flags: Record<string, any>,
): Promise<FastFlagsResponse> => {
    try {
        const serializedFlags = serializeFlags(flags);
        const response = await invoke<FastFlagsResponse>("save_fast_flags", {
            flags: serializedFlags,
        });
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
};

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
 * Fetches fast flag categories from the backend
 * @returns Promise with fast flag categories
 * @throws Error if fetching categories fails
 */
export const getFastFlagCategories = async (): Promise<
    Record<string, FastFlagCategory>
> => {
    try {
        return await invoke<Record<string, FastFlagCategory>>(
            "get_fast_flag_categories",
        );
    } catch (error) {
        console.error("[FastFlags] Error fetching categories:", error);
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

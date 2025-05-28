import { invoke } from "@tauri-apps/api/tauri";

export const FlagValidationService = {
    async validateFlags(flags: string[]): Promise<string[]> {
        return await invoke<string[]>("validate_flags", { flags });
    },

    async refreshValidationCache(): Promise<void> {
        await invoke("refresh_flag_validation_cache");
    },
};

/**
 * Refreshes the flag validation cache
 * @throws Error if the refresh operation fails
 */
export const refreshFlagValidationCache = async (): Promise<void> => {
    try {
        await invoke("refresh_flag_validation_cache");
    } catch (error) {
        console.error("Failed to refresh flag validation cache:", error);
        throw error;
    }
};

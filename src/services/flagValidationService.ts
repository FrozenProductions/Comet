import { invoke } from "@tauri-apps/api/tauri";

/**
 * Validates a list of flags
 * @param flags Array of flags to validate
 * @returns Array of valid flags
 * @throws Error if validation fails
 */
export const validateFlags = async (flags: string[]): Promise<string[]> => {
	try {
		return await invoke<string[]>("validate_flags", { flags });
	} catch (error) {
		console.error("Failed to validate flags:", error);
		throw error;
	}
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

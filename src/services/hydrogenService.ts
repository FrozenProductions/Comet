import { invoke } from "@tauri-apps/api/tauri";

/**
 * Checks if Hydrogen is installed on the system
 * @returns Promise that resolves to boolean indicating if Hydrogen is installed
 * @throws Error if the check operation fails
 */
export const checkHydrogenInstallation = async (): Promise<boolean> => {
    try {
        return await invoke<boolean>("check_hydrogen_installation");
    } catch (error) {
        console.error("Failed to check Hydrogen installation:", error);
        throw error;
    }
};

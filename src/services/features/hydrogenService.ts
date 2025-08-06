import { invoke } from "@tauri-apps/api/tauri";

/**
 * Checks if executor is installed on the system
 * @returns Promise that resolves to boolean indicating if executor is installed
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

/**
 * Installs the executor on the system
 * @throws Error if the installation fails
 */
export const installHydrogen = async (): Promise<void> => {
    try {
        await invoke("install_app");
    } catch (error) {
        console.error("Failed to install Hydrogen:", error);
        throw error;
    }
};

import { invoke } from "@tauri-apps/api/tauri";

/**
 * Checks if executor is installed on the system
 * @returns Promise that resolves to boolean indicating if executor is installed
 * @throws Error if the check operation fails
 */
export const checkExecutorInstallation = async (): Promise<boolean> => {
    try {
        return await invoke<boolean>("check_executor_installation");
    } catch (error) {
        console.error("Failed to check executor installation:", error);
        throw error;
    }
};

/**
 * Installs the executor on the system
 * @throws Error if the installation fails
 */
export const installExecutor = async (): Promise<void> => {
    try {
        await invoke("install_app");
    } catch (error) {
        console.error("Failed to install executor:", error);
        throw error;
    }
};

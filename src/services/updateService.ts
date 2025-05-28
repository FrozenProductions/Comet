import { invoke } from "@tauri-apps/api/tauri";

/**
 * Checks for available updates for the application
 * @param checkNightly Whether to check for nightly releases
 * @returns Promise that resolves to update check result
 */
export const checkForUpdates = async (
    checkNightly: boolean,
): Promise<string | null> => {
    try {
        return await invoke<string | null>("check_for_updates", {
            checkNightly,
        });
    } catch (error) {
        console.error("Failed to check for updates:", error);
        throw error;
    }
};

/**
 * Downloads and installs an available update
 * @param checkNightly Whether to check for nightly releases
 * @throws Error if the update installation fails
 */
export const downloadAndInstallUpdate = async (
    checkNightly: boolean,
): Promise<void> => {
    try {
        await invoke("download_and_install_update", {
            checkNightly,
        });
    } catch (error) {
        console.error("Failed to download and install update:", error);
        throw error;
    }
};

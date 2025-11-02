import { invoke } from "@tauri-apps/api/tauri";

/**
 * The `uninstallApp` function uses Tauri API to uninstall the app asynchronously and throws an error
 * if the operation fails.
 */
export const uninstallApp = async (): Promise<void> => {
    try {
        await invoke("uninstall_app");
    } catch (error) {
        throw new Error(`Failed to uninstall app: ${error}`);
    }
};

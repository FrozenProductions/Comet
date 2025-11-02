import { invoke } from "@tauri-apps/api/tauri";

export const uninstallApp = async (): Promise<void> => {
    try {
        await invoke("uninstall_app");
    } catch (error) {
        throw new Error(`Failed to uninstall app: ${error}`);
    }
};

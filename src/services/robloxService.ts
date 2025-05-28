import { invoke } from "@tauri-apps/api/tauri";

/**
 * Opens Roblox application
 * @throws Error if Roblox cannot be opened
 */
export const openRoblox = async (): Promise<void> => {
    try {
        await invoke("open_roblox");
    } catch (error) {
        console.error("Failed to open Roblox:", error);
        throw error;
    }
};

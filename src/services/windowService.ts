import { invoke } from "@tauri-apps/api/tauri";

export const WindowService = {
    async closeWindow(): Promise<void> {
        await invoke("close_window");
    },

    async minimizeWindow(): Promise<void> {
        await invoke("minimize_window");
    },

    async toggleMaximizeWindow(): Promise<void> {
        await invoke("toggle_maximize_window");
    },
};

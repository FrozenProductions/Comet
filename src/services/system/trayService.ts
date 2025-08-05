import { invoke } from "@tauri-apps/api/tauri";
import type { TrayConfig } from "../../types/system/tray";

/**
 * Retrieves the current tray configuration from the system
 * @returns Promise containing the current tray configuration
 * @throws Error if the configuration cannot be retrieved
 */
export const getTrayConfig = async (): Promise<TrayConfig> => {
    return invoke<TrayConfig>("get_tray_config");
};

/**
 * Saves the tray configuration and updates the tray menu
 * @param config The tray configuration to save
 * @throws Error if the configuration cannot be saved or the menu cannot be updated
 */
export const saveTrayConfig = async (config: TrayConfig): Promise<void> => {
    await invoke("save_tray_config", { config });
    await invoke("update_tray_menu");
};

/**
 * Updates the system tray menu with the current configuration
 * @throws Error if the menu cannot be updated
 */
export const updateTrayMenu = async (): Promise<void> => {
    await invoke("update_tray_menu");
};

/**
 * Adds a new custom script to the tray menu
 * @param name The display name of the script
 * @param content The Lua script content
 * @throws Error if the script cannot be added
 */
export const addCustomTrayScript = async (
    name: string,
    content: string,
): Promise<void> => {
    await invoke("add_custom_tray_script", { name, content });
};

/**
 * Removes a custom script from the tray menu
 * @param id The unique identifier of the script to remove
 * @throws Error if the script cannot be removed
 */
export const removeCustomTrayScript = async (id: string): Promise<void> => {
    await invoke("remove_custom_tray_script", { id });
};

import { invoke } from "@tauri-apps/api/tauri";

/**
 * Checks if the application is configured to launch at system startup
 * @returns Promise resolving to boolean indicating if login item is enabled
 */
export const isLoginItemEnabled = async (): Promise<boolean> => {
	return invoke<boolean>("is_login_item_enabled");
};

/**
 * Toggles the application's launch at system startup setting
 * @param enabled Boolean to enable or disable login item
 */
export const toggleLoginItem = async (enabled: boolean): Promise<void> => {
	return invoke("toggle_login_item", { enabled });
};

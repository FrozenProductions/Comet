import { invoke } from "@tauri-apps/api/tauri";

export const isLoginItemEnabled = async (): Promise<boolean> => {
	return invoke<boolean>("is_login_item_enabled");
};

export const toggleLoginItem = async (enabled: boolean): Promise<void> => {
	return invoke("toggle_login_item", { enabled });
};

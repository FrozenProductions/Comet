import { invoke } from "@tauri-apps/api/tauri";

/**
 * Checks if the current build is an official Comet release
 * @returns A promise that resolves to a boolean indicating if the app is official
 */
export async function checkIsOfficialApp(): Promise<boolean> {
	try {
		return await invoke<boolean>("is_official_app");
	} catch (error) {
		console.error("Failed to check if app is official:", error);
		return false;
	}
}

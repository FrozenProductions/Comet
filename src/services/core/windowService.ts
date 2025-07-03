import { invoke } from "@tauri-apps/api/tauri";

/**
 * Closes the application window
 * @throws Error if the window cannot be closed
 */
export const closeWindow = async (): Promise<void> => {
	await invoke("close_window");
};

/**
 * Minimizes the application window
 * @throws Error if the window cannot be minimized
 */
export const minimizeWindow = async (): Promise<void> => {
	await invoke("minimize_window");
};

/**
 * Toggles the window between maximized and normal state
 * @throws Error if the window state cannot be toggled
 */
export const toggleMaximizeWindow = async (): Promise<void> => {
	await invoke("toggle_maximize_window");
};

/**
 * Opens the Comet application folder in the system file explorer
 * @throws Error if the folder cannot be opened
 */
export const openCometFolder = async (): Promise<void> => {
	try {
		await invoke("open_comet_folder");
	} catch (error) {
		console.error("Failed to open Comet folder:", error);
		throw error;
	}
};

/**
 * Opens the Hydrogen folder in the system file explorer
 * @throws Error if the folder cannot be opened
 */
export const openHydrogenFolder = async (): Promise<void> => {
	try {
		await invoke("open_hydrogen_folder");
	} catch (error) {
		console.error("Failed to open Hydrogen folder:", error);
		throw error;
	}
};

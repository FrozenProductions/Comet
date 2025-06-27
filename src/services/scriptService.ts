import { invoke } from "@tauri-apps/api/tauri";
import type { ScriptExecutionResult } from "../types/script";
import type { Tab } from "../types/editor";

/**
 * Executes a Lua script through the Hydrogen API
 * @param script The Lua script to execute
 * @returns Promise that resolves to the execution result
 * @throws Error if the script execution fails
 */
export const executeScript = async (
	script: string,
): Promise<ScriptExecutionResult> => {
	try {
		await invoke("execute_script", { script });
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
};

/**
 * Saves a script to the filesystem
 * @param path The path where to save the script
 * @param content The content of the script
 * @returns Promise that resolves to the save operation result
 * @throws Error if the save operation fails
 */
export const saveScript = async (
	path: string,
	content: string,
): Promise<ScriptExecutionResult> => {
	try {
		await invoke("save_script", { path, content });
		return { success: true };
	} catch (error) {
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
};

/**
 * Saves a tab to the workspace
 * @param workspaceId The ID of the workspace
 * @param tab The tab to save
 * @throws Error if the save operation fails
 */
export const saveTab = async (workspaceId: string, tab: Tab): Promise<void> => {
	try {
		await invoke("save_tab", { workspaceId, tab });
	} catch (error) {
		console.error("Failed to save tab:", error);
		throw error;
	}
};

/**
 * Saves the current tab state
 * @param workspaceId The ID of the workspace
 * @param activeTab The ID of the active tab
 * @param tabOrder The order of tabs
 * @param tabs The tabs to save
 * @throws Error if the save operation fails
 */
export const saveTabState = async (
	workspaceId: string,
	activeTab: string | null,
	tabOrder: string[],
	tabs: Tab[],
): Promise<void> => {
	try {
		await invoke("save_tab_state", {
			workspaceId,
			activeTab,
			tabOrder,
			tabs,
		});
	} catch (error) {
		console.error("Failed to save tab state:", error);
		throw error;
	}
};

/**
 * Loads tabs from the workspace
 * @param workspaceId The ID of the workspace
 * @returns Promise that resolves to an array of tabs
 * @throws Error if the load operation fails
 */
export const loadTabs = async (workspaceId: string): Promise<Tab[]> => {
	try {
		return await invoke<Tab[]>("load_tabs", { workspaceId });
	} catch (error) {
		console.error("Failed to load tabs:", error);
		throw error;
	}
};

/**
 * Gets the current tab state
 * @param workspaceId The ID of the workspace
 * @returns Promise that resolves to the tab state
 * @throws Error if the operation fails
 */
export const getTabState = async (
	workspaceId: string,
): Promise<{ active_tab: string | null; tab_order: string[] }> => {
	try {
		return await invoke("get_tab_state", { workspaceId });
	} catch (error) {
		console.error("Failed to get tab state:", error);
		throw error;
	}
};

/**
 * Deletes a tab from the workspace
 * @param workspaceId The ID of the workspace
 * @param title The title of the tab to delete
 * @throws Error if the delete operation fails
 */
export const deleteTab = async (
	workspaceId: string,
	title: string,
): Promise<void> => {
	try {
		await invoke("delete_tab", { workspaceId, title });
	} catch (error) {
		console.error("Failed to delete tab:", error);
		throw error;
	}
};

/**
 * Renames a tab in the workspace
 * @param workspaceId The ID of the workspace
 * @param oldTitle The current title of the tab
 * @param newTitle The new title for the tab
 * @throws Error if the rename operation fails
 */
export const renameTab = async (
	workspaceId: string,
	oldTitle: string,
	newTitle: string,
): Promise<void> => {
	try {
		await invoke("rename_tab", { workspaceId, oldTitle, newTitle });
	} catch (error) {
		console.error("Failed to rename tab:", error);
		throw error;
	}
};

/**
 * Creates a new tab in the workspace
 * @param workspaceId The ID of the workspace
 * @param tab The tab to create
 * @throws Error if the creation fails
 */
export const createTab = async (
	workspaceId: string,
	tab: Tab,
): Promise<void> => {
	try {
		await invoke("save_tab", { workspaceId, tab });
	} catch (error) {
		console.error("Failed to create tab:", error);
		throw error;
	}
};

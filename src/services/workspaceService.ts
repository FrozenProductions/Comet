import { invoke } from "@tauri-apps/api/tauri";
import type { Workspace } from "../types/workspace";

/**
 * Loads all workspaces and the active workspace
 * @returns Object containing workspaces array and active workspace ID
 * @throws Error if workspaces cannot be loaded
 */
export const loadWorkspaces = async (): Promise<{
	workspaces: Workspace[];
	active_workspace: string | null;
}> => {
	try {
		return await invoke<{
			workspaces: Workspace[];
			active_workspace: string | null;
		}>("load_workspaces");
	} catch (error) {
		console.error("Failed to load workspaces:", error);
		throw error;
	}
};

/**
 * Creates a new workspace
 * @param name The name of the workspace to create
 * @returns The created workspace object
 * @throws Error if workspace creation fails
 */
export const createWorkspace = async (name: string): Promise<Workspace> => {
	try {
		return await invoke<Workspace>("create_workspace", { name });
	} catch (error) {
		console.error("Failed to create workspace:", error);
		throw error;
	}
};

/**
 * Deletes a workspace
 * @param workspaceId The ID of the workspace to delete
 * @throws Error if workspace deletion fails
 */
export const deleteWorkspace = async (workspaceId: string): Promise<void> => {
	try {
		await invoke("delete_workspace", { workspaceId });
	} catch (error) {
		console.error("Failed to delete workspace:", error);
		throw error;
	}
};

/**
 * Sets the active workspace
 * @param workspaceId The ID of the workspace to set as active
 * @throws Error if setting active workspace fails
 */
export const setActiveWorkspace = async (
	workspaceId: string,
): Promise<void> => {
	try {
		await invoke("set_active_workspace", { workspaceId });
	} catch (error) {
		console.error("Failed to set active workspace:", error);
		throw error;
	}
};

/**
 * Renames a workspace
 * @param workspaceId The ID of the workspace to rename
 * @param newName The new name for the workspace
 * @throws Error if workspace renaming fails
 */
export const renameWorkspace = async (
	workspaceId: string,
	newName: string,
): Promise<void> => {
	try {
		await invoke("rename_workspace", { workspaceId, newName });
	} catch (error) {
		console.error("Failed to rename workspace:", error);
		throw error;
	}
};

import { invoke } from "@tauri-apps/api/tauri";
import { AutoExecuteFile } from "../types/autoExecute";

/**
 * Retrieves all auto-execute files
 * @returns Promise with array of auto-execute files
 * @throws Error if fetching files fails
 */
export const getAutoExecuteFiles = async (): Promise<AutoExecuteFile[]> => {
    return invoke("get_auto_execute_files");
};

/**
 * Saves an auto-execute file
 * @param name The name of the file to save
 * @param content The content of the file
 * @throws Error if saving file fails
 */
export const saveAutoExecuteFile = async (
    name: string,
    content: string,
): Promise<void> => {
    return invoke("save_auto_execute_file", { name, content });
};

/**
 * Deletes an auto-execute file
 * @param name The name of the file to delete
 * @throws Error if deleting file fails
 */
export const deleteAutoExecuteFile = async (name: string): Promise<void> => {
    return invoke("delete_auto_execute_file", { name });
};

/**
 * Renames an auto-execute file
 * @param oldName The current name of the file
 * @param newName The new name for the file
 * @throws Error if renaming file fails
 */
export const renameAutoExecuteFile = async (
    oldName: string,
    newName: string,
): Promise<void> => {
    return invoke("rename_auto_execute_file", { oldName, newName });
};

/**
 * Opens the auto-execute directory in the system file explorer
 * @throws Error if opening directory fails
 */
export const openAutoExecuteDirectory = async (): Promise<void> => {
    return invoke("open_auto_execute_directory");
};

import { invoke } from "@tauri-apps/api/tauri";
import { AutoExecuteFile } from "../types/autoExecute";

export const getAutoExecuteFiles = async (): Promise<AutoExecuteFile[]> => {
    return invoke("get_auto_execute_files");
};

export const saveAutoExecuteFile = async (
    name: string,
    content: string
): Promise<void> => {
    return invoke("save_auto_execute_file", { name, content });
};

export const deleteAutoExecuteFile = async (name: string): Promise<void> => {
    return invoke("delete_auto_execute_file", { name });
};

export const renameAutoExecuteFile = async (
    oldName: string,
    newName: string
): Promise<void> => {
    return invoke("rename_auto_execute_file", { oldName, newName });
};

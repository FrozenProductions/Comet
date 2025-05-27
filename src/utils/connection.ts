import { invoke } from "@tauri-apps/api/tauri";
import { ConnectionState } from "../types/connection";

export const checkConnection = async (): Promise<ConnectionState> => {
    try {
        const port = await invoke<number>("get_port");
        return {
            isConnected: true,
            port,
        };
    } catch (error) {
        return {
            isConnected: false,
            port: null,
            error: error instanceof Error ? error.message : "Unknown error",
        };
    }
};

export const sendScript = async (script: string): Promise<boolean> => {
    try {
        return await invoke<boolean>("send_script", { script });
    } catch (error) {
        console.error("Failed to send script:", error);
        return false;
    }
};

export const changeSetting = async (
    key: string,
    value: string,
): Promise<boolean> => {
    try {
        return await invoke<boolean>("change_setting", { key, value });
    } catch (error) {
        console.error("Failed to change setting:", error);
        return false;
    }
};

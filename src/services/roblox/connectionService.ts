import { invoke } from "@tauri-apps/api/tauri";
import type { ConnectionStatus } from "../../types/system/connection";

/**
 * Gets the current connection status
 * @returns Promise that resolves to the current connection status
 * @throws Error if the status check fails
 */
export const getConnectionStatus = async (): Promise<ConnectionStatus> => {
    try {
        return await invoke<ConnectionStatus>("get_connection_status");
    } catch (error) {
        console.error("Failed to get connection status:", error);
        throw error;
    }
};

/**
 * Refreshes the current connection
 * @returns Promise that resolves to the new connection status
 * @throws Error if the refresh operation fails
 */
export const refreshConnection = async (): Promise<ConnectionStatus> => {
    try {
        return await invoke<ConnectionStatus>("refresh_connection");
    } catch (error) {
        console.error("Failed to refresh connection:", error);
        throw error;
    }
};

/**
 * Increments the connection port and attempts to connect
 * @returns Promise that resolves to the new connection status
 * @throws Error if the port increment operation fails
 */
export const incrementPort = async (): Promise<ConnectionStatus> => {
    try {
        return await invoke<ConnectionStatus>("increment_port");
    } catch (error) {
        console.error("Failed to increment port:", error);
        throw error;
    }
};

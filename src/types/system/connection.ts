export type ApiType = "hydrogen" | "macsploit";

export interface ConnectionStatus {
    is_connected: boolean;
    port: number | null;
    current_port: number;
    is_connecting: boolean;
    api_type: ApiType;
}

export interface ConnectionContextType {
    status: ConnectionStatus;
    refreshConnection: () => Promise<void>;
    incrementPort: () => Promise<void>;
}

export interface ConnectionState {
    isConnected: boolean;
    port: number | null;
    error?: string;
}

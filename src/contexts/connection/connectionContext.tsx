import { useState, useEffect } from "react";
import { listen } from "@tauri-apps/api/event";
import { toast } from "react-hot-toast";
import { ConnectionStatus } from "../../types/connection";
import { ConnectionContext } from "./connectionContextType";
import {
    getConnectionStatus,
    refreshConnection,
    incrementPort as incrementConnectionPort,
} from "../../services/connectionService";

export const ConnectionProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [status, setStatus] = useState<ConnectionStatus>({
        is_connected: false,
        port: null,
        current_port: 6969,
        is_connecting: false,
    });

    useEffect(() => {
        getConnectionStatus()
            .then(setStatus)
            .catch((error) => {
                console.error(
                    "Failed to get initial connection status:",
                    error,
                );
                toast.error("Failed to get connection status");
            });

        const unlisten = listen<ConnectionStatus>(
            "connection-update",
            (event) => {
                setStatus(event.payload);
                if (event.payload.is_connected) {
                    toast.success(`Connected to port ${event.payload.port}`);
                }
            },
        );

        return () => {
            unlisten.then((fn) => fn());
        };
    }, []);

    const handleRefreshConnection = async () => {
        try {
            setStatus((prev) => ({ ...prev, is_connecting: true }));
            const toastId = toast.loading("Refreshing connection...");
            const newStatus = await refreshConnection();
            setStatus(newStatus);

            if (newStatus.is_connected) {
                toast.success("Connection established", { id: toastId });
            } else {
                toast.error("Failed to connect", { id: toastId });
            }
        } catch (error) {
            console.error("Failed to refresh connection:", error);
            toast.error("Failed to refresh connection");
        } finally {
            setStatus((prev) => ({ ...prev, is_connecting: false }));
        }
    };

    const handleIncrementPort = async () => {
        try {
            setStatus((prev) => ({ ...prev, is_connecting: true }));
            const toastId = toast.loading("Trying next port...");
            const newStatus = await incrementConnectionPort();
            setStatus(newStatus);

            if (newStatus.is_connected) {
                toast.success(`Connected to port ${newStatus.port}`, {
                    id: toastId,
                });
            } else {
                toast.error(
                    `Failed to connect to port ${newStatus.current_port}`,
                    {
                        id: toastId,
                    },
                );
            }
        } catch (error) {
            console.error("Failed to increment port:", error);
            toast.error("Failed to switch port");
        } finally {
            setStatus((prev) => ({ ...prev, is_connecting: false }));
        }
    };

    return (
        <ConnectionContext.Provider
            value={{
                status,
                refreshConnection: handleRefreshConnection,
                incrementPort: handleIncrementPort,
            }}
        >
            {children}
        </ConnectionContext.Provider>
    );
};

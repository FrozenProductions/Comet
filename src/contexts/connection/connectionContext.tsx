import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { toast } from "react-hot-toast";
import { ConnectionStatus } from "../../types/connection";
import { ConnectionContext } from "./connectionContextType";

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
        invoke<ConnectionStatus>("get_connection_status")
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

    const refreshConnection = async () => {
        try {
            setStatus((prev) => ({ ...prev, is_connecting: true }));
            const toastId = toast.loading("Refreshing connection...");
            const newStatus =
                await invoke<ConnectionStatus>("refresh_connection");
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

    const incrementPort = async () => {
        try {
            setStatus((prev) => ({ ...prev, is_connecting: true }));
            const toastId = toast.loading("Trying next port...");
            const newStatus = await invoke<ConnectionStatus>("increment_port");
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
            value={{ status, refreshConnection, incrementPort }}
        >
            {children}
        </ConnectionContext.Provider>
    );
};

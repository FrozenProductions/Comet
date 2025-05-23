import { FC, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { listen } from "@tauri-apps/api/event";
import { useSettings } from "../hooks/useSettings";
import toast from "react-hot-toast";

interface UpdateProgress {
    state: string;
    progress: number | null;
    debug_message?: string;
}

export const UpdateChecker: FC = () => {
    const { settings } = useSettings();

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                await invoke<string | null>("check_for_updates", {
                    checkNightly: settings.interface.nightlyReleases ?? false,
                });
            } catch (error) {
                console.error("Failed to check for updates:", error);
            }
        };

        const unlisten = listen<UpdateProgress>("update-progress", (event) => {
            const { state, progress } = event.payload;

            const getStatusMessage = () => {
                switch (state) {
                    case "downloading":
                        return progress !== null
                            ? `Downloading: ${Math.round(progress)}%`
                            : "Preparing download...";
                    case "installing":
                        return "Installing Comet...";
                    case "completed":
                        return "Update installed! Restarting...";
                    default:
                        return "Updating...";
                }
            };

            toast.loading(getStatusMessage(), { id: "update-progress" });

            if (state === "completed") {
                setTimeout(() => {
                    toast.success("Update complete!", {
                        id: "update-progress",
                        duration: 2000,
                    });
                }, 500);
            }
        });

        checkForUpdates();
        const interval = setInterval(checkForUpdates, 60 * 60 * 1000);

        return () => {
            clearInterval(interval);
            unlisten.then((fn) => fn());
        };
    }, [settings]);

    return null;
};

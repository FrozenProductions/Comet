import { listen } from "@tauri-apps/api/event";
import { type FC, useEffect } from "react";
import toast from "react-hot-toast";
import { useSettings } from "../hooks/core/useSettings";
import { checkForUpdates } from "../services/system/updateService";
import type { UpdateProgress } from "../types/system/updater";

export const UpdateChecker: FC = () => {
    const { settings } = useSettings();

    useEffect(() => {
        const performUpdateCheck = async () => {
            try {
                await checkForUpdates(settings.app.nightlyReleases ?? false);
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

        performUpdateCheck();
        const interval = setInterval(performUpdateCheck, 60 * 60 * 1000);

        return () => {
            clearInterval(interval);
            unlisten.then((fn) => fn());
        };
    }, [settings]);

    return null;
};

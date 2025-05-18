import { FC, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Download } from "lucide-react";
import toast from "react-hot-toast";
import { listen } from "@tauri-apps/api/event";

interface UpdateProgress {
    state: string;
    progress: number | null;
    debug_message?: string;
}

export const UpdateChecker: FC = () => {
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const newVersion = await invoke<string | null>(
                    "check_for_updates"
                );

                if (newVersion && !isUpdating) {
                    toast.dismiss("update-available");

                    toast(
                        (t) => (
                            <div className="flex items-center gap-3">
                                <span className="text-sm">
                                    Comet {newVersion} is available!
                                </span>
                                <button
                                    onClick={async () => {
                                        if (isUpdating) return;
                                        setIsUpdating(true);
                                        toast.dismiss(t.id);
                                        try {
                                            await invoke(
                                                "download_and_install_update"
                                            );
                                        } catch (error) {
                                            console.error(
                                                "Failed to update:",
                                                error
                                            );
                                            toast.error(
                                                "Failed to update Comet"
                                            );
                                            setIsUpdating(false);
                                        }
                                    }}
                                    disabled={isUpdating}
                                    className={`
                                        flex items-center gap-2 px-3 py-1 text-xs rounded-md transition-colors
                                        ${
                                            isUpdating
                                                ? "bg-ctp-surface1 cursor-not-allowed"
                                                : "bg-ctp-surface0 hover:bg-ctp-surface1 cursor-pointer"
                                        }
                                    `}
                                >
                                    <Download size={14} />
                                    <span>Update</span>
                                </button>
                            </div>
                        ),
                        {
                            id: "update-available",
                            duration: Infinity,
                            position: "bottom-center",
                        }
                    );
                }
            } catch (error) {
                console.error("Failed to check for updates:", error);
            }
        };

        const unlisten = listen<UpdateProgress>("update-progress", (event) => {
            const { state, progress, debug_message } = event.payload;

            if (debug_message) {
                console.log("Update debug:", debug_message);
            }

            const getStatusMessage = () => {
                switch (state) {
                    case "downloading":
                        return progress !== null
                            ? `Downloading: ${Math.round(progress)}%`
                            : "Preparing download...";
                    case "installing":
                        if (debug_message?.includes("Mount DMG"))
                            return "Mounting installer...";
                        if (debug_message?.includes("Install app"))
                            return "Installing Comet...";
                        if (debug_message?.includes("Unmount"))
                            return "Finishing up...";
                        return "Installing Comet...";
                    case "completed":
                        return "Update installed! Restarting...";
                    default:
                        return "Updating...";
                }
            };

            toast.loading(
                <div className="flex items-center gap-2">
                    <span>{getStatusMessage()}</span>
                </div>,
                { id: "update-progress" }
            );

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
    }, [isUpdating]);

    return null;
};

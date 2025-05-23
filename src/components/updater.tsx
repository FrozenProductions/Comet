import { FC, useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { Download, AlertTriangle, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";
import { listen } from "@tauri-apps/api/event";
import { useSettings } from "../hooks/useSettings";

interface UpdateProgress {
    state: string;
    progress: number | null;
    debug_message?: string;
}

export const UpdateChecker: FC = () => {
    const [isUpdating, setIsUpdating] = useState(false);
    const { settings } = useSettings();

    useEffect(() => {
        const checkForUpdates = async () => {
            try {
                const newVersion = await invoke<string | null>(
                    "check_for_updates",
                    {
                        checkNightly:
                            settings.interface.nightlyReleases ?? false,
                    },
                );

                if (newVersion && !isUpdating) {
                    toast.dismiss("update-available");

                    const isNightly = newVersion.includes("-");

                    toast(
                        (t) => (
                            <div className="flex min-w-[320px] items-center gap-4 py-1">
                                <div
                                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${
                                        isNightly
                                            ? "bg-ctp-red/10"
                                            : "bg-accent/10"
                                    }`}
                                >
                                    {isNightly ? (
                                        <AlertTriangle
                                            size={16}
                                            className="text-ctp-red"
                                        />
                                    ) : (
                                        <Download
                                            size={16}
                                            className="text-accent"
                                        />
                                    )}
                                </div>
                                <div className="flex min-w-0 flex-1 flex-col gap-1">
                                    <div className="flex items-baseline justify-between gap-4">
                                        <span className="truncate text-[13px] font-medium text-ctp-text">
                                            {isNightly ? "Preview" : "Update"}{" "}
                                            {newVersion}
                                        </span>
                                        <button
                                            onClick={async () => {
                                                if (isUpdating) return;
                                                setIsUpdating(true);
                                                toast.dismiss(t.id);
                                                try {
                                                    await invoke(
                                                        "download_and_install_update",
                                                    );
                                                } catch (error) {
                                                    toast.error(
                                                        "Failed to update Comet",
                                                    );
                                                    console.error(
                                                        "Failed to update:",
                                                        error,
                                                    );
                                                    setIsUpdating(false);
                                                }
                                            }}
                                            disabled={isUpdating}
                                            className={`flex shrink-0 items-center gap-1.5 rounded border px-2 py-0.5 text-xs transition-colors ${
                                                isUpdating
                                                    ? "cursor-not-allowed border-ctp-surface0 bg-ctp-surface0/50 text-ctp-subtext0"
                                                    : isNightly
                                                      ? "border-ctp-red/20 bg-ctp-red/5 text-ctp-red hover:bg-ctp-red/10"
                                                      : "border-accent/20 bg-accent/5 text-accent hover:bg-accent/10"
                                            }`}
                                        >
                                            <span>
                                                {isUpdating
                                                    ? "Installing"
                                                    : "Install"}
                                            </span>
                                            {!isUpdating && (
                                                <ArrowRight
                                                    size={12}
                                                    className="stroke-[2.5]"
                                                />
                                            )}
                                        </button>
                                    </div>
                                    <span className="line-clamp-1 text-xs text-ctp-subtext0">
                                        {isNightly
                                            ? "Development preview build • May contain bugs"
                                            : "Stable public release • Recommended update"}
                                    </span>
                                </div>
                            </div>
                        ),
                        {
                            id: "update-available",
                            duration: Infinity,
                            position: "bottom-center",
                        },
                    );
                }
            } catch (error) {
                toast.error("Failed to check for updates");
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
    }, [isUpdating, settings]);

    return null;
};

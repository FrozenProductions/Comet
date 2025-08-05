import { toast } from "react-hot-toast";
import { useSettings } from "../core/useSettings";

/**
 * Hook for managing console visibility state
 * Provides methods to toggle console visibility and check current state
 * Updates settings and shows toast notifications on visibility changes
 */
export const useConsoleVisibility = () => {
    const { settings, updateSettings } = useSettings();

    const toggleConsoleVisibility = () => {
        updateSettings({
            interface: {
                ...settings.interface,
                showConsole: !settings.interface.showConsole,
            },
        });
        toast.success(
            !settings.interface.showConsole
                ? "Console shown"
                : "Console hidden",
            {
                id: "console-visibility-toast",
            },
        );
    };

    return {
        isConsoleVisible: settings.interface.showConsole,
        toggleConsoleVisibility,
    };
};

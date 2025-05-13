import { useCallback } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { toast } from "react-hot-toast";

export const useRoblox = () => {
    const openRoblox = useCallback(async () => {
        try {
            await invoke("open_roblox");
            toast.success("Opening Roblox...", {
                id: "open-roblox-toast",
            });
        } catch (error) {
            toast.error("Failed to open Roblox");
            console.error("Failed to open Roblox:", error);
        }
    }, []);

    return { openRoblox };
};

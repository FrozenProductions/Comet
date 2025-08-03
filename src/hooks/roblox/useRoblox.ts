import { useCallback } from "react";
import { toast } from "react-hot-toast";
import { openRoblox as openRobloxService } from "../../services/roblox/robloxService";

/**
 * Hook for managing Roblox application interactions
 * Provides method to open Roblox application with error handling and notifications
 */
export const useRoblox = () => {
	const openRoblox = useCallback(async () => {
		try {
			await openRobloxService();
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

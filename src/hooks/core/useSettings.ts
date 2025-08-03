import { useContext } from "react";
import { SettingsContext } from "../../contexts/settings/settingsContextType";

/**
 * Hook for accessing settings context
 * Must be used within a SettingsProvider component
 * Returns settings context containing state and methods for settings management
 */
export const useSettings = () => {
	const context = useContext(SettingsContext);
	if (context === undefined) {
		throw new Error("useSettings must be used within a SettingsProvider");
	}
	return context;
};

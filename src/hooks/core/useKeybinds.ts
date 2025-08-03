import { useContext } from "react";
import { KeybindsContext } from "../../contexts/keybinds/keybindsContextType";

/**
 * Hook for accessing keybinds context
 * Must be used within a KeybindsProvider component
 * Returns keybinds context containing state and methods for keybind management
 */
export const useKeybinds = () => {
	const context = useContext(KeybindsContext);
	if (!context) {
		throw new Error("useKeybinds must be used within a KeybindsProvider");
	}
	return context;
};

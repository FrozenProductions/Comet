import { useContext } from "react";
import { FastFlagsContext } from "../../contexts/fastFlags/fastFlagsContextType";

/**
 * Hook for accessing fast flags state and functionality
 * Must be used within a FastFlagsProvider component
 * Returns fast flags context containing state and methods for flags management
 */
export const useFastFlags = () => {
	const context = useContext(FastFlagsContext);
	if (!context) {
		throw new Error("useFastFlags must be used within a FastFlagsProvider");
	}
	return context;
};

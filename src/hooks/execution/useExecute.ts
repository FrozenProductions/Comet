import { useContext } from "react";
import { ExecuteContext } from "../../contexts/execute/executeContextType";

/**
 * Hook for accessing execution state and functionality
 * Must be used within an ExecuteProvider component
 * Returns execute context containing state and methods for script execution
 */
export const useExecute = () => {
	const context = useContext(ExecuteContext);
	if (!context) {
		throw new Error("useExecute must be used within an ExecuteProvider");
	}
	return context;
};

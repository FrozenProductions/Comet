import { useContext } from "react";
import { ConsoleContext } from "../../contexts/console/consoleContextType";

/**
 * Hook for accessing console state and functionality
 * Must be used within a ConsoleProvider component
 * Returns console context containing state and methods for console manipulation
 */
export const useConsole = () => {
    const context = useContext(ConsoleContext);
    if (!context) {
        throw new Error("useConsole must be used within a ConsoleProvider");
    }
    return context;
};

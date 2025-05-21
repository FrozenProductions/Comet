import { useContext } from "react";
import { ConsoleContext } from "../contexts/console/consoleContextType";

export const useConsole = () => {
    const context = useContext(ConsoleContext);
    if (!context) {
        throw new Error("useConsole must be used within a ConsoleProvider");
    }
    return context;
};

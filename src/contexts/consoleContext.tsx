import { createContext, useContext, FC, ReactNode, useState } from "react";
import { ConsoleContextType, ConsoleState } from "../types/console";
import { CONSOLE_STORAGE_KEY } from "../constants/console";

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export const ConsoleProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isFloating, setIsFloating] = useState(() => {
        const savedState = localStorage.getItem(CONSOLE_STORAGE_KEY);
        if (savedState) {
            try {
                const state = JSON.parse(savedState) as ConsoleState;
                return state.isFloating;
            } catch {
                return false;
            }
        }
        return false;
    });

    const handleSetIsFloating = (value: boolean) => {
        setIsFloating(value);
        const savedState = localStorage.getItem(CONSOLE_STORAGE_KEY);
        let state: ConsoleState = { isFloating: value };

        if (savedState) {
            try {
                state = { ...JSON.parse(savedState), isFloating: value };
            } catch {
                console.error("Failed to parse console state:", savedState);
            }
        }

        localStorage.setItem(CONSOLE_STORAGE_KEY, JSON.stringify(state));
    };

    return (
        <ConsoleContext.Provider
            value={{
                isFloating,
                setIsFloating: handleSetIsFloating,
            }}
        >
            {children}
        </ConsoleContext.Provider>
    );
};

export const useConsole = () => {
    const context = useContext(ConsoleContext);
    if (!context) {
        throw new Error("useConsole must be used within a ConsoleProvider");
    }
    return context;
};

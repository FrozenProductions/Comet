import { createContext, useContext, FC, ReactNode, useState } from "react";

interface ConsoleContextType {
    isFloating: boolean;
    setIsFloating: (value: boolean) => void;
}

const ConsoleContext = createContext<ConsoleContextType | undefined>(undefined);

export const ConsoleProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [isFloating, setIsFloating] = useState(false);

    return (
        <ConsoleContext.Provider value={{ isFloating, setIsFloating }}>
            {children}
        </ConsoleContext.Provider>
    );
};

export const useConsole = () => {
    const context = useContext(ConsoleContext);
    if (context === undefined) {
        throw new Error("useConsole must be used within a ConsoleProvider");
    }
    return context;
};

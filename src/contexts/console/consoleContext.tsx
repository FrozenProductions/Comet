import { FC, ReactNode, useState, useCallback, useEffect } from "react";
import { ConsoleState } from "../../types/console";
import { CONSOLE_STORAGE_KEY } from "../../constants/console";
import { LogLine } from "../../types/robloxConsole";
import { robloxLogService } from "../../services/robloxLogService";
import { ConsoleContext } from "./consoleContextType";

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

    const [logs, setLogs] = useState<LogLine[]>([]);
    const [isWatching, setIsWatching] = useState(false);

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

    const addLog = useCallback((log: LogLine) => {
        setLogs((prev) => [...prev, log]);
    }, []);

    const startWatching = useCallback(async () => {
        try {
            await robloxLogService.startWatching();
            setIsWatching(true);
        } catch (error) {
            setIsWatching(false);
            throw new Error(
                `Failed to start watching logs: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        }
    }, []);

    const stopWatching = useCallback(async () => {
        try {
            await robloxLogService.stopWatching();
            setIsWatching(false);
        } catch (error) {
            throw new Error(
                `Failed to stop watching logs: ${
                    error instanceof Error ? error.message : String(error)
                }`,
            );
        }
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
    }, []);

    useEffect(() => {
        const unsubscribe = robloxLogService.subscribe(addLog);
        return () => {
            unsubscribe();
            void stopWatching();
        };
    }, [stopWatching, addLog]);

    return (
        <ConsoleContext.Provider
            value={{
                isFloating,
                setIsFloating: handleSetIsFloating,
                logs,
                isWatching,
                startWatching,
                stopWatching,
                clearLogs,
                addLog,
            }}
        >
            {children}
        </ConsoleContext.Provider>
    );
};

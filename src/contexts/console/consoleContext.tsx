import {
    type FC,
    type ReactNode,
    useCallback,
    useEffect,
    useState,
} from "react";
import { CONSOLE_STORAGE_KEY } from "../../constants/ui/console";
import { useLocalStorage } from "../../hooks/core/useLocalStorage";
import {
    startWatching as startWatchingService,
    stopWatching as stopWatchingService,
    subscribe as subscribeService,
} from "../../services/roblox/robloxLogService";
import type { LogLine } from "../../types/roblox/robloxConsole";
import type { ConsoleState } from "../../types/ui/console";
import { ConsoleContext } from "./consoleContextType";

export const ConsoleProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [consoleState, setConsoleState] = useLocalStorage<ConsoleState>(
        CONSOLE_STORAGE_KEY,
        {
            isFloating: false,
            position: {
                x: window.innerWidth / 2 - 400,
                y: window.innerHeight / 2 - 200,
            },
            size: {
                width: 800,
                height: 300,
            },
        },
    );

    const [logs, setLogs] = useState<LogLine[]>([]);
    const [isWatching, setIsWatching] = useState(false);

    const handleSetIsFloating = useCallback(
        (value: boolean) => {
            setConsoleState((prev) => ({
                ...prev,
                isFloating: value,
            }));
        },
        [setConsoleState],
    );

    const addLog = useCallback((log: LogLine) => {
        setLogs((prev) => [...prev, log]);
    }, []);

    const startWatching = useCallback(async () => {
        try {
            await startWatchingService();
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
            await stopWatchingService();
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
        const unsubscribe = subscribeService(addLog);
        return () => {
            unsubscribe();
            void stopWatching();
        };
    }, [stopWatching, addLog]);

    return (
        <ConsoleContext.Provider
            value={{
                isFloating: consoleState.isFloating,
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

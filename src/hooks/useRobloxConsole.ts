import { useState, useEffect, useCallback } from "react";
import { robloxLogService } from "../services/robloxLogService";
import { LogLine, ConsoleState } from "../types/robloxConsole";

export const useRobloxConsole = (): ConsoleState => {
    const [logs, setLogs] = useState<LogLine[]>([]);
    const [isWatching, setIsWatching] = useState(false);

    const addLog = useCallback((log: LogLine) => {
        setLogs((prev) => [...prev, log]);
    }, []);

    const clearLogs = useCallback(() => {
        setLogs([]);
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
                }`
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
                }`
            );
        }
    }, []);

    useEffect(() => {
        const unsubscribe = robloxLogService.subscribe(addLog);
        return () => {
            unsubscribe();
            void stopWatching();
        };
    }, [stopWatching]);

    return {
        logs,
        isWatching,
        startWatching,
        stopWatching,
        clearLogs,
    };
};

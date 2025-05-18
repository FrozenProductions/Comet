import { LogLine } from "./robloxConsole";

export interface ConsoleContextType {
    isFloating: boolean;
    setIsFloating: (isFloating: boolean) => void;
    logs: LogLine[];
    isWatching: boolean;
    startWatching: () => Promise<void>;
    stopWatching: () => Promise<void>;
    clearLogs: () => void;
    addLog: (log: LogLine) => void;
}

export interface ConsoleState {
    isFloating: boolean;
    size?: ConsoleSize;
    position?: {
        x: number;
        y: number;
    };
}

export interface ConsoleSize {
    width: number;
    height: number;
}

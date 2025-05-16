export type LogLevel = "INFO" | "WARN" | "ERROR" | "DEBUG";

export interface LogLine {
    timestamp: string;
    level: LogLevel;
    message: string;
    raw: string;
}

export interface RobloxConsoleProps {
    isOpen: boolean;
    onToggle: () => void;
    isFloating: boolean;
    onFloatToggle: () => void;
    consoleState: ConsoleState;
}

export interface ConsoleState {
    logs: LogLine[];
    isWatching: boolean;
    startWatching: () => Promise<void>;
    stopWatching: () => Promise<void>;
    clearLogs: () => void;
}

export interface ConsolePosition {
    x: number;
    y: number;
}

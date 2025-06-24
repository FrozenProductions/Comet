import { invoke } from "@tauri-apps/api/tauri";

type LogLevel = "info" | "warn" | "error" | "debug";

interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    details?: unknown;
}

class LogService {
    private static instance: LogService;
    private isInitialized = false;

    private constructor() {
        if (typeof window !== "undefined") {
            this.initializeConsoleOverrides();
        }
    }

    public static getInstance(): LogService {
        if (!LogService.instance) {
            LogService.instance = new LogService();
        }
        return LogService.instance;
    }

    private initializeConsoleOverrides(): void {
        if (this.isInitialized) return;

        const originalConsole = {
            log: console.log,
            warn: console.warn,
            error: console.error,
            debug: console.debug,
        };

        console.log = (...args: unknown[]) => {
            this.handleLog("info", args);
            originalConsole.log.apply(console, args);
        };

        console.warn = (...args: unknown[]) => {
            this.handleLog("warn", args);
            originalConsole.warn.apply(console, args);
        };

        console.error = (...args: unknown[]) => {
            this.handleLog("error", args);
            originalConsole.error.apply(console, args);
        };

        console.debug = (...args: unknown[]) => {
            this.handleLog("debug", args);
            originalConsole.debug.apply(console, args);
        };

        window.onerror = (message, source, lineno, colno, error) => {
            this.handleLog("error", [
                {
                    message,
                    source,
                    lineno,
                    colno,
                    error: error?.stack || error?.message || error,
                },
            ]);
        };

        window.onunhandledrejection = (event) => {
            this.handleLog("error", [
                {
                    type: "UnhandledPromiseRejection",
                    reason: event.reason,
                },
            ]);
        };

        this.isInitialized = true;
    }

    private async handleLog(level: LogLevel, args: unknown[]): Promise<void> {
        const logEntry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            message: args
                .map((arg) =>
                    typeof arg === "object" ? JSON.stringify(arg) : String(arg),
                )
                .join(" "),
        };

        if (args.length === 1 && typeof args[0] === "object") {
            logEntry.details = args[0];
        }

        await this.writeLogToFile(logEntry);
    }

    private async writeLogToFile(logEntry: LogEntry): Promise<void> {
        try {
            await invoke("write_log_entry", { logEntry });
        } catch (error) {
            // Fallback to original console if logging fails
            console.error("Failed to write log entry:", error);
        }
    }

    public async getLogs(level?: LogLevel): Promise<LogEntry[]> {
        try {
            return await invoke("get_logs", { level });
        } catch (error) {
            console.error("Failed to get logs:", error);
            return [];
        }
    }

    public async clearLogs(): Promise<void> {
        try {
            await invoke("clear_logs");
        } catch (error) {
            console.error("Failed to clear logs:", error);
        }
    }
}

export const logService = LogService.getInstance();

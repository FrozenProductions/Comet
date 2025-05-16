import { invoke } from "@tauri-apps/api/tauri";
import { listen, UnlistenFn } from "@tauri-apps/api/event";
import { LogLine, LogLevel } from "../types/robloxConsole";

class RobloxLogService {
    private listeners: Set<(log: LogLine) => void> = new Set();
    private unlistenCallback?: UnlistenFn;
    private isWatching = false;

    async startWatching(): Promise<void> {
        if (this.isWatching) {
            return;
        }

        try {
            await invoke("start_log_watcher");
            this.isWatching = true;

            this.unlistenCallback = await listen(
                "log_update",
                (event: { payload: string }) => {
                    const rawLine = event.payload;
                    const parsedLog = this.parseLogLine(rawLine);
                    this.notifyListeners(parsedLog);
                }
            );
        } catch (error) {
            this.isWatching = false;
            throw new Error(
                `Failed to start log watcher: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    async stopWatching(): Promise<void> {
        if (!this.isWatching) {
            return;
        }

        try {
            await invoke("stop_log_watcher");
            await this.unlistenCallback?.();
            this.isWatching = false;
        } catch (error) {
            throw new Error(
                `Failed to stop log watcher: ${
                    error instanceof Error ? error.message : String(error)
                }`
            );
        }
    }

    subscribe(callback: (log: LogLine) => void): () => void {
        this.listeners.add(callback);
        return () => {
            this.listeners.delete(callback);
        };
    }

    private notifyListeners(log: LogLine): void {
        this.listeners.forEach((listener) => listener(log));
    }

    private parseLogLine(rawLine: string): LogLine {
        const timestamp = new Date().toISOString();
        let level: LogLevel = "INFO";
        let message = rawLine.trim();

        const bracketMatch = message.match(/\[(ERROR|WARN|DEBUG|INFO)\]/i);
        if (bracketMatch) {
            level = bracketMatch[1].toUpperCase() as LogLevel;
            message = message.replace(bracketMatch[0], "").trim();
        } else {
            const lowerMessage = message.toLowerCase();
            if (lowerMessage.includes("error")) {
                level = "ERROR";
            } else if (lowerMessage.includes("warn")) {
                level = "WARN";
            } else if (lowerMessage.includes("debug")) {
                level = "DEBUG";
            } else if (lowerMessage.includes("info")) {
                level = "INFO";
            }
        }

        return {
            timestamp,
            level,
            message,
            raw: rawLine,
        };
    }
}

export const robloxLogService = new RobloxLogService();

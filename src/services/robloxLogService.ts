import { invoke } from "@tauri-apps/api/tauri";
import { listen, type UnlistenFn } from "@tauri-apps/api/event";
import type { LogLine, LogLevel } from "../types/robloxConsole";

const listeners = new Set<(log: LogLine) => void>();
let unlistenCallback: UnlistenFn | undefined;
let isWatching = false;

const notifyListeners = (log: LogLine): void => {
	listeners.forEach((listener) => listener(log));
};

const parseLogLine = (rawLine: string): LogLine => {
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
};

/**
 * Starts watching for Roblox log updates
 * @throws Error if the watcher cannot be started
 */
export const startWatching = async (): Promise<void> => {
	if (isWatching) {
		return;
	}

	try {
		await invoke("start_log_watcher");
		isWatching = true;

		unlistenCallback = await listen(
			"log_update",
			(event: { payload: string }) => {
				const rawLine = event.payload;
				const parsedLog = parseLogLine(rawLine);
				notifyListeners(parsedLog);
			},
		);
	} catch (error) {
		isWatching = false;
		throw new Error(
			`Failed to start log watcher: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
};

/**
 * Stops watching for Roblox log updates
 * @throws Error if the watcher cannot be stopped
 */
export const stopWatching = async (): Promise<void> => {
	if (!isWatching) {
		return;
	}

	try {
		await invoke("stop_log_watcher");
		await unlistenCallback?.();
		isWatching = false;
	} catch (error) {
		throw new Error(
			`Failed to stop log watcher: ${
				error instanceof Error ? error.message : String(error)
			}`,
		);
	}
};

/**
 * Subscribes to log updates
 * @param callback Function to be called when a new log line is received
 * @returns Function to unsubscribe the callback
 */
export const subscribe = (callback: (log: LogLine) => void): (() => void) => {
	listeners.add(callback);
	return () => {
		listeners.delete(callback);
	};
};

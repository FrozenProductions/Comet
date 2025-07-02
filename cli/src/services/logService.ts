import fs from "fs/promises";
import path from "path";
import os from "os";
import type { LogEntry, LogScanResult } from "../types/logs.js";

/**
 * Locates the most recent Roblox log file in the user's logs directory
 * @returns Path to the latest log file or null if none found
 */
async function findLatestLogFile(): Promise<string | null> {
	try {
		const homeDir = os.homedir();
		const logDir = path.join(homeDir, "Library", "Logs", "Roblox");

		const exists = await fs
			.access(logDir)
			.then(() => true)
			.catch(() => false);

		if (!exists) {
			return null;
		}

		const files = await fs.readdir(logDir);
		const logFiles = files.filter((file) => file.endsWith(".log"));

		if (logFiles.length === 0) {
			return null;
		}

		const fileStats = await Promise.all(
			logFiles.map(async (file) => {
				const filePath = path.join(logDir, file);
				const stats = await fs.stat(filePath);
				return {
					path: filePath,
					mtime: stats.mtime,
				};
			}),
		);

		fileStats.sort((a, b) => b.mtime.getTime() - a.mtime.getTime());

		return fileStats[0]?.path || null;
	} catch {
		return null;
	}
}

/**
 * Parses a single line from a log file into a structured log entry
 * @param line Raw log line to parse
 * @returns Parsed LogEntry object or null if line is empty/invalid
 */
function parseLogLine(line: string): LogEntry | null {
	if (!line || line.trim().length === 0) {
		return null;
	}

	let timestamp = "";
	let message = line;
	let level = "INFO";

	const timestampMatch =
		line.match(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d+Z/) ||
		line.match(/\d{2}:\d{2}:\d{2}.\d+/) ||
		line.match(/\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}:\d{2}/);

	if (timestampMatch) {
		timestamp = timestampMatch[0];

		const afterTimestamp = line.substring(
			line.indexOf(timestampMatch[0]) + timestampMatch[0].length,
		);
		message = afterTimestamp.trim();

		message = message.replace(/^,[\d.]+,[a-f0-9]+,\d+\s*/, "");
		message = message.replace(/^\s*\[\w+::\w+\]/, "");
		message = message.replace(/^\s*\[\w+\]/, "");
		message = message.replace(/^,.*?\s/, "");
	}

	const errorMatch = message.match(/error|exception|fail|crash|critical/i);
	const warnMatch = message.match(/warn|attention|caution/i);

	if (errorMatch) {
		level = "ERROR";
	} else if (warnMatch) {
		level = "WARNING";
	}

	if (line.includes("[ERROR]") || line.includes("ERROR:")) {
		level = "ERROR";
	} else if (
		line.includes("[WARNING]") ||
		line.includes("WARNING:") ||
		line.includes("[WARN]") ||
		line.includes("WARN:")
	) {
		level = "WARNING";
	} else if (line.includes("[INFO]") || line.includes("INFO:")) {
		level = "INFO";
	}

	if (!message.trim() && line.trim()) {
		message = line.trim();
	}

	return {
		timestamp: timestamp || "Unknown Time",
		level,
		message: message.trim(),
		raw: line,
	};
}

/**
 * Scans and parses the latest Roblox log file
 * @returns LogScanResult containing parsed entries or error details
 */
export async function scanRobloxLogs(): Promise<LogScanResult> {
	try {
		const logFilePath = await findLatestLogFile();

		if (!logFilePath) {
			return {
				success: false,
				entries: [],
				error: "No Roblox log files found. Have you run Roblox recently?",
			};
		}

		const content = await fs.readFile(logFilePath, "utf-8");
		const lines = content.split("\n");

		const entries: LogEntry[] = [];

		for (const line of lines) {
			if (line.trim()) {
				const entry = parseLogLine(line);
				if (entry) {
					entries.push(entry);
				}
			}
		}

		return {
			success: true,
			entries: entries.length > 0 ? entries : [],
		};
	} catch (error) {
		return {
			success: false,
			entries: [],
			error: error instanceof Error ? error.message : "Unknown error occurred",
		};
	}
}

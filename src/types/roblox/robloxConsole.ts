import type { ConsoleSize } from "../ui/console";

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
}

export interface ConsolePosition {
	x: number;
	y: number;
}

export type ConsoleState = {
	position: ConsolePosition;
	size: ConsoleSize;
	isFloating: boolean;
};

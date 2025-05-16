import { LogLevel } from "../types/robloxConsole";

export const CONSOLE_COLORS: Record<LogLevel, string> = {
    ERROR: "text-red-200",
    WARN: "text-yellow-200",
    DEBUG: "text-blue-200",
    INFO: "text-green-200",
};

export const CONSOLE_CONFIG = {
    DEFAULT_HEIGHT: "300px",
    COLLAPSED_HEIGHT: "40px",
    ANIMATION_CONFIG: {
        type: "spring",
        stiffness: 300,
        damping: 30,
    },
} as const;

export interface LogEntry {
    timestamp: string;
    level: string;
    message: string;
    raw: string;
}

export interface LogScanResult {
    success: boolean;
    entries: LogEntry[];
    error?: string;
}

export type ViewType = "all" | "errors" | "warnings";

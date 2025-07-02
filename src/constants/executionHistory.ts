export const EXECUTION_HISTORY_STORAGE_KEY =
	"comet-execution-history-state" as const;

export const DEFAULT_EXECUTION_HISTORY_STATE = {
	position: { x: window.innerWidth / 2 - 300, y: window.innerHeight / 2 - 250 },
	size: { width: 600, height: 500 },
} as const;

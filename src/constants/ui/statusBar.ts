import type { StatusBarConfig } from "../../types/ui/statusBar";

export const STATUS_BAR_DEFAULT_CONFIG: StatusBarConfig = {
	order: [
		{ id: "sidebar", group: "left" },
		{ id: "search", group: "left" },
		{ id: "beautify", group: "left" },
		{ id: "diagnostics", group: "right" },
		{ id: "lines", group: "right" },
		{ id: "position", group: "right" },
	],
} as const;

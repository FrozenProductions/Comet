import { KeybindMap } from "../types/keybinds.js";

export const MAIN_KEYBINDS: KeybindMap = {
	l: {
		key: "l",
		description: "List scripts",
		action: "list",
	},
	v: {
		key: "v",
		description: "View logs",
		action: "logs",
	},
	x: {
		key: "x",
		description: "Execute script",
		action: "execute",
	},
	d: {
		key: "d",
		description: "Delete script",
		action: "delete",
	},
	c: {
		key: "c",
		description: "Create script",
		action: "create",
	},
	q: {
		key: "q",
		description: "Exit",
		action: "exit",
	},
} as const;

export const LOG_KEYBINDS: KeybindMap = {
	"1": {
		key: "1",
		description: "View all logs",
		action: "all",
	},
	"2": {
		key: "2",
		description: "View error logs",
		action: "errors",
	},
	"3": {
		key: "3",
		description: "View warnings & errors",
		action: "warnings",
	},
	"4": {
		key: "4",
		description: "Filter logs by keyword",
		action: "filter",
	},
	q: {
		key: "q",
		description: "Back to main menu",
		action: "back",
	},
} as const;

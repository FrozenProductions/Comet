import { Code2, Keyboard, Settings2, SettingsIcon } from "lucide-react";
import type { SettingsSection } from "../../types/core/settings";

export const SETTINGS_STORAGE_KEY = "comet-settings";

export const SETTINGS_SECTIONS: SettingsSection[] = [
	{
		id: "editor",
		title: "Editor",
		description: "Configure editor preferences",
		icon: Code2,
	},
	{
		id: "interface",
		title: "Interface",
		description: "Customize appearance",
		icon: SettingsIcon,
	},
	{
		id: "keybinds",
		title: "Keyboard Shortcuts",
		description: "Customize hotkeys",
		icon: Keyboard,
	},
	{
		id: "application",
		title: "Application",
		description: "Comet settings and info",
		icon: Settings2,
	},
] as const;

export const DEFAULT_EDITOR_SETTINGS = {
	display: {
		showLineNumbers: true,
		wordWrap: false,
	},
	text: {
		fontSize: 14,
		tabSize: 4,
		lineHeight: 1.5,
	},
	cursor: {
		style: "line" as const,
		blinking: "blink" as const,
		smoothCaret: true,
	},
	intellisense: {
		enabled: true,
		maxSuggestions: 5,
		acceptSuggestionKey: "Tab" as const,
		compactMode: false,
	},
	interface: {
		zenMode: false,
		showTabBar: false,
		showConsole: true,
		modalScale: "default" as const,
		middleClickTabClose: true,
		recentSearches: {
			enabled: true,
			maxItems: 5,
		},
		executionHistory: {
			maxItems: 100,
		},
		toastPosition: "bottom-center" as const,
	},
	app: {
		nightlyReleases: false,
	},
} as const;

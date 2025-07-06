import type { Code2 } from "lucide-react";
import type { ReactNode } from "react";
import type { Keybind } from "./keybinds";

export type SettingsSection = {
	id: string;
	title: string;
	description: string;
	icon: typeof Code2;
};

export type SettingsContextType = {
	settings: EditorSettings;
	updateSettings: (newSettings: Partial<EditorSettings>) => void;
	hasLocalStorageError: boolean;
};

export interface EditorSettings {
	display: {
		showLineNumbers: boolean;
		wordWrap: boolean;
	};
	text: {
		fontSize: number;
		tabSize: number;
		lineHeight: number;
	};
	cursor: {
		style: "line" | "block" | "underline";
		blinking: "blink" | "smooth" | "phase" | "expand" | "solid";
		smoothCaret: boolean;
	};
	intellisense: {
		enabled: boolean;
		maxSuggestions: number;
		acceptSuggestionKey: "Tab" | "Enter";
		compactMode: boolean;
	};
	interface: {
		zenMode: boolean;
		showTabBar: boolean;
		showConsole: boolean;
		modalScale: "small" | "default" | "large";
		recentSearches: {
			enabled: boolean;
			maxItems: number;
		};
		executionHistory: {
			maxItems: number;
		};
	};
	app: {
		nightlyReleases: boolean;
	};
}

export type SettingsKey = keyof EditorSettings;

export interface SettingGroupProps {
	title: string;
	description?: string;
	info?: string;
	icon?: ReactNode;
	children: ReactNode;
}

export interface TechStackItemProps {
	name: string;
	description: string;
	href: string;
	icon: string;
	invertIcon?: boolean;
}

export interface KeybindSectionProps {
	category: string;
	keybinds: Keybind[];
	onEditKeybind: (keybind: Keybind) => void;
}

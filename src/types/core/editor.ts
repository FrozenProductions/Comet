import type {
	ScriptExecutionOptions,
	ScriptExecutionResult,
} from "../execution/script";

export interface EditorPosition {
	lineNumber: number;
	column: number;
}

export interface Tab {
	id: string;
	title: string;
	content: string;
	language: string;
}

export type EditorActionsState = {
	isExpanded: boolean;
	isPinned: boolean;
};

export interface EditorState {
	currentPosition: EditorPosition;
	currentFile: string | null;
	tabs: Tab[];
	activeTab: string | null;
	setPosition: (position: EditorPosition) => void;
	setFile: (file: string | null) => void;
	createTab: () => string;
	closeTab: (id: string) => void;
	updateTab: (id: string, updates: Partial<Tab>) => void;
	setActiveTab: (id: string) => void;
	loadTabs: (newTabs: Tab[], activeTabId: string | null) => void;
	setTabs: (tabs: Tab[]) => void;
	duplicateTab: (id: string) => void;
	executeTab: (id: string) => Promise<void>;
	executeScript: (
		options?: ScriptExecutionOptions,
	) => Promise<ScriptExecutionResult>;
}

export interface Suggestion {
	type: "function" | "property" | "class" | "method" | "variable" | "keyword";
	label: string;
	detail?: string;
	documentation?: string;
}

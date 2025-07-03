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
	type:
		| "function"
		| "variable"
		| "class"
		| "interface"
		| "enum"
		| "property"
		| "method"
		| "type"
		| "library"
		| "keyword";
	label: string;
	detail?: string;
	documentation?: string;
}

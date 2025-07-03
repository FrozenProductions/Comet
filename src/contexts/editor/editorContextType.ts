import React from "react";
import type { EditorPosition, Tab } from "../../types/core/editor";
import type { ScriptExecutionOptions } from "../../types/execution/script";

export interface EditorState {
	currentPosition: EditorPosition;
	currentFile: string | null;
	tabs: Tab[];
	activeTab: string | null;
	setPosition: (position: EditorPosition) => void;
	setFile: (file: string | null) => void;
	createTab: () => Promise<string | null>;
	createTabWithContent: (
		title: string,
		content: string,
		language?: string,
	) => Promise<string | null>;
	closeTab: (id: string) => Promise<void>;
	updateTab: (id: string, updates: Partial<Tab>) => Promise<void>;
	setActiveTab: (id: string | null) => void;
	loadTabs: (tabs: Tab[], activeTabId: string | null) => void;
	setTabs: (tabs: Tab[]) => void;
	duplicateTab: (id: string) => Promise<void>;
	executeTab: (id: string) => Promise<void>;
	executeScript: (
		options?: ScriptExecutionOptions,
	) => Promise<{ success: boolean; error?: string }>;
}

export const EditorContext = React.createContext<EditorState | null>(null);

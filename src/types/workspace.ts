import * as monaco from "monaco-editor";
import { Suggestion } from "./editor";

export interface Tab {
	id: string;
	title: string;
	content: string;
	language: string;
}

export interface TabbarProps {
	tabs: Tab[];
	activeTab: string | null;
	onTabClick: (tabId: string) => void;
	onTabClose: (tabId: string) => void;
	onTabRename: (tabId: string, newName: string) => void;
	onNewTab: () => void;
	onTabReorder: (fromIndex: number, toIndex: number) => void;
}

export interface CodeEditorProps {
	content: string;
	language: string;
	onChange: (value: string | undefined) => void;
	showActions?: boolean;
}

export interface IntelliSenseProps {
	isVisible: boolean;
	position: { x: number; y: number } | null;
	suggestions: Suggestion[];
	onSelect: (suggestion: string) => void;
	onClose: () => void;
}

export interface EditorSearchProps {
	editor: monaco.editor.IStandaloneCodeEditor | null;
	isVisible: boolean;
	onClose: () => void;
}

export interface IntellisenseState {
	isVisible: boolean;
	position: { x: number; y: number } | null;
	suggestions: Suggestion[];
	isTyping: boolean;
	lastWord: string;
}

export interface ActionMenuProps {
	onExecute?: () => Promise<void>;
	getEditorContent?: () => string;
}

export interface DropZoneProps {
	className?: string;
}

export interface WorkspaceProps {
	workspaces: Array<{ id: string; name: string }>;
	activeWorkspace: string | null;
	onWorkspaceChange: (id: string) => Promise<void>;
	onWorkspaceDelete: (id: string) => Promise<void>;
	onCreateWorkspace: (name: string) => Promise<void>;
	onRenameWorkspace: (id: string, newName: string) => Promise<void>;
}

export interface WorkspaceDropdownPortalProps {
	show: boolean;
	anchorRef: React.RefObject<HTMLDivElement>;
	dropdownRef: React.RefObject<HTMLDivElement>;
	workspaces: Array<{ id: string; name: string }>;
	activeWorkspace: string | null;
	isCreatingWorkspace: boolean;
	onWorkspaceChange: (id: string) => void;
	onWorkspaceDelete: (id: string) => void;
	onRenameWorkspace: (id: string, newName: string) => Promise<void>;
	onCreateWorkspace: (name: string) => void;
	onCreateClick: (e?: React.MouseEvent) => void;
}

export interface DeleteWorkspaceState {
	isOpen: boolean;
	workspaceId: string | null;
	workspaceName: string | null;
}

export interface Workspace {
	id: string;
	name: string;
	path: string;
	createdAt: string;
	updatedAt: string;
}

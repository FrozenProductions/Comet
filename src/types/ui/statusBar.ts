import type { editor } from "monaco-editor";
import type React from "react";

export type EditorPosition = {
	lineNumber: number;
	column: number;
};

export type ErrorDropdownProps = {
	diagnostics: editor.IMarker[];
	onClose: () => void;
	buttonRef: React.RefObject<HTMLButtonElement>;
};

export type StatusBarItemType =
	| "sidebar"
	| "search"
	| "beautify"
	| "diagnostics"
	| "lines"
	| "position";

export type StatusBarItem = {
	id: StatusBarItemType;
	group: "left" | "right";
};

export type StatusBarConfig = {
	order: StatusBarItem[];
};

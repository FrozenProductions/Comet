import type * as monaco from "monaco-editor";
import type React from "react";

export interface EditorPosition {
	lineNumber: number;
	column: number;
}

export interface ErrorDropdownProps {
	diagnostics: monaco.editor.IMarker[];
	onClose: () => void;
	buttonRef: React.RefObject<HTMLButtonElement>;
}

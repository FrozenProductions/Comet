import type { editor } from "monaco-editor";

export interface EditorState {
	viewState: editor.ICodeEditorViewState | null;
	model: {
		value: string;
		undoStack: any[];
		redoStack: any[];
	};
}

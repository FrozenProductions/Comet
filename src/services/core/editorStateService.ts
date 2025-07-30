import type { editor } from "monaco-editor";

export interface EditorState {
	viewState: editor.ICodeEditorViewState | null;
	model: {
		value: string;
		undoStack: any[];
		redoStack: any[];
	};
}

const EDITOR_STATES_MAP = new Map<string, EditorState>();

export const saveEditorState = (
	workspaceId: string,
	tabId: string,
	editor: editor.IStandaloneCodeEditor,
) => {
	const model = editor.getModel();
	if (!model) return;

	const viewState = editor.saveViewState();
	const commandManager = (model as any)._commandManager;

	EDITOR_STATES_MAP.set(`${workspaceId}:${tabId}`, {
		viewState,
		model: {
			value: model.getValue(),
			undoStack: commandManager?.past || [],
			redoStack: commandManager?.future || [],
		},
	});
};

export const restoreEditorState = (
	workspaceId: string,
	tabId: string,
	editor: editor.IStandaloneCodeEditor,
) => {
	const state = EDITOR_STATES_MAP.get(`${workspaceId}:${tabId}`);
	if (!state) return;

	const model = editor.getModel();
	if (!model) return;

	if (state.viewState) {
		editor.restoreViewState(state.viewState);
	}

	const commandManager = (model as any)._commandManager;
	if (commandManager) {
		commandManager.past = state.model.undoStack;
		commandManager.future = state.model.redoStack;
	}
};

export const clearEditorState = (workspaceId: string, tabId: string) => {
	EDITOR_STATES_MAP.delete(`${workspaceId}:${tabId}`);
};

export const clearAllEditorStates = () => {
	EDITOR_STATES_MAP.clear();
};

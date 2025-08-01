import type { editor } from "monaco-editor";
import { EDITOR_STATES_MAP } from "../../constants/core/editorState";

/**
 * Saves the current state of an editor for a specific workspace and tab
 * @param workspaceId The ID of the workspace
 * @param tabId The ID of the tab
 * @param editor The Monaco editor instance
 */
export const saveEditorState = (
	workspaceId: string,
	tabId: string,
	editor: editor.IStandaloneCodeEditor,
) => {
	const model = editor.getModel();
	if (!model) return;

	const viewState = editor.saveViewState();
	const commandManager = (model as any)._commandManager;
	const position = editor.getPosition();

	EDITOR_STATES_MAP.set(`${workspaceId}:${tabId}`, {
		viewState,
		model: {
			value: model.getValue(),
			undoStack: commandManager?.past || [],
			redoStack: commandManager?.future || [],
		},
		position: position
			? {
					lineNumber: position.lineNumber,
					column: position.column,
				}
			: null,
	});
};

/**
 * Restores a previously saved editor state for a specific workspace and tab
 * @param workspaceId The ID of the workspace
 * @param tabId The ID of the tab
 * @param editor The Monaco editor instance
 */
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

	if (state.position) {
		editor.setPosition(state.position);
		editor.revealPositionInCenter(state.position);
	}
};

/**
 * Clears the saved editor state for a specific workspace and tab
 * @param workspaceId The ID of the workspace
 * @param tabId The ID of the tab
 */
export const clearEditorState = (workspaceId: string, tabId: string) => {
	EDITOR_STATES_MAP.delete(`${workspaceId}:${tabId}`);
};

/**
 * Gets the saved editor state for a specific workspace and tab
 * @param workspaceId The ID of the workspace
 * @param tabId The ID of the tab
 */
export const getEditorState = (workspaceId: string, tabId: string) => {
	return EDITOR_STATES_MAP.get(`${workspaceId}:${tabId}`);
};

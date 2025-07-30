import type { EditorState } from "../../types/core/editorState";

/**
 * Map to store editor states for different workspace and tab combinations
 */
export const EDITOR_STATES_MAP = new Map<string, EditorState>();

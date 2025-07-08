import type * as monaco from "monaco-editor";
import { suggestionService } from "../services/features/suggestionService";
import type { Suggestion } from "../types/core/editor";

const LOCAL_PATTERN = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
const FUNCTION_PATTERN = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
const METHOD_PATTERN = /([a-zA-Z_][a-zA-Z0-9_]*):([a-zA-Z_][a-zA-Z0-9_]*)/g;

/**
 * Extracts builtin function, method, and library names from the suggestions service
 * @returns An array of strings containing the labels of all function, method, and library suggestions
 */
export const getBuiltinsFromSuggestions = (): string[] => {
	const suggestions = suggestionService.getSuggestions();
	return suggestions.filter((s) => s.type === "function").map((s) => s.label);
};

export const getSuggestions = (
	model: monaco.editor.ITextModel,
	position: monaco.Position,
	settings: { maxSuggestions: number },
): Suggestion[] => {
	const word = model.getWordUntilPosition(position);
	const wordText = word.word.toLowerCase();

	if (wordText.length < 2) return [];

	const lineContent = model.getLineContent(position.lineNumber);
	const beforeCursor = lineContent.substring(0, position.column - 1);

	if (beforeCursor.match(/--[^[[].*$/)) return [];

	const commentStart = beforeCursor.lastIndexOf("--[[");
	const commentEnd = beforeCursor.lastIndexOf("]]");
	if (commentStart > commentEnd) return [];

	let inString = false;
	let stringChar = "";
	for (let i = 0; i < position.column - 1; i++) {
		const char = lineContent[i];
		if (
			(char === '"' || char === "'") &&
			(i === 0 || lineContent[i - 1] !== "\\")
		) {
			if (!inString) {
				inString = true;
				stringChar = char;
			} else if (char === stringChar) {
				inString = false;
			}
		}
	}
	if (inString) return [];

	const suggestions: Suggestion[] = [];

	const apiSuggestions = suggestionService.getSuggestions();
	apiSuggestions
		.filter((s) => s.label.toLowerCase().includes(wordText))
		.forEach((s) => suggestions.push(s));

	const text = model.getValue();
	let match: RegExpExecArray | null;

	match = LOCAL_PATTERN.exec(text);
	while (match !== null) {
		const varName = match[1];
		if (varName.toLowerCase().includes(wordText)) {
			suggestions.push({
				type: "variable",
				label: varName,
				detail: "Local Variable",
				documentation: "Local variable declared in the current file",
			});
		}
		match = LOCAL_PATTERN.exec(text);
	}

	match = FUNCTION_PATTERN.exec(text);
	while (match !== null) {
		const funcName = match[1];
		if (funcName.toLowerCase().includes(wordText)) {
			suggestions.push({
				type: "function",
				label: funcName,
				detail: "Function",
				documentation: "Function declared in the current file",
			});
		}
		match = FUNCTION_PATTERN.exec(text);
	}

	match = METHOD_PATTERN.exec(text);
	while (match !== null) {
		const methodName = match[2];
		if (methodName.toLowerCase().includes(wordText)) {
			suggestions.push({
				type: "method",
				label: methodName,
				detail: "Method",
				documentation: "Method called in the current file",
			});
		}
		match = METHOD_PATTERN.exec(text);
	}

	const maxSuggestions = settings?.maxSuggestions || 10;
	return suggestions.slice(0, maxSuggestions);
};

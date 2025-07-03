import type * as monaco from "monaco-editor";
import { suggestionService } from "../services/features/suggestionService";
import type { Suggestion } from "../types/core/editor";

const localPattern = /local\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
const functionPattern = /function\s+([a-zA-Z_][a-zA-Z0-9_]*)/g;
const methodPattern = /([a-zA-Z_][a-zA-Z0-9_]*):([a-zA-Z_][a-zA-Z0-9_]*)/g;

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

	match = localPattern.exec(text);
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
		match = localPattern.exec(text);
	}

	match = functionPattern.exec(text);
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
		match = functionPattern.exec(text);
	}

	match = methodPattern.exec(text);
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
		match = methodPattern.exec(text);
	}

	const maxSuggestions = settings?.maxSuggestions || 10;
	return suggestions.slice(0, maxSuggestions);
};

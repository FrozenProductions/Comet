import { type FC, useEffect, useState, useRef, useCallback } from "react";
import * as monaco from "monaco-editor";
import debounce from "lodash/debounce";
import {
	monacoTheme,
	luaLanguage,
	luaLanguageConfig,
} from "../../constants/editor";
import { EDITOR_DEFAULT_OPTIONS } from "../../constants/workspace";
import { useEditor } from "../../hooks/useEditor";
import { useSettings } from "../../hooks/useSettings";
import { useKeybinds } from "../../hooks/useKeybinds";
import { useConsole } from "../../hooks/useConsole";
import { IntelliSense } from "./intelliSense";
import { EditorSearch } from "./editorSearch";
import { getSuggestions } from "../../utils/suggestions";
import { Actions } from "../ui/editorActions";
import type { CodeEditorProps, IntellisenseState } from "../../types/workspace";
import { suggestionService } from "../../services/suggestionService";

const modelsMap = new Map<string, monaco.editor.ITextModel>();
const editorStatesMap = new Map<
	string,
	{
		viewState: monaco.editor.ICodeEditorViewState | null;
		position: monaco.Position | null;
	}
>();

export const CodeEditor: FC<CodeEditorProps> = ({
	content,
	language,
	onChange,
	showActions = true,
}) => {
	const { setPosition, activeTab } = useEditor();
	const { settings } = useSettings();
	const { keybinds } = useKeybinds();
	const { isFloating } = useConsole();
	const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
	const containerRef = useRef<HTMLDivElement>(null);
	const modelRef = useRef<monaco.editor.ITextModel | null>(null);
	const [isSearchVisible, setIsSearchVisible] = useState(false);
	const [showFirstTimeTooltip, setShowFirstTimeTooltip] = useState(false);
	const [intellisenseState, setIntellisenseState] = useState<IntellisenseState>(
		{
			isVisible: false,
			position: null,
			suggestions: [],
			isTyping: false,
			lastWord: "",
		},
	);

	const debouncedSave = useCallback(() => {
		return debounce((value: string) => {
			onChange?.(value);
		}, 300);
	}, [onChange])();

	const saveEditorState = useCallback(() => {
		if (!editorRef.current || !activeTab) return;

		const viewState = editorRef.current.saveViewState();
		const position = editorRef.current.getPosition();

		editorStatesMap.set(activeTab, {
			viewState,
			position,
		});
	}, [activeTab]);

	const restoreEditorState = useCallback(() => {
		if (!editorRef.current || !activeTab) return;

		const savedState = editorStatesMap.get(activeTab);
		if (savedState) {
			if (savedState.viewState) {
				editorRef.current.restoreViewState(savedState.viewState);
			}
			if (savedState.position) {
				editorRef.current.setPosition(savedState.position);
				editorRef.current.revealPositionInCenter(savedState.position);
			}
		}
	}, [activeTab]);

	useEffect(() => {
		const resizeObserver = new ResizeObserver(() => {
			if (editorRef.current) {
				editorRef.current.layout();
			}
		});

		if (containerRef.current) {
			resizeObserver.observe(containerRef.current);
		}

		return () => {
			resizeObserver.disconnect();
		};
	}, []);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <>
	useEffect(() => {
		if (!containerRef.current || !activeTab) return;

		if (editorRef.current) {
			saveEditorState();
			editorRef.current.dispose();
		}

		monaco.languages.register({ id: "lua" });
		monaco.languages.setMonarchTokensProvider("lua", luaLanguage);
		monaco.languages.setLanguageConfiguration("lua", luaLanguageConfig);
		monaco.editor.defineTheme("Comet", monacoTheme);
		monaco.editor.setTheme("Comet");

		const keybindingRules = [
			{
				key: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyG,
			},
			{
				key: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyK,
			},
			{ key: monaco.KeyCode.F1 },
			{ key: monaco.KeyCode.F3 },
			{ key: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI },
			{ key: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE },
			{ key: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG },
			{ key: monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter },
			{ key: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyL },
			{
				key: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyE,
			},
			{
				key: monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.KeyL,
			},
		];

		keybindingRules.forEach(({ key }) => {
			monaco.editor.addKeybindingRule({
				keybinding: key,
				command: null,
			});
		});

		let model = modelsMap.get(activeTab);
		if (!model) {
			model = monaco.editor.createModel(content, language);
			modelsMap.set(activeTab, model);
		} else if (model.getValue() !== content) {
			model.setValue(content);
		}
		modelRef.current = model;

		const editor = monaco.editor.create(containerRef.current, {
			model,
			theme: "Comet",
			automaticLayout: true,
			...EDITOR_DEFAULT_OPTIONS,
			fontSize: settings.text.fontSize,
			lineNumbers: settings.display.showLineNumbers ? "on" : "off",
			wordWrap: settings.display.wordWrap ? "on" : "off",
			tabSize: settings.text.tabSize,
			lineDecorationsWidth: Math.floor(settings.text.fontSize * 0.75),
			cursorBlinking: settings.cursor.blinking,
			cursorStyle: settings.cursor.style,
			cursorSmoothCaretAnimation: settings.cursor.smoothCaret ? "on" : "off",
			cursorWidth: settings.cursor.style === "line" ? 2 : 0,
		});

		editorRef.current = editor;

		restoreEditorState();

		keybinds.forEach((keybind) => {
			let monacoKey = 0;
			if (keybind.modifiers.cmd) monacoKey |= monaco.KeyMod.CtrlCmd;
			if (keybind.modifiers.shift) monacoKey |= monaco.KeyMod.Shift;
			if (keybind.modifiers.alt) monacoKey |= monaco.KeyMod.Alt;
			if (keybind.modifiers.ctrl) monacoKey |= monaco.KeyMod.WinCtrl;

			const keyCode =
				monaco.KeyCode[
					keybind.key.toUpperCase() as keyof typeof monaco.KeyCode
				] || 0;
			monacoKey |= keyCode;

			editor.addCommand(monacoKey, () => {}, "");
		});

		editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
			editor.trigger("custom", "hideFindWidget", null);
			setIsSearchVisible(true);
		});

		editor.onKeyDown((e: monaco.IKeyboardEvent) => {
			if (intellisenseState.isVisible) {
				if (
					e.code === "ArrowDown" ||
					e.code === "ArrowUp" ||
					e.code === "Enter" ||
					e.code === "Tab"
				) {
					e.preventDefault();
					e.stopPropagation();
				}
			}

			if (
				e.code === "Escape" ||
				e.code === "Delete" ||
				e.code === "Backspace"
			) {
				setIntellisenseState((prev) => ({
					...prev,
					isVisible: false,
					isTyping: false,
				}));
				if (e.code === "Escape") {
					setIsSearchVisible(false);
				}
			}
		});

		editor.onDidChangeCursorPosition((e) => {
			setPosition({
				lineNumber: e.position.lineNumber,
				column: e.position.column,
			});

			if (e.reason === monaco.editor.CursorChangeReason.Explicit) {
				const model = editor.getModel();
				const position = editor.getPosition();
				if (!model || !position) return;

				const word = model.getWordUntilPosition(position);
				const currentWord = word.word;

				if (
					currentWord === intellisenseState.lastWord &&
					currentWord.length >= 2
				) {
					if (!settings.intellisense.enabled) return;

					const suggestions = getSuggestions(model, position, {
						maxSuggestions: settings.intellisense.maxSuggestions,
					});
					if (suggestions.length > 0) {
						const coords = editor.getScrolledVisiblePosition(position);
						const editorDom = editor.getDomNode();
						if (!editorDom || !coords) return;

						const editorRect = editorDom.getBoundingClientRect();
						setIntellisenseState((prev) => ({
							...prev,
							position: {
								x: editorRect.left + coords.left,
								y: editorRect.top + coords.top + 20,
							},
							suggestions,
						}));
						return;
					}
				}

				setIntellisenseState((prev) => ({ ...prev, isVisible: false }));
			}
		});

		editor.onDidChangeModelContent(() => {
			const model = editor.getModel();
			const position = editor.getPosition();
			if (!model || !position) return;

			const word = model.getWordUntilPosition(position);
			const currentWord = word.word;

			if (!settings.intellisense.enabled) {
				setIntellisenseState((prev) => ({ ...prev, isVisible: false }));
				return;
			}

			const suggestions = getSuggestions(model, position, {
				maxSuggestions: settings.intellisense.maxSuggestions,
			});

			if (suggestions.length > 0 && currentWord.length >= 2) {
				const coords = editor.getScrolledVisiblePosition(position);
				const editorDom = editor.getDomNode();
				if (!editorDom || !coords) return;

				const editorRect = editorDom.getBoundingClientRect();
				setIntellisenseState({
					isVisible: true,
					position: {
						x: editorRect.left + coords.left,
						y: editorRect.top + coords.top + 20,
					},
					suggestions,
					isTyping: true,
					lastWord: currentWord,
				});
			} else {
				setIntellisenseState((prev) => ({ ...prev, isVisible: false }));
			}

			const currentValue = model.getValue();
			debouncedSave(currentValue);
		});

		editor.onDidPaste(() => {
			const model = editor.getModel();
			if (!model) return;

			const currentValue = model.getValue();
			debouncedSave(currentValue);
		});

		return () => {
			debouncedSave.cancel();
			saveEditorState();
			editor.dispose();
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [
		activeTab,
		language,
		settings,
		keybinds,
		saveEditorState,
		restoreEditorState,
	]);

	useEffect(() => {
		return () => {
			modelsMap.forEach((model) => model.dispose());
			modelsMap.clear();
			editorStatesMap.clear();
		};
	}, []);

	useEffect(() => {
		if (modelRef.current && modelRef.current.getValue() !== content) {
			modelRef.current.setValue(content);
		}
	}, [content]);

	useEffect(() => {
		suggestionService.loadSuggestions();
	}, []);

	useEffect(() => {
		const hasVisited = localStorage.getItem('hasVisitedBefore');
		if (!hasVisited) {
			setShowFirstTimeTooltip(true);
		}
	}, []);

	const handleArrowHover = () => {
		if (showFirstTimeTooltip) {
			setShowFirstTimeTooltip(false);
			localStorage.setItem('hasVisitedBefore', 'true');
		}
	};

	const handleSuggestionSelect = (suggestion: string) => {
		if (!editorRef.current) return;

		const position = editorRef.current.getPosition();
		if (!position) return;

		const model = editorRef.current.getModel();
		if (!model) return;

		const word = model.getWordAtPosition(position);
		if (!word) return;

		const range = new monaco.Range(
			position.lineNumber,
			word.startColumn,
			position.lineNumber,
			word.endColumn,
		);

		editorRef.current.executeEdits("intellisense", [
			{
				range,
				text: suggestion,
			},
		]);

		setIntellisenseState((prev) => ({ ...prev, isVisible: false }));
	};

	const getEditorContent = useCallback(() => {
		if (!modelRef.current) return "";
		return modelRef.current.getValue();
	}, []);

	return (
		<div className="relative h-full w-full select-none bg-ctp-surface0/70">
			<div ref={containerRef} className="h-full w-full" />
			<IntelliSense
				isVisible={intellisenseState.isVisible}
				position={intellisenseState.position}
				suggestions={intellisenseState.suggestions}
				onSelect={handleSuggestionSelect}
				onClose={() =>
					setIntellisenseState((prev) => ({
						...prev,
						isVisible: false,
					}))
				}
			/>
			<EditorSearch
				editor={editorRef.current}
				isVisible={isSearchVisible}
				onClose={() => setIsSearchVisible(false)}
			/>
			{showActions && (
				<>
					{showFirstTimeTooltip && (
						<div className={`absolute right-4 ${settings.interface.zenMode || isFloating || !settings.interface.showConsole ? "bottom-16" : "bottom-24"} z-50 rounded-lg border border-ctp-surface2 bg-ctp-mantle px-3 py-2 text-sm font-medium text-ctp-text shadow-lg`}>
							Hover here to see available actions!
							<div className="absolute -bottom-2 right-4 h-3 w-3 rotate-45 border-b border-r border-ctp-surface2 bg-ctp-mantle"></div>
						</div>
					)}
					<Actions getEditorContent={getEditorContent} onArrowHover={handleArrowHover} />
				</>
			)}
		</div>
	);
};

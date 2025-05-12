import { FC, useEffect, useState, useRef, useCallback } from "react";
import Editor, { loader, OnMount } from "@monaco-editor/react";
import {
    monacoTheme,
    luaLanguage,
    luaLanguageConfig,
} from "../../constants/editor";
import { EDITOR_DEFAULT_OPTIONS } from "../../constants/workspace";
import { useEditor } from "../../contexts/EditorContext";
import { useSettings } from "../../contexts/SettingsContext";
import { useKeybinds } from "../../contexts/KeybindsContext";
import { IntelliSense } from "./IntelliSense";
import { EditorSearch } from "./EditorSearch";
import { getSuggestions } from "../../utils/suggestions";
import * as monaco from "monaco-editor";
import { Actions } from "../ui/EditorActions";
import type { CodeEditorProps, IntellisenseState } from "../../types/workspace";

export const CodeEditor: FC<CodeEditorProps> = ({
    content,
    language,
    onChange,
}) => {
    const { setPosition } = useEditor();
    const { settings } = useSettings();
    const { keybinds } = useKeybinds();
    const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
    const [isSearchVisible, setIsSearchVisible] = useState(false);
    const [intellisenseState, setIntellisenseState] =
        useState<IntellisenseState>({
            isVisible: false,
            position: null,
            suggestions: [],
            isTyping: false,
            lastWord: "",
        });

    useEffect(() => {
        loader.init().then((monaco) => {
            monaco.editor.addKeybindingRule({
                keybinding:
                    monaco.KeyMod.CtrlCmd |
                    monaco.KeyMod.Shift |
                    monaco.KeyCode.KeyG,
                command: null,
            });
            monaco.editor.addKeybindingRule({
                keybinding:
                    monaco.KeyMod.CtrlCmd |
                    monaco.KeyMod.Shift |
                    monaco.KeyCode.KeyK,
                command: null,
            });
            monaco.editor.addKeybindingRule({
                keybinding: monaco.KeyCode.F1,
                command: null,
            });
            monaco.editor.addKeybindingRule({
                keybinding: monaco.KeyCode.F3,
                command: null,
            });
            monaco.editor.addKeybindingRule({
                keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyI,
                command: null,
            });
            monaco.editor.addKeybindingRule({
                keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE,
                command: null,
            });
            monaco.editor.addKeybindingRule({
                keybinding: monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyG,
                command: null,
            });

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

                monaco.editor.addKeybindingRule({
                    keybinding: monacoKey,
                    command: null,
                });
            });

            monaco.languages.register({ id: "lua" });
            monaco.languages.setMonarchTokensProvider("lua", luaLanguage);
            monaco.languages.setLanguageConfiguration("lua", luaLanguageConfig);

            monaco.editor.defineTheme("Comet", monacoTheme);
            monaco.editor.setTheme("Comet");
        });
    }, [keybinds]);

    const handleEditorMount: OnMount = (editor) => {
        editorRef.current = editor;

        editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyF, () => {
            editor.trigger("custom", "hideFindWidget", null);
            setIsSearchVisible(true);
        });

        editor.onKeyDown((e) => {
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

            if (e.code === "Escape") {
                setIntellisenseState((prev) => ({
                    ...prev,
                    isVisible: false,
                    isTyping: false,
                }));
                setIsSearchVisible(false);
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
                        const coords =
                            editor.getScrolledVisiblePosition(position);
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

        editor.onDidChangeModelContent((e) => {
            const model = editor.getModel();
            const position = editor.getPosition();
            if (!model || !position) return;

            const word = model.getWordUntilPosition(position);
            const currentWord = word.word;

            const isTyping = e.changes.some((change) => change.text.length > 0);

            if (!isTyping && currentWord === intellisenseState.lastWord) return;
            if (!settings.intellisense.enabled) {
                setIntellisenseState((prev) => ({ ...prev, isVisible: false }));
                return;
            }

            const suggestions = getSuggestions(model, position, {
                maxSuggestions: settings.intellisense.maxSuggestions,
            });

            if (
                suggestions.length > 0 ||
                (currentWord.length >= 2 && isTyping)
            ) {
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
                    isTyping,
                    lastWord: currentWord,
                });
            } else {
                setIntellisenseState((prev) => ({ ...prev, isVisible: false }));
            }
        });
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
            word.endColumn
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
        if (!editorRef.current) return "";
        return editorRef.current.getValue();
    }, []);

    return (
        <div className="h-full w-full relative bg-ctp-surface0/70">
            <Editor
                height="100%"
                width="100%"
                defaultLanguage={language}
                value={content}
                onChange={onChange}
                theme="Comet"
                onMount={handleEditorMount}
                options={{
                    ...EDITOR_DEFAULT_OPTIONS,
                    fontSize: settings.text.fontSize,
                    lineNumbers: settings.display.showLineNumbers
                        ? "on"
                        : "off",
                    wordWrap: settings.display.wordWrap ? "on" : "off",
                    tabSize: settings.text.tabSize,
                    lineDecorationsWidth: Math.floor(
                        settings.text.fontSize * 0.75
                    ),
                    cursorBlinking: settings.cursor.blinking,
                    cursorStyle: settings.cursor.style,
                    cursorSmoothCaretAnimation: settings.cursor.smoothCaret
                        ? "on"
                        : "off",
                    cursorWidth: settings.cursor.style === "line" ? 2 : 0,
                }}
            />
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
            <Actions getEditorContent={getEditorContent} />
        </div>
    );
};

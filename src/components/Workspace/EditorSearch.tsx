import { FC, useEffect, useState, useCallback, useRef } from "react";
import * as monaco from "monaco-editor";
import { X, ChevronUp, ChevronDown, CaseSensitive, Regex } from "lucide-react";
import type { EditorSearchProps } from "../../types/workspace";

export const EditorSearch: FC<EditorSearchProps> = ({
    editor,
    isVisible,
    onClose,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [matchCase, setMatchCase] = useState(false);
    const [useRegex, setUseRegex] = useState(false);
    const [matchCount, setMatchCount] = useState(0);
    const [currentMatch, setCurrentMatch] = useState(0);
    const searchInputRef = useRef<HTMLInputElement>(null);
    const decorationsRef = useRef<string[]>([]);

    const clearDecorations = useCallback(() => {
        if (editor && decorationsRef.current.length) {
            editor.removeDecorations(decorationsRef.current);
            decorationsRef.current = [];
        }
    }, [editor]);

    const handleClose = useCallback(() => {
        clearDecorations();
        onClose();
    }, [clearDecorations, onClose]);

    const updateSearch = useCallback(() => {
        if (!editor || !searchTerm) {
            setMatchCount(0);
            setCurrentMatch(0);
            clearDecorations();
            return;
        }

        const model = editor.getModel();
        if (!model) return;

        try {
            clearDecorations();

            let searchRegex: RegExp;
            if (useRegex) {
                searchRegex = new RegExp(searchTerm, matchCase ? "g" : "gi");
            } else {
                searchRegex = new RegExp(
                    searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
                    matchCase ? "g" : "gi"
                );
            }

            const matches: monaco.Range[] = [];
            const text = model.getValue();
            let match;

            while ((match = searchRegex.exec(text)) !== null) {
                const startPos = model.getPositionAt(match.index);
                const endPos = model.getPositionAt(
                    match.index + match[0].length
                );
                matches.push(
                    new monaco.Range(
                        startPos.lineNumber,
                        startPos.column,
                        endPos.lineNumber,
                        endPos.column
                    )
                );
            }

            decorationsRef.current = editor.deltaDecorations(
                [],
                [
                    ...matches.map((range, index) => ({
                        range,
                        options: {
                            isWholeLine: false,
                            className: "",
                            inlineClassName:
                                currentMatch === index + 1
                                    ? "search-match-current"
                                    : "search-match",
                            stickiness:
                                monaco.editor.TrackedRangeStickiness
                                    .NeverGrowsWhenTypingAtEdges,
                        },
                    })),
                ]
            );

            setMatchCount(matches.length);
            if (matches.length > 0 && currentMatch === 0) {
                setCurrentMatch(1);
                editor.revealRangeInCenter(matches[0]);
            }
        } catch (error) {
            setMatchCount(0);
            setCurrentMatch(0);
        }
    }, [
        editor,
        searchTerm,
        matchCase,
        useRegex,
        currentMatch,
        clearDecorations,
    ]);

    useEffect(() => {
        updateSearch();
    }, [updateSearch]);

    useEffect(() => {
        if (isVisible && searchInputRef.current) {
            searchInputRef.current.focus();

            if (editor) {
                const selection = editor.getSelection();
                if (selection && !selection.isEmpty()) {
                    const selectedText =
                        editor.getModel()?.getValueInRange(selection) || "";
                    setSearchTerm(selectedText);
                }
            }
        }
    }, [isVisible, editor]);

    const handleNext = useCallback(() => {
        if (!editor || matchCount === 0) return;
        const nextMatch = (currentMatch % matchCount) + 1;
        setCurrentMatch(nextMatch);

        const model = editor.getModel();
        if (!model) return;

        try {
            const searchRegex = useRegex
                ? new RegExp(searchTerm, matchCase ? "g" : "gi")
                : new RegExp(
                      searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
                      matchCase ? "g" : "gi"
                  );

            const text = model.getValue();
            let match;
            let currentIndex = 0;

            while ((match = searchRegex.exec(text)) !== null) {
                currentIndex++;
                if (currentIndex === nextMatch) {
                    const startPos = model.getPositionAt(match.index);
                    const endPos = model.getPositionAt(
                        match.index + match[0].length
                    );
                    const range = new monaco.Range(
                        startPos.lineNumber,
                        startPos.column,
                        endPos.lineNumber,
                        endPos.column
                    );

                    editor.setSelection(range);
                    editor.revealRangeInCenter(range);
                    break;
                }
            }
            updateSearch();
        } catch (error) {
            console.error(error);
        }
    }, [
        editor,
        searchTerm,
        matchCase,
        useRegex,
        matchCount,
        currentMatch,
        updateSearch,
    ]);

    const handlePrevious = useCallback(() => {
        if (!editor || matchCount === 0) return;
        const prevMatch = currentMatch === 1 ? matchCount : currentMatch - 1;
        setCurrentMatch(prevMatch);

        const model = editor.getModel();
        if (!model) return;

        try {
            const searchRegex = useRegex
                ? new RegExp(searchTerm, matchCase ? "g" : "gi")
                : new RegExp(
                      searchTerm.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&"),
                      matchCase ? "g" : "gi"
                  );

            const text = model.getValue();
            let match;
            let currentIndex = 0;

            while ((match = searchRegex.exec(text)) !== null) {
                currentIndex++;
                if (currentIndex === prevMatch) {
                    const startPos = model.getPositionAt(match.index);
                    const endPos = model.getPositionAt(
                        match.index + match[0].length
                    );
                    const range = new monaco.Range(
                        startPos.lineNumber,
                        startPos.column,
                        endPos.lineNumber,
                        endPos.column
                    );

                    editor.setSelection(range);
                    editor.revealRangeInCenter(range);
                    break;
                }
            }
            updateSearch();
        } catch (error) {
            console.error(error);
        }
    }, [
        editor,
        searchTerm,
        matchCase,
        useRegex,
        matchCount,
        currentMatch,
        updateSearch,
    ]);

    useEffect(() => {
        if (!isVisible) return;

        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleNext();
            } else if (e.key === "Enter" && e.shiftKey) {
                e.preventDefault();
                handlePrevious();
            } else if (e.key === "Escape") {
                e.preventDefault();
                handleClose();
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [isVisible, handleNext, handlePrevious, handleClose]);

    useEffect(() => {
        if (!isVisible) {
            clearDecorations();
        }
    }, [isVisible, clearDecorations]);

    if (!isVisible) return null;

    return (
        <div className="absolute top-0 right-0 mt-2 mr-2 bg-ctp-mantle/95 backdrop-blur rounded-lg shadow-lg border border-ctp-overlay0 p-3 flex flex-col gap-3 z-50 min-w-[320px]">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search..."
                        className="w-full bg-ctp-surface0 px-3 py-1.5 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-ctp-blue pr-24"
                    />
                    <div className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-ctp-surface1 rounded text-ctp-subtext0">
                        {matchCount > 0
                            ? `${currentMatch}/${matchCount}`
                            : "No matches"}
                    </div>
                </div>
                <button
                    onClick={handleClose}
                    className="p-1.5 hover:bg-ctp-surface0 rounded-lg transition-colors"
                    title="Close search (Esc)"
                >
                    <X size={14} className="stroke-[2.5]" />
                </button>
            </div>
            <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                    <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                        <input
                            type="checkbox"
                            checked={matchCase}
                            onChange={(e) => setMatchCase(e.target.checked)}
                            className="hidden"
                        />
                        <div
                            className={`p-1.5 rounded-lg transition-colors ${
                                matchCase
                                    ? "bg-ctp-blue text-ctp-base"
                                    : "hover:bg-ctp-surface0"
                            }`}
                        >
                            <CaseSensitive size={14} className="stroke-[2.5]" />
                        </div>
                        <span className="text-xs text-ctp-subtext0 group-hover:text-ctp-text transition-colors">
                            Match case
                        </span>
                    </label>
                    <label className="flex items-center gap-1.5 cursor-pointer select-none group">
                        <input
                            type="checkbox"
                            checked={useRegex}
                            onChange={(e) => setUseRegex(e.target.checked)}
                            className="hidden"
                        />
                        <div
                            className={`p-1.5 rounded-lg transition-colors ${
                                useRegex
                                    ? "bg-ctp-blue text-ctp-base"
                                    : "hover:bg-ctp-surface0"
                            }`}
                        >
                            <Regex size={14} className="stroke-[2.5]" />
                        </div>
                        <span className="text-xs text-ctp-subtext0 group-hover:text-ctp-text transition-colors">
                            Use regex
                        </span>
                    </label>
                </div>
                <div className="flex items-center gap-1">
                    <button
                        onClick={handlePrevious}
                        disabled={matchCount === 0}
                        className="p-1.5 hover:bg-ctp-surface0 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Previous match (⇧+Enter)"
                    >
                        <ChevronUp size={14} className="stroke-[2.5]" />
                    </button>
                    <button
                        onClick={handleNext}
                        disabled={matchCount === 0}
                        className="p-1.5 hover:bg-ctp-surface0 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        title="Next match (Enter)"
                    >
                        <ChevronDown size={14} className="stroke-[2.5]" />
                    </button>
                </div>
            </div>
        </div>
    );
};

import { CaseSensitive, ChevronDown, ChevronUp, Regex, X } from "lucide-react";
import * as monaco from "monaco-editor";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import type { EditorSearchProps } from "../../types/core/workspace";

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
		setSearchTerm("");
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
					searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
					matchCase ? "g" : "gi",
				);
			}

			const matches: monaco.Range[] = [];
			const text = model.getValue();
			let match: RegExpExecArray | null;

			match = searchRegex.exec(text);
			while (match !== null) {
				const startPos = model.getPositionAt(match.index);
				const endPos = model.getPositionAt(match.index + match[0].length);
				matches.push(
					new monaco.Range(
						startPos.lineNumber,
						startPos.column,
						endPos.lineNumber,
						endPos.column,
					),
				);
				match = searchRegex.exec(text);
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
				],
			);

			setMatchCount(matches.length);
			if (matches.length > 0 && currentMatch === 0) {
				setCurrentMatch(1);
				editor.revealRangeInCenter(matches[0]);
			}
		} catch (error) {
			console.error("Search error:", error);
			setMatchCount(0);
			setCurrentMatch(0);
		}
	}, [editor, searchTerm, matchCase, useRegex, currentMatch, clearDecorations]);

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
						searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
						matchCase ? "g" : "gi",
					);

			const text = model.getValue();
			let match: RegExpExecArray | null;
			let currentIndex = 0;

			match = searchRegex.exec(text);
			while (match !== null) {
				currentIndex++;
				if (currentIndex === nextMatch) {
					const startPos = model.getPositionAt(match.index);
					const endPos = model.getPositionAt(match.index + match[0].length);
					const range = new monaco.Range(
						startPos.lineNumber,
						startPos.column,
						endPos.lineNumber,
						endPos.column,
					);

					editor.setSelection(range);
					editor.revealRangeInCenter(range);
					break;
				}
				match = searchRegex.exec(text);
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
						searchTerm.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&"),
						matchCase ? "g" : "gi",
					);

			const text = model.getValue();
			let match: RegExpExecArray | null;
			let currentIndex = 0;

			match = searchRegex.exec(text);
			while (match !== null) {
				currentIndex++;
				if (currentIndex === prevMatch) {
					const startPos = model.getPositionAt(match.index);
					const endPos = model.getPositionAt(match.index + match[0].length);
					const range = new monaco.Range(
						startPos.lineNumber,
						startPos.column,
						endPos.lineNumber,
						endPos.column,
					);

					editor.setSelection(range);
					editor.revealRangeInCenter(range);
					break;
				}
				match = searchRegex.exec(text);
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
			const isSearchInputFocused =
				document.activeElement === searchInputRef.current;

			if (e.key === "Escape") {
				e.preventDefault();
				handleClose();
				return;
			}

			if (!isSearchInputFocused) return;

			if (e.key === "Enter" && !e.shiftKey) {
				e.preventDefault();
				handleNext();
			} else if (e.key === "Enter" && e.shiftKey) {
				e.preventDefault();
				handlePrevious();
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
		<div className="absolute right-0 top-0 z-50 mr-2 mt-2 flex min-w-[320px] flex-col gap-3 rounded-lg border border-ctp-overlay0 bg-ctp-mantle/95 p-3 shadow-lg">
			<div className="flex items-center gap-2">
				<div className="relative flex-1">
					<input
						ref={searchInputRef}
						type="text"
						value={searchTerm}
						onChange={(e) => setSearchTerm(e.target.value)}
						placeholder="Search..."
						className="w-full rounded-lg bg-ctp-surface0 px-3 py-1.5 pr-24 text-sm focus:outline-none focus:ring-1 focus:ring-ctp-blue"
					/>
					<div className="absolute right-2 top-1/2 -translate-y-1/2 rounded bg-ctp-surface1 px-2 py-0.5 text-xs text-ctp-subtext0">
						{matchCount > 0 ? `${currentMatch}/${matchCount}` : "No matches"}
					</div>
				</div>
				<button
					type="button"
					onClick={handleClose}
					className="rounded-lg p-1.5 transition-colors hover:bg-ctp-surface0"
					title="Close search (Esc)"
				>
					<X size={14} className="stroke-[2.5]" />
				</button>
			</div>
			<div className="flex items-center justify-between text-sm">
				<div className="flex items-center gap-3">
					<label className="group flex cursor-pointer select-none items-center gap-1.5">
						<input
							type="checkbox"
							checked={matchCase}
							onChange={(e) => setMatchCase(e.target.checked)}
							className="hidden"
						/>
						<div
							className={`rounded-lg p-1.5 transition-colors ${
								matchCase
									? "bg-ctp-blue text-ctp-base"
									: "hover:bg-ctp-surface0"
							}`}
						>
							<CaseSensitive size={14} className="stroke-[2.5]" />
						</div>
						<span className="text-xs text-ctp-subtext0 transition-colors group-hover:text-ctp-text">
							Match case
						</span>
					</label>
					<label className="group flex cursor-pointer select-none items-center gap-1.5">
						<input
							type="checkbox"
							checked={useRegex}
							onChange={(e) => setUseRegex(e.target.checked)}
							className="hidden"
						/>
						<div
							className={`rounded-lg p-1.5 transition-colors ${
								useRegex ? "bg-ctp-blue text-ctp-base" : "hover:bg-ctp-surface0"
							}`}
						>
							<Regex size={14} className="stroke-[2.5]" />
						</div>
						<span className="text-xs text-ctp-subtext0 transition-colors group-hover:text-ctp-text">
							Use regex
						</span>
					</label>
				</div>
				<div className="flex items-center gap-1">
					<button
						type="button"
						onClick={handlePrevious}
						disabled={matchCount === 0}
						className="rounded-lg p-1.5 transition-colors hover:bg-ctp-surface0 disabled:cursor-not-allowed disabled:opacity-50"
						title="Previous match (⇧+Enter)"
					>
						<ChevronUp size={14} className="stroke-[2.5]" />
					</button>
					<button
						type="button"
						onClick={handleNext}
						disabled={matchCount === 0}
						className="rounded-lg p-1.5 transition-colors hover:bg-ctp-surface0 disabled:cursor-not-allowed disabled:opacity-50"
						title="Next match (Enter)"
					>
						<ChevronDown size={14} className="stroke-[2.5]" />
					</button>
				</div>
			</div>
		</div>
	);
};

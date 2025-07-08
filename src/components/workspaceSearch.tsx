import { Command } from "lucide-react";
import * as monaco from "monaco-editor";
import { motion } from "motion/react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../hooks/core/useEditor";
import { useKeybinds } from "../hooks/core/useKeybinds";
import { useWorkspace } from "../hooks/core/useWorkspace";
import { getResultsWithContext } from "../services/core/workspaceSearchService";
import type { SearchResult } from "../types/ui/workspaceSearch";

export const WorkspaceSearch: FC = () => {
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isSearching, setIsSearching] = useState(false);
	const [hasSearched, setHasSearched] = useState(false);
	const { setActiveTab } = useEditor();
	const { activeWorkspace } = useWorkspace();
	const { isWorkspaceSearchOpen, setIsWorkspaceSearchOpen } = useKeybinds();
	const resultsContainerRef = useRef<HTMLDivElement>(null);
	const inputRef = useRef<HTMLInputElement>(null);

	const handleResultClick = useCallback(
		(result: SearchResult) => {
			setActiveTab(result.tab_id);

			setTimeout(() => {
				const editor = monaco.editor.getEditors()[0];
				if (editor) {
					const range = new monaco.Range(
						result.line_number,
						result.column_start + 1,
						result.line_number,
						result.column_end + 1,
					);

					editor.setPosition({
						lineNumber: result.line_number,
						column: result.column_start + 1,
					});
					editor.revealLineInCenter(result.line_number);

					editor.setSelection(range);

					editor.focus();
				}
			}, 50);

			setIsWorkspaceSearchOpen(false);
		},
		[setActiveTab, setIsWorkspaceSearchOpen],
	);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				setIsWorkspaceSearchOpen(false);
			} else if (e.key === "ArrowDown") {
				e.preventDefault();
				setSelectedIndex((prev) => {
					const newIndex = prev < results.length - 1 ? prev + 1 : prev;
					const container = resultsContainerRef.current;
					if (container) {
						const items = container.getElementsByTagName("button");
						const selectedItem = items[newIndex];
						if (selectedItem) {
							selectedItem.scrollIntoView({
								block: "center",
								behavior: "smooth",
							});
						}
					}
					return newIndex;
				});
			} else if (e.key === "ArrowUp") {
				e.preventDefault();
				setSelectedIndex((prev) => {
					const newIndex = prev > 0 ? prev - 1 : prev;
					const container = resultsContainerRef.current;
					if (container) {
						const items = container.getElementsByTagName("button");
						const selectedItem = items[newIndex];
						if (selectedItem) {
							selectedItem.scrollIntoView({
								block: "center",
								behavior: "smooth",
							});
						}
					}
					return newIndex;
				});
			} else if (e.key === "Enter" && results[selectedIndex]) {
				e.preventDefault();
				handleResultClick(results[selectedIndex]);
			}
		};

		if (isWorkspaceSearchOpen) {
			window.addEventListener("keydown", handleKeyDown);
			inputRef.current?.focus();
		}

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		isWorkspaceSearchOpen,
		results,
		selectedIndex,
		handleResultClick,
		setIsWorkspaceSearchOpen,
	]);

	useEffect(() => {
		setSelectedIndex(0);
	}, []);

	useEffect(() => {
		let timeoutId: NodeJS.Timeout;

		const performSearch = async () => {
			if (!searchQuery.trim() || !activeWorkspace) {
				setResults([]);
				setHasSearched(false);
				return;
			}

			setIsSearching(true);
			try {
				const searchResults = await getResultsWithContext(
					activeWorkspace,
					searchQuery,
				);
				setResults(searchResults);
				setHasSearched(true);
			} catch (error) {
				console.error("Search failed:", error);
				setResults([]);
				setHasSearched(true);
			} finally {
				setIsSearching(false);
			}
		};

		timeoutId = setTimeout(performSearch, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, activeWorkspace]);

	if (!isWorkspaceSearchOpen) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
			onClick={() => setIsWorkspaceSearchOpen(false)}
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: -20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: -20 }}
				className="w-[800px] overflow-hidden rounded-xl border border-ctp-surface2 bg-ctp-surface0 shadow-lg"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center gap-3 border-b border-ctp-surface2 p-4">
					<Command size={16} className="text-ctp-subtext0" />
					<input
						ref={inputRef}
						type="text"
						value={searchQuery}
						onChange={(e) => setSearchQuery(e.target.value)}
						placeholder="Search in workspace..."
						className="flex-1 border-none bg-transparent text-sm text-ctp-text outline-none placeholder:text-ctp-subtext0"
						autoComplete="off"
						spellCheck="false"
					/>
				</div>
				<div
					className="h-[600px] overflow-y-auto scroll-smooth"
					ref={resultsContainerRef}
				>
					<div className="flex h-full flex-col p-2">
						{isSearching ? (
							<div className="flex flex-1 select-none items-center justify-center rounded-lg p-8 text-center">
								<div className="flex flex-col items-center text-sm text-ctp-subtext0">
									<motion.div
										animate={{ rotate: 360 }}
										transition={{
											duration: 1,
											repeat: Infinity,
											ease: "linear",
										}}
										className="mb-3"
									>
										<Command size={24} className="text-ctp-subtext0/50" />
									</motion.div>
									<span>Searching workspace...</span>
								</div>
							</div>
						) : searchQuery.trim() === "" ? (
							<div className="flex flex-1 select-none items-center justify-center rounded-lg p-8 text-center">
								<div className="flex flex-col items-center">
									<Command size={32} className="mb-4 text-ctp-subtext0/50" />
									<div className="mb-3 text-sm font-medium text-ctp-text">
										Search workspace
									</div>
									<div className="flex flex-wrap items-center justify-center gap-3 text-xs text-ctp-subtext0">
										<div className="flex items-center gap-2">
											<kbd className="rounded border border-ctp-surface2 px-1.5 py-0.5 text-[10px] font-medium">
												Enter
											</kbd>
											<span>select</span>
										</div>
										<span className="text-ctp-surface2">•</span>
										<div className="flex items-center gap-2">
											<kbd className="rounded border border-ctp-surface2 px-1.5 py-0.5 text-[10px] font-medium">
												↑↓
											</kbd>
											<span>navigate</span>
										</div>
										<span className="text-ctp-surface2">•</span>
										<div className="flex items-center gap-2">
											<kbd className="rounded border border-ctp-surface2 px-1.5 py-0.5 text-[10px] font-medium">
												Esc
											</kbd>
											<span>close</span>
										</div>
									</div>
								</div>
							</div>
						) : hasSearched && results.length === 0 ? (
							<div className="flex flex-1 select-none items-center justify-center rounded-lg p-8 text-center">
								<div className="flex flex-col items-center">
									<Command size={32} className="mb-4 text-ctp-subtext0/50" />
									<div className="text-sm text-ctp-subtext0">
										No results found for "{searchQuery}"
									</div>
								</div>
							</div>
						) : (
							<div className="space-y-2 pt-2 pb-[300px]">
								{results.map((result, index) => (
									<motion.button
										key={`${result.tab_id}-${result.line_number}-${result.column_start}`}
										className={`group w-full select-none rounded-lg border ${
											selectedIndex === index
												? "border-ctp-surface2 bg-ctp-surface1"
												: "border-transparent bg-transparent hover:border-ctp-surface2 hover:bg-ctp-surface1/50"
										}`}
										onClick={() => handleResultClick(result)}
										initial={{ opacity: 0, y: 10 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ delay: index * 0.05 }}
									>
										<div className="flex items-center justify-between border-b border-ctp-surface2 px-3 py-2">
											<div className="flex items-center gap-2">
												<span className="font-medium text-ctp-text">
													{result.title}
												</span>
												<span className="rounded bg-ctp-surface2/30 px-1.5 py-0.5 text-[10px] text-ctp-subtext0">
													Line {result.line_number}
												</span>
											</div>
											{selectedIndex === index && (
												<kbd className="rounded border border-ctp-surface2 px-1.5 py-0.5 text-[10px] font-medium text-ctp-subtext0">
													Enter
												</kbd>
											)}
										</div>
										<div className="overflow-x-auto p-3 text-left font-mono">
											{result.context?.before.map((line, lineIdx) => (
												<div
													key={`${result.tab_id}-${result.line_number}-before-${result.line_number - ((result.context?.before.length ?? 0) - lineIdx)}`}
													className="px-2 text-xs leading-5 text-ctp-subtext0"
												>
													{line}
												</div>
											))}

											<div className="relative rounded bg-ctp-surface2/30 px-2 text-xs leading-5">
												<div className="absolute -left-0.5 top-0 h-full w-0.5 bg-ctp-yellow/50" />
												{result.line_content.slice(0, result.column_start)}
												<span className="bg-ctp-yellow/20 text-ctp-text">
													{result.line_content.slice(
														result.column_start,
														result.column_end,
													)}
												</span>
												{result.line_content.slice(result.column_end)}
											</div>

											{result.context?.after.map((line, lineIdx) => (
												<div
													key={`${result.tab_id}-${result.line_number}-after-${result.line_number + 1 + lineIdx}`}
													className="px-2 text-xs leading-5 text-ctp-subtext0"
												>
													{line}
												</div>
											))}
										</div>
									</motion.button>
								))}
							</div>
						)}
					</div>
				</div>
			</motion.div>
		</motion.div>
	);
};

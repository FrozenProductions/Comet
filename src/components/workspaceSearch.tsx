import { Search } from "lucide-react";
import * as monaco from "monaco-editor";
import { motion } from "motion/react";
import { type FC, useCallback, useEffect, useRef, useState } from "react";
import { useEditor } from "../hooks/core/useEditor";
import { useWorkspace } from "../hooks/core/useWorkspace";
import { getResultsWithContext } from "../services/core/workspaceSearchService";
import type {
	SearchResult,
	WorkspaceSearchProps,
} from "../types/ui/workspaceSearch";

export const WorkspaceSearch: FC<WorkspaceSearchProps> = ({
	isOpen,
	onClose,
}) => {
	const [searchQuery, setSearchQuery] = useState("");
	const [results, setResults] = useState<SearchResult[]>([]);
	const [selectedIndex, setSelectedIndex] = useState(0);
	const [isSearching, setIsSearching] = useState(false);
	const { setActiveTab } = useEditor();
	const { activeWorkspace } = useWorkspace();
	const resultsContainerRef = useRef<HTMLDivElement>(null);

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

			onClose();
		},
		[setActiveTab, onClose],
	);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") {
				onClose();
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

		if (isOpen) {
			window.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose, results, selectedIndex, handleResultClick]);

	useEffect(() => {
		setSelectedIndex(0);
	}, []);

	useEffect(() => {
		// biome-ignore lint/style/useConst: <>
		let timeoutId: NodeJS.Timeout;

		const performSearch = async () => {
			if (!searchQuery.trim() || !activeWorkspace) {
				setResults([]);
				return;
			}

			setIsSearching(true);
			try {
				const searchResults = await getResultsWithContext(
					activeWorkspace,
					searchQuery,
				);
				setResults(searchResults);
			} catch (error) {
				console.error("Search failed:", error);
				setResults([]);
			} finally {
				setIsSearching(false);
			}
		};

		timeoutId = setTimeout(performSearch, 300);

		return () => clearTimeout(timeoutId);
	}, [searchQuery, activeWorkspace]);

	if (!isOpen) return null;

	return (
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			exit={{ opacity: 0 }}
			className="fixed inset-0 z-50 flex items-center justify-center bg-black/20"
			onClick={onClose}
		>
			<motion.div
				initial={{ opacity: 0, scale: 0.95, y: -20 }}
				animate={{ opacity: 1, scale: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95, y: -20 }}
				className="w-[800px] overflow-hidden rounded-xl border border-ctp-surface2 bg-ctp-surface0 shadow-lg"
				onClick={(e) => e.stopPropagation()}
			>
				<div className="flex items-center gap-3 border-b border-ctp-surface2 p-4">
					<Search size={16} className="text-ctp-subtext0" />
					<input
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
					<div className="flex h-full flex-col p-2 pb-[300px]">
						{isSearching ? (
							<div className="flex flex-1 select-none flex-col items-center justify-center gap-4 rounded-lg p-8 text-center">
								<div className="text-sm text-ctp-subtext0">Searching...</div>
							</div>
						) : searchQuery.trim() === "" ? (
							<div className="flex flex-1 select-none flex-col items-center justify-center gap-4 rounded-lg p-8 text-center">
								<Search size={32} className="text-ctp-subtext0/50" />
								<div>
									<div className="mb-3 text-sm font-medium text-ctp-text">
										Start searching
									</div>
									<div className="flex items-center justify-center gap-3 text-xs text-ctp-subtext0">
										<div className="flex items-center gap-2">
											<kbd className="rounded border border-ctp-surface2 px-1.5 py-0.5 text-[10px] font-medium">
												Enter
											</kbd>
											<span>to search</span>
										</div>
										<span className="text-ctp-surface2">•</span>
										<div className="flex items-center gap-2">
											<kbd className="rounded border border-ctp-surface2 px-1.5 py-0.5 text-[10px] font-medium">
												↑↓
											</kbd>
											<span>to navigate</span>
										</div>
										<span className="text-ctp-surface2">•</span>
										<div className="flex items-center gap-2">
											<kbd className="rounded border border-ctp-surface2 px-1.5 py-0.5 text-[10px] font-medium">
												Esc
											</kbd>
											<span>to close</span>
										</div>
									</div>
								</div>
							</div>
						) : results.length === 0 ? (
							<div className="flex flex-1 select-none flex-col items-center justify-center gap-4 rounded-lg p-8 text-center">
								<Search size={32} className="text-ctp-subtext0/50" />
								<div className="text-sm text-ctp-subtext0">
									No results found
								</div>
							</div>
						) : (
							<div className="space-y-4 pt-2">
								{results.map((result, index) => (
									<motion.button
										key={`${result.tab_id}-${result.line_number}-${result.column_start}`}
										className={`group w-full select-none rounded-lg border ${
											selectedIndex === index
												? "border-ctp-surface2 bg-ctp-surface1"
												: "border-transparent bg-transparent hover:border-ctp-surface2 hover:bg-ctp-surface1/50"
										}`}
										onClick={() => handleResultClick(result)}
									>
										<div className="flex items-center justify-between border-b border-ctp-surface2 px-3 py-2">
											<span className="font-medium text-ctp-text">
												{result.title}
											</span>
											<span className="text-xs text-ctp-subtext0">
												Line {result.line_number}
											</span>
										</div>
										<div className="overflow-x-auto p-3 text-left font-mono">
											{/* Context before */}
											{result.context?.before.map((line, lineIdx) => (
												<div
													key={`${result.tab_id}-${result.line_number}-before-${result.line_number - ((result.context?.before.length ?? 0) - lineIdx)}`}
													className="px-2 text-xs leading-5 text-ctp-subtext0"
												>
													{line}
												</div>
											))}

											{/* Matching line */}
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

											{/* Context after */}
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

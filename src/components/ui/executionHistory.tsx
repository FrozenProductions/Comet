import { motion } from "framer-motion";
import { ChevronDown, ChevronRight, Trash2, X } from "lucide-react";
import {
	type KeyboardEvent,
	type MouseEvent,
	useCallback,
	useEffect,
	useRef,
	useState,
} from "react";
import {
	DEFAULT_EXECUTION_HISTORY_STATE,
	EXECUTION_HISTORY_STORAGE_KEY,
} from "../../constants/execution/executionHistory";
import { useEditor } from "../../hooks/core/useEditor";
import { useLocalStorage } from "../../hooks/core/useLocalStorage";
import { useExecutionHistory } from "../../hooks/execution/useExecutionHistory";
import type {
	ExecutionHistoryProps,
	ExecutionHistoryState,
} from "../../types/execution/executionHistory";

export const ExecutionHistory = ({
	isVisible,
	onClose,
}: ExecutionHistoryProps) => {
	const { history, clearHistory } = useExecutionHistory();
	const { createTabWithContent } = useEditor();
	const [expandedErrors, setExpandedErrors] = useState<Set<string>>(new Set());
	const [state, setState] = useLocalStorage<ExecutionHistoryState>(
		EXECUTION_HISTORY_STORAGE_KEY,
		DEFAULT_EXECUTION_HISTORY_STATE,
	);

	const [isDragging, setIsDragging] = useState(false);
	const [isResizing, setIsResizing] = useState(false);
	const dragStartPos = useRef<{ x: number; y: number } | null>(null);
	const resizeStartState = useRef<ExecutionHistoryState | null>(null);

	const handleOpenInEditor = async (content: string) => {
		await createTabWithContent("history.lua", content);
	};

	const containerVariants = {
		hidden: { opacity: 0, scale: 0.95, display: "none" },
		visible: {
			opacity: 1,
			scale: 1,
			display: "flex",
			transition: { duration: 0.2 },
		},
	};

	const handleDragEnd = useCallback(() => {
		setIsDragging(false);
		setIsResizing(false);
		dragStartPos.current = null;
		resizeStartState.current = null;
	}, []);

	const handleDragStart = (event: MouseEvent<HTMLButtonElement>) => {
		if (!isResizing) {
			setIsDragging(true);
			dragStartPos.current = {
				x: event.clientX - state.position.x,
				y: event.clientY - state.position.y,
			};
		}
	};

	const handleResizeStart = (event: MouseEvent<HTMLButtonElement>) => {
		event.stopPropagation();
		setIsResizing(true);
		resizeStartState.current = {
			position: { ...state.position },
			size: { ...state.size },
		};
		dragStartPos.current = {
			x: event.clientX,
			y: event.clientY,
		};
	};

	useEffect(() => {
		if (isDragging || isResizing) {
			const handleDrag = (event: globalThis.MouseEvent) => {
				const dragStart = dragStartPos.current;
				if (!dragStart) return;

				if (isDragging) {
					setState((prev) => ({
						...prev,
						position: {
							x: event.clientX - dragStart.x,
							y: event.clientY - dragStart.y,
						},
					}));
				} else if (isResizing) {
					const resizeStart = resizeStartState.current;
					if (!resizeStart) return;

					const dx = event.clientX - dragStart.x;
					const dy = event.clientY - dragStart.y;
					setState((prev) => ({
						...prev,
						size: {
							width: Math.max(400, resizeStart.size.width + dx),
							height: Math.max(300, resizeStart.size.height + dy),
						},
					}));
				}
			};

			window.addEventListener("mousemove", handleDrag);
			window.addEventListener("mouseup", handleDragEnd);
			return () => {
				window.removeEventListener("mousemove", handleDrag);
				window.removeEventListener("mouseup", handleDragEnd);
			};
		}
	}, [isDragging, isResizing, handleDragEnd, setState]);

	const toggleErrorExpand = (id: string) => {
		setExpandedErrors((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	const handleErrorKeyPress = (
		e: KeyboardEvent<HTMLButtonElement>,
		id: string,
	) => {
		if (e.key === "Enter" || e.key === " ") {
			e.preventDefault();
			toggleErrorExpand(id);
		}
	};

	const needsTruncation = (error: string) => {
		const lines = error.split("\n");
		return lines.length > 1 || lines[0].length > 85;
	};

	const truncateError = (error: string) => {
		const firstLine = error.split("\n")[0];
		if (firstLine.length > 85) {
			return `${firstLine.slice(0, 82)}...`;
		}
		return firstLine;
	};

	const getFirstLine = (error: string) => {
		return error.split("\n")[0];
	};

	return (
		<motion.div
			className="fixed z-50"
			initial={{ opacity: 0 }}
			animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
			exit={{ opacity: 0 }}
			style={{
				pointerEvents: isVisible ? "auto" : "none",
				left: state.position.x,
				top: state.position.y,
			}}
		>
			<motion.div
				className="flex flex-col overflow-hidden rounded-xl border border-ctp-surface2 bg-ctp-surface0 shadow-lg"
				variants={containerVariants}
				initial="hidden"
				animate={isVisible ? "visible" : "hidden"}
				style={{
					width: state.size.width,
					height: state.size.height,
				}}
			>
				<button
					type="button"
					className="flex cursor-move items-center justify-between border-b border-ctp-surface2 p-4 w-full"
					onMouseDown={handleDragStart}
				>
					<h3 className="text-sm font-medium text-ctp-text">
						Execution History
					</h3>
					<div className="flex items-center gap-2">
						<button
							type="button"
							onClick={clearHistory}
							className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors hover:bg-ctp-surface2"
						>
							<Trash2 size={14} className="stroke-[2.5]" />
						</button>
						<button
							type="button"
							onClick={onClose}
							className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors hover:bg-ctp-surface2"
						>
							<X size={14} className="stroke-[2.5]" />
						</button>
					</div>
				</button>
				<div className="flex-1 overflow-y-auto p-4">
					{history.length === 0 ? (
						<div className="flex h-full items-center justify-center text-sm text-ctp-subtext0">
							No execution history
						</div>
					) : (
						<div className="flex flex-col gap-3">
							{history.map((record) => (
								<div
									key={record.id}
									className="flex flex-col gap-2 rounded-lg border border-ctp-surface2 bg-ctp-surface1 p-3"
								>
									<div className="flex items-center justify-between">
										<span className="text-xs text-ctp-subtext0">
											{new Date(record.timestamp).toLocaleString()}
										</span>
										<div className="flex items-center gap-2">
											<span
												className={`text-xs ${
													record.success ? "text-ctp-green" : "text-ctp-red"
												}`}
											>
												{record.success ? "Success" : "Error"}
											</span>
											<button
												type="button"
												onClick={() => handleOpenInEditor(record.content)}
												className="text-xs text-accent hover:underline"
											>
												Open in Editor
											</button>
										</div>
									</div>
									<div className="max-h-20 overflow-y-auto rounded bg-ctp-mantle p-2">
										<pre className="text-xs text-ctp-text">
											{record.content}
										</pre>
									</div>
									{record.error && (
										<div className="rounded bg-ctp-red/10 p-2 text-xs text-ctp-red">
											{needsTruncation(record.error) ? (
												<button
													type="button"
													className="flex w-full items-center gap-1 text-left"
													onClick={() => toggleErrorExpand(record.id)}
													onKeyDown={(e) => handleErrorKeyPress(e, record.id)}
													aria-expanded={expandedErrors.has(record.id)}
													aria-label={
														expandedErrors.has(record.id)
															? "Collapse error"
															: "Expand error"
													}
												>
													{expandedErrors.has(record.id) ? (
														<ChevronDown size={14} className="flex-shrink-0" />
													) : (
														<ChevronRight size={14} className="flex-shrink-0" />
													)}
													<span className="whitespace-pre-wrap">
														{expandedErrors.has(record.id)
															? record.error
															: truncateError(record.error)}
													</span>
												</button>
											) : (
												<span className="whitespace-pre-wrap">
													{getFirstLine(record.error)}
												</span>
											)}
										</div>
									)}
								</div>
							))}
						</div>
					)}
				</div>
				<button
					type="button"
					className="absolute bottom-0 right-0 h-4 w-4 cursor-se-resize"
					onMouseDown={handleResizeStart}
				/>
			</motion.div>
		</motion.div>
	);
};

import { ChevronDown, ChevronRight, Search, Trash2, X } from "lucide-react";
import { motion } from "motion/react";
import {
    type KeyboardEvent,
    type MouseEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from "react";
import {
    DEFAULT_EXECUTION_HISTORY_STATE,
    EXECUTION_HISTORY_STORAGE_KEY,
    STATUS_FILTER_OPTIONS,
} from "../../constants/execution/executionHistory";
import { useEditor } from "../../hooks/core/useEditor";
import { useLocalStorage } from "../../hooks/core/useLocalStorage";
import { useExecutionHistory } from "../../hooks/execution/useExecutionHistory";
import type {
    ExecutionHistoryProps,
    ExecutionHistoryState,
    StatusFilter,
} from "../../types/execution/executionHistory";
import { Input } from "./input/input";
import { Select } from "./input/select";

export const ExecutionHistory = ({
    isVisible,
    onClose,
}: ExecutionHistoryProps) => {
    const { history, clearHistory } = useExecutionHistory();
    const { createTabWithContent } = useEditor();
    const [expandedErrors, setExpandedErrors] = useState<Set<string>>(
        new Set(),
    );
    const [searchQuery, setSearchQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
    const [state, setState] = useLocalStorage<ExecutionHistoryState>(
        EXECUTION_HISTORY_STORAGE_KEY,
        DEFAULT_EXECUTION_HISTORY_STATE,
    );

    useEffect(() => {
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        const isOutsideBounds = 
            state.position.x < 0 || 
            state.position.y < 0 || 
            state.position.x + state.size.width > viewportWidth || 
            state.position.y + state.size.height > viewportHeight;

        if (isOutsideBounds) {
            const correctedX = Math.max(0, Math.min(state.position.x, viewportWidth - state.size.width));
            const correctedY = Math.max(0, Math.min(state.position.y, viewportHeight - state.size.height));
            
            setState(prev => ({
                ...prev,
                position: {
                    x: correctedX,
                    y: correctedY
                }
            }));
        }
    }, [state.position.x, state.position.y, state.size.width, state.size.height, setState]);

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);
    const resizeStartState = useRef<ExecutionHistoryState | null>(null);

    const handleOpenInEditor = async (content: string) => {
        await createTabWithContent("history.lua", content);
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
                    const newX = event.clientX - dragStart.x;
                    const newY = event.clientY - dragStart.y;
                    
                    const viewportWidth = window.innerWidth;
                    const viewportHeight = window.innerHeight;
                    
                    const constrainedX = Math.max(
                        0, 
                        Math.min(newX, viewportWidth - state.size.width)
                    );
                    const constrainedY = Math.max(
                        0, 
                        Math.min(newY, viewportHeight - state.size.height)
                    );

                    setState((prev) => ({
                        ...prev,
                        position: {
                            x: constrainedX,
                            y: constrainedY,
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
    }, [isDragging, isResizing, handleDragEnd, setState, state.size.width, state.size.height]);

    const filteredHistory = useMemo(() => {
        return history.filter((record) => {
            const matchesSearch =
                searchQuery === "" ||
                record.content
                    .toLowerCase()
                    .includes(searchQuery.toLowerCase()) ||
                record.error?.toLowerCase().includes(searchQuery.toLowerCase());

            const matchesStatus =
                statusFilter === "all" ||
                (statusFilter === "success" && record.success) ||
                (statusFilter === "error" && !record.success);

            return matchesSearch && matchesStatus;
        });
    }, [history, searchQuery, statusFilter]);

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

    if (!isVisible) return null;

    return (
        <motion.div
            className="fixed z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.1 }}
            style={{
                left: state.position.x,
                top: state.position.y,
                transition: isDragging
                    ? "none"
                    : "all 0.15s cubic-bezier(0.2, 0, 0, 1)",
            }}
        >
            <motion.div
                className="flex flex-col overflow-hidden rounded-xl border border-ctp-surface2 bg-ctp-surface0 shadow-lg"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{
                    duration: 0.15,
                    type: "spring",
                    stiffness: 400,
                    damping: 25,
                }}
                style={{
                    width: state.size.width,
                    height: state.size.height,
                    transition: isResizing
                        ? "none"
                        : "all 0.15s cubic-bezier(0.2, 0, 0, 1)",
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

                <div className="border-b border-ctp-surface2 p-4">
                    <motion.div
                        className="flex items-center gap-2"
                        layout={!isDragging}
                        transition={{
                            type: "spring",
                            stiffness: 400,
                            damping: 25,
                            duration: 0.15,
                        }}
                    >
                        <motion.div
                            className="relative flex-1"
                            layout={!isDragging}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                                duration: 0.15,
                            }}
                        >
                            <Input
                                placeholder="Search execution history..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="h-8 w-full border-white/5 bg-ctp-surface1 pl-8 text-sm focus:border-accent focus:ring-accent"
                                autoCorrect="off"
                                autoCapitalize="off"
                                spellCheck={false}
                            />
                            <Search
                                size={14}
                                className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ctp-subtext0"
                            />
                        </motion.div>
                        <motion.div
                            layout={!isDragging}
                            transition={{
                                type: "spring",
                                stiffness: 400,
                                damping: 25,
                                duration: 0.15,
                            }}
                        >
                            <Select
                                value={statusFilter}
                                onChange={(value) =>
                                    setStatusFilter(value as StatusFilter)
                                }
                                options={STATUS_FILTER_OPTIONS}
                            />
                        </motion.div>
                    </motion.div>
                </div>

                <div className="flex-1 overflow-y-auto p-4">
                    {filteredHistory.length === 0 ? (
                        <div className="flex h-full items-center justify-center text-sm text-ctp-subtext0">
                            {history.length === 0
                                ? "No execution history"
                                : "No results found"}
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {filteredHistory.map((record) => (
                                <div
                                    key={record.id}
                                    className="flex flex-col gap-2 rounded-lg border border-ctp-surface2 bg-ctp-surface1 p-3"
                                >
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-ctp-subtext0">
                                            {new Date(
                                                record.timestamp,
                                            ).toLocaleString()}
                                        </span>
                                        <div className="flex items-center gap-2">
                                            <span
                                                className={`text-xs ${
                                                    record.success
                                                        ? "text-ctp-green"
                                                        : "text-ctp-red"
                                                }`}
                                            >
                                                {record.success
                                                    ? "Success"
                                                    : "Error"}
                                            </span>
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    handleOpenInEditor(
                                                        record.content,
                                                    )
                                                }
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
                                                    onClick={() =>
                                                        toggleErrorExpand(
                                                            record.id,
                                                        )
                                                    }
                                                    onKeyDown={(e) =>
                                                        handleErrorKeyPress(
                                                            e,
                                                            record.id,
                                                        )
                                                    }
                                                    aria-expanded={expandedErrors.has(
                                                        record.id,
                                                    )}
                                                    aria-label={
                                                        expandedErrors.has(
                                                            record.id,
                                                        )
                                                            ? "Collapse error"
                                                            : "Expand error"
                                                    }
                                                >
                                                    {expandedErrors.has(
                                                        record.id,
                                                    ) ? (
                                                        <ChevronDown
                                                            size={14}
                                                            className="flex-shrink-0"
                                                        />
                                                    ) : (
                                                        <ChevronRight
                                                            size={14}
                                                            className="flex-shrink-0"
                                                        />
                                                    )}
                                                    <span className="whitespace-pre-wrap">
                                                        {expandedErrors.has(
                                                            record.id,
                                                        )
                                                            ? record.error
                                                            : truncateError(
                                                                  record.error,
                                                              )}
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

import { FC, useState, useRef, useEffect, memo } from "react";
import { motion } from "framer-motion";
import {
    Play,
    Square,
    Trash2,
    ChevronDown,
    ChevronUp,
    Maximize2,
    Minimize2,
    Terminal,
} from "lucide-react";
import {
    RobloxConsoleProps,
    LogLine,
    ConsolePosition,
} from "../types/robloxConsole";
import { CONSOLE_COLORS, CONSOLE_CONFIG } from "../constants/robloxConsole";
import { useConsole } from "../contexts/consoleContext";
import { useSettings } from "../contexts/settingsContext";

interface ConsoleSize {
    width: number;
    height: number;
}

const ConsoleHeader = memo(
    ({
        isOpen,
        onToggle,
        isWatching,
        onClear,
        onToggleWatch,
        isFloating,
        onFloatToggle,
        onDragStart,
    }: {
        isOpen: boolean;
        onToggle: () => void;
        isWatching: boolean;
        onClear: () => void;
        onToggleWatch: () => void;
        isFloating: boolean;
        onFloatToggle: () => void;
        onDragStart?: (e: React.MouseEvent) => void;
    }) => (
        <div
            className="h-10 flex items-center justify-between px-4 bg-ctp-mantle border-b border-white/5 cursor-move select-none"
            onMouseDown={onDragStart}
        >
            <div className="flex items-center gap-2">
                <button
                    onClick={onToggle}
                    className="p-1 hover:bg-white/5 rounded cursor-pointer"
                >
                    {isOpen ? (
                        <ChevronDown size={16} />
                    ) : (
                        <ChevronUp size={16} />
                    )}
                </button>
                <span className="text-sm font-medium">Roblox Console</span>
            </div>
            <div className="flex items-center gap-2">
                <button
                    onClick={onClear}
                    className="p-1 hover:bg-white/5 rounded text-ctp-subtext0 hover:text-ctp-text cursor-pointer"
                    title="Clear console"
                >
                    <Trash2 size={16} />
                </button>
                <button
                    onClick={onToggleWatch}
                    className={`p-1 hover:bg-white/5 rounded cursor-pointer ${
                        isWatching ? "text-red-400" : "text-green-400"
                    }`}
                    title={isWatching ? "Stop watching" : "Start watching"}
                >
                    {isWatching ? <Square size={16} /> : <Play size={16} />}
                </button>
                <button
                    onClick={onFloatToggle}
                    className="p-1 hover:bg-white/5 rounded text-ctp-subtext0 hover:text-ctp-text cursor-pointer"
                    title={isFloating ? "Dock console" : "Float console"}
                >
                    {isFloating ? (
                        <Minimize2 size={16} />
                    ) : (
                        <Maximize2 size={16} />
                    )}
                </button>
            </div>
        </div>
    )
);

ConsoleHeader.displayName = "ConsoleHeader";

const ConsoleLog = memo<{ log: LogLine; isResizing: boolean }>(
    ({ log, isResizing }) => (
        <div
            className={`px-4 py-1.5 hover:bg-white/5 ${
                CONSOLE_COLORS[log.level]
            } border-b border-white/5 last:border-0`}
        >
            <span className="text-ctp-subtext0 mr-2 select-none">
                {new Date(log.timestamp).toLocaleTimeString()}
            </span>
            <span className="font-medium select-none">[{log.level}]</span>{" "}
            <span className={isResizing ? "select-none" : "select-text"}>
                {log.message}
            </span>
        </div>
    )
);

ConsoleLog.displayName = "ConsoleLog";

const EmptyState = () => (
    <div className="h-full flex flex-col items-center justify-center text-center p-4">
        <Terminal
            size={32}
            className="text-ctp-subtext0 mb-3"
            strokeWidth={1.5}
        />
        <div className="text-ctp-subtext0 font-medium">No logs available</div>
        <div className="text-ctp-subtext0/75 text-sm mt-1">
            Click the{" "}
            <Play size={14} className="inline-block mx-1 text-green-400" />{" "}
            button to start watching
        </div>
    </div>
);

export const RobloxConsole: FC<RobloxConsoleProps> = ({
    isOpen,
    onToggle,
    isFloating,
    onFloatToggle,
    consoleState,
}) => {
    const { settings } = useSettings();
    const { logs, isWatching, startWatching, stopWatching, clearLogs } =
        consoleState;

    const [position, setPosition] = useState<ConsolePosition>(() => {
        const savedState = localStorage.getItem("comet-console-state");
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (state.position) {
                    return state.position;
                }
            } catch {}
        }
        return {
            x: window.innerWidth / 2 - 400,
            y: window.innerHeight / 2 - 200,
        };
    });

    const [size, setSize] = useState<ConsoleSize>(() => {
        const savedState = localStorage.getItem("comet-console-state");
        if (savedState) {
            try {
                const state = JSON.parse(savedState);
                if (state.size) {
                    return state.size;
                }
            } catch {}
        }
        return {
            width: 800,
            height: 300,
        };
    });

    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeType, setResizeType] = useState<
        "right" | "bottom" | "corner" | null
    >(null);
    const dragStartPos = useRef<{ x: number; y: number } | null>(null);
    const resizeStartPos = useRef<{
        x: number;
        y: number;
        width: number;
        height: number;
    } | null>(null);
    const consoleRef = useRef<HTMLDivElement>(null);
    const logsEndRef = useRef<HTMLDivElement>(null);
    const { setIsFloating } = useConsole();

    // Save state to localStorage when position or size changes
    useEffect(() => {
        if (isFloating) {
            const savedState = localStorage.getItem("comet-console-state");
            let state = { isFloating, position, size };

            if (savedState) {
                try {
                    state = { ...JSON.parse(savedState), position, size };
                } catch {}
            }

            localStorage.setItem("comet-console-state", JSON.stringify(state));
        }
    }, [isFloating, position, size]);

    useEffect(() => {
        if (logsEndRef.current) {
            logsEndRef.current.scrollIntoView({ behavior: "smooth" });
        }
    }, [logs.length]);

    useEffect(() => {
        setIsFloating(isFloating);
    }, [isFloating, setIsFloating]);

    useEffect(() => {
        if (isDragging) {
            window.addEventListener("mousemove", handleDrag);
            window.addEventListener("mouseup", handleDragEnd);
        }
        if (isResizing) {
            window.addEventListener("mousemove", handleResize);
            window.addEventListener("mouseup", handleResizeEnd);
        }
        return () => {
            window.removeEventListener("mousemove", handleDrag);
            window.removeEventListener("mouseup", handleDragEnd);
            window.removeEventListener("mousemove", handleResize);
            window.removeEventListener("mouseup", handleResizeEnd);
        };
    }, [isDragging, isResizing]);

    const handleToggleWatch = async () => {
        try {
            if (isWatching) {
                await stopWatching();
            } else {
                await startWatching();
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleDragStart = (e: React.MouseEvent) => {
        if (!isFloating) return;
        setIsDragging(true);
        dragStartPos.current = {
            x: e.clientX - position.x,
            y: e.clientY - position.y,
        };
    };

    const handleDrag = (e: MouseEvent) => {
        if (!isDragging || !dragStartPos.current) return;

        const newX = Math.max(
            0,
            Math.min(
                window.innerWidth - size.width,
                e.clientX - dragStartPos.current.x
            )
        );
        const newY = Math.max(
            0,
            Math.min(
                window.innerHeight - size.height,
                e.clientY - dragStartPos.current.y
            )
        );

        setPosition({ x: newX, y: newY });
    };

    const handleDragEnd = () => {
        setIsDragging(false);
        dragStartPos.current = null;
    };

    const handleResizeStart = (
        e: React.MouseEvent,
        type: "right" | "bottom" | "corner"
    ) => {
        if (!isFloating) return;
        e.stopPropagation();
        setIsResizing(true);
        setResizeType(type);
        resizeStartPos.current = {
            x: e.clientX,
            y: e.clientY,
            width: size.width,
            height: size.height,
        };
    };

    const handleResize = (e: MouseEvent) => {
        if (!isResizing || !resizeStartPos.current || !resizeType) return;

        const deltaX = e.clientX - resizeStartPos.current.x;
        const deltaY = e.clientY - resizeStartPos.current.y;
        const maxWidth = window.innerWidth - position.x;
        const maxHeight = window.innerHeight - position.y;

        const newSize = { ...size };

        if (resizeType === "right" || resizeType === "corner") {
            newSize.width = Math.max(
                400,
                Math.min(maxWidth, resizeStartPos.current.width + deltaX)
            );
        }
        if (resizeType === "bottom" || resizeType === "corner") {
            newSize.height = Math.max(
                200,
                Math.min(maxHeight, resizeStartPos.current.height + deltaY)
            );
        }

        setSize(newSize);
    };

    const handleResizeEnd = () => {
        setIsResizing(false);
        setResizeType(null);
        resizeStartPos.current = null;
    };

    if (settings.interface.zenMode && !isFloating) {
        return null;
    }

    const consoleStyle = isFloating
        ? {
              position: "fixed" as const,
              top: position.y,
              left: position.x,
              width: `${size.width}px`,
              height: `${size.height}px`,
              transform: "none",
              zIndex: 9999,
          }
        : {};

    return (
        <motion.div
            initial={false}
            animate={{
                height: isOpen
                    ? isFloating
                        ? size.height
                        : CONSOLE_CONFIG.DEFAULT_HEIGHT
                    : CONSOLE_CONFIG.COLLAPSED_HEIGHT,
            }}
            transition={CONSOLE_CONFIG.ANIMATION_CONFIG}
            className={`bg-ctp-mantle overflow-hidden shadow-2xl relative ${
                isFloating ? "rounded-lg" : "w-full"
            } ${isResizing ? "select-none" : ""}`}
            style={{
                ...consoleStyle,
                userSelect: isResizing ? "none" : "text",
                WebkitUserSelect: isResizing ? "none" : "text",
            }}
        >
            <ConsoleHeader
                isOpen={isOpen}
                onToggle={onToggle}
                isWatching={isWatching}
                onClear={clearLogs}
                onToggleWatch={handleToggleWatch}
                isFloating={isFloating}
                onFloatToggle={onFloatToggle}
                onDragStart={handleDragStart}
            />
            {isOpen && (
                <div
                    ref={consoleRef}
                    className="overflow-y-auto font-mono text-sm bg-ctp-mantle h-[calc(100%-2.5rem)]"
                    style={{
                        userSelect: isResizing ? "none" : "text",
                        WebkitUserSelect: isResizing ? "none" : "text",
                    }}
                >
                    {logs.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <>
                            {logs.map((log, index) => (
                                <ConsoleLog
                                    key={index}
                                    log={log}
                                    isResizing={isResizing}
                                />
                            ))}
                            <div ref={logsEndRef} />
                        </>
                    )}
                </div>
            )}
            {isFloating && isOpen && (
                <>
                    <div
                        className="absolute right-0 top-[40px] w-1 h-[calc(100%-40px)] cursor-ew-resize hover:bg-white/5 select-none"
                        onMouseDown={(e) => handleResizeStart(e, "right")}
                    />
                    <div
                        className="absolute bottom-0 left-0 h-1 w-full cursor-ns-resize hover:bg-white/5 select-none"
                        onMouseDown={(e) => handleResizeStart(e, "bottom")}
                    />
                    <div
                        className="absolute bottom-0 right-0 w-4 h-4 cursor-nwse-resize hover:bg-white/5 select-none"
                        onMouseDown={(e) => handleResizeStart(e, "corner")}
                    />
                </>
            )}
        </motion.div>
    );
};

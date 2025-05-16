import { FC } from "react";
import { motion } from "framer-motion";
import { Play, Square, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { useRobloxConsole } from "../hooks/useRobloxConsole";
import { RobloxConsoleProps, LogLine } from "../types/robloxConsole";
import { CONSOLE_COLORS, CONSOLE_CONFIG } from "../constants/robloxConsole";

const ConsoleHeader: FC<{
    isOpen: boolean;
    onToggle: () => void;
    isWatching: boolean;
    onClear: () => void;
    onToggleWatch: () => void;
}> = ({ isOpen, onToggle, isWatching, onClear, onToggleWatch }) => (
    <div className="h-10 flex items-center justify-between px-4 border-b border-white/5">
        <div className="flex items-center gap-2">
            <button onClick={onToggle} className="p-1 hover:bg-white/5 rounded">
                {isOpen ? <ChevronDown size={16} /> : <ChevronUp size={16} />}
            </button>
            <span className="text-sm font-medium">Roblox Console</span>
        </div>
        <div className="flex items-center gap-2">
            <button
                onClick={onClear}
                className="p-1 hover:bg-white/5 rounded text-ctp-subtext0 hover:text-ctp-text"
                title="Clear console"
            >
                <Trash2 size={16} />
            </button>
            <button
                onClick={onToggleWatch}
                className={`p-1 hover:bg-white/5 rounded ${
                    isWatching ? "text-red-400" : "text-green-400"
                }`}
                title={isWatching ? "Stop watching" : "Start watching"}
            >
                {isWatching ? <Square size={16} /> : <Play size={16} />}
            </button>
        </div>
    </div>
);

const ConsoleLog: FC<{ log: LogLine }> = ({ log }) => (
    <div className={`py-1 ${CONSOLE_COLORS[log.level]}`}>
        <span className="text-ctp-subtext0">
            {new Date(log.timestamp).toLocaleTimeString()}
        </span>{" "}
        <span className="font-medium">[{log.level}]</span> {log.message}
    </div>
);

export const RobloxConsole: FC<RobloxConsoleProps> = ({ isOpen, onToggle }) => {
    const { logs, isWatching, startWatching, stopWatching, clearLogs } =
        useRobloxConsole();

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

    return (
        <motion.div
            initial={false}
            animate={{
                height: isOpen
                    ? CONSOLE_CONFIG.DEFAULT_HEIGHT
                    : CONSOLE_CONFIG.COLLAPSED_HEIGHT,
            }}
            transition={CONSOLE_CONFIG.ANIMATION_CONFIG}
            className="w-full bg-ctp-mantle border-t border-white/5 overflow-hidden"
        >
            <ConsoleHeader
                isOpen={isOpen}
                onToggle={onToggle}
                isWatching={isWatching}
                onClear={clearLogs}
                onToggleWatch={handleToggleWatch}
            />
            {isOpen && (
                <div className="h-[calc(300px-2.5rem)] overflow-y-auto p-4 font-mono text-sm">
                    {logs.length === 0 ? (
                        <div className="text-ctp-subtext0 text-center py-4">
                            No logs yet. Click the play button to start
                            watching.
                        </div>
                    ) : (
                        logs.map((log, index) => (
                            <ConsoleLog key={index} log={log} />
                        ))
                    )}
                </div>
            )}
        </motion.div>
    );
};

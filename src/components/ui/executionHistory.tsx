import { motion } from "framer-motion";
import { Trash2, X } from "lucide-react";
import { useExecutionHistory } from "../../hooks/useExecutionHistory";
import { useEditor } from "../../hooks/useEditor";
import { useState } from "react";
import type { ExecutionHistoryProps } from "../../types/execution";

export const ExecutionHistory = ({ isVisible, onClose }: ExecutionHistoryProps) => {
    const { history, clearHistory } = useExecutionHistory();
    const { createTabWithContent } = useEditor();
    const [position, setPosition] = useState({ x: 0, y: 0 });

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

    return (
        <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center bg-ctp-base/50"
            initial={{ opacity: 0 }}
            animate={isVisible ? { opacity: 1 } : { opacity: 0 }}
            exit={{ opacity: 0 }}
            style={{ pointerEvents: isVisible ? "auto" : "none" }}
        >
            <motion.div
                className="flex h-[500px] w-[600px] flex-col overflow-hidden rounded-xl border border-ctp-surface2 bg-ctp-surface0 shadow-lg"
                variants={containerVariants}
                initial="hidden"
                animate={isVisible ? "visible" : "hidden"}
                drag
                dragConstraints={{ left: -500, right: 500, top: -300, bottom: 300 }}
                dragElastic={0.1}
                dragMomentum={false}
                onDragEnd={(_, info) => {
                    setPosition({
                        x: position.x + info.offset.x,
                        y: position.y + info.offset.y,
                    });
                }}
                style={{
                    x: position.x,
                    y: position.y,
                }}
            >
                <div className="flex cursor-move items-center justify-between border-b border-ctp-surface2 p-4">
                    <h3 className="text-sm font-medium text-ctp-text">Execution History</h3>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={clearHistory}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors hover:bg-ctp-surface2"
                        >
                            <Trash2 size={14} className="stroke-[2.5]" />
                        </button>
                        <button
                            onClick={onClose}
                            className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors hover:bg-ctp-surface2"
                        >
                            <X size={14} className="stroke-[2.5]" />
                        </button>
                    </div>
                </div>
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
                                                onClick={() => handleOpenInEditor(record.content)}
                                                className="text-xs text-accent hover:underline"
                                            >
                                                Open in Editor
                                            </button>
                                        </div>
                                    </div>
                                    <div className="max-h-20 overflow-y-auto rounded bg-ctp-mantle p-2">
                                        <pre className="text-xs text-ctp-text">{record.content}</pre>
                                    </div>
                                    {record.error && (
                                        <div className="rounded bg-ctp-red/10 p-2 text-xs text-ctp-red">
                                            {record.error}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </motion.div>
        </motion.div>
    );
}; 
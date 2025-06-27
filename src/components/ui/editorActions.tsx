import { motion } from "framer-motion";
import {
    Play,
    ExternalLink,
    Loader2,
    ChevronRight,
    Terminal,
    History,
} from "lucide-react";
import { useExecute } from "../../hooks/useExecute";
import { useRoblox } from "../../hooks/useRoblox";
import { useScript } from "../../hooks/useScript";
import { Tooltip } from "react-tooltip";
import type { ActionMenuProps } from "../../types/workspace";
import { useConsole } from "../../hooks/useConsole";
import { useSettings } from "../../hooks/useSettings";
import { type FC, useState } from "react";
import { ExecutionHistory } from "./executionHistory";

export const Actions: FC<Pick<ActionMenuProps, "getEditorContent">> = ({
    getEditorContent,
}) => {
    const { isExecuting } = useExecute();
    const { openRoblox } = useRoblox();
    const { executeScript } = useScript();
    const { isFloating } = useConsole();
    const { settings, updateSettings } = useSettings();
    const [isExpanded, setIsExpanded] = useState(false);
    const [isPinned, setIsPinned] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const containerVariants = {
        collapsed: {
            width: "44px",
        },
        expanded: {
            width: "204px",
        },
    };

    const iconVariants = {
        collapsed: { rotate: 0 },
        expanded: { rotate: 180 },
    };

    const buttonsVariants = {
        hidden: { opacity: 0, x: 10, display: "none" },
        visible: {
            opacity: 1,
            x: 0,
            display: "flex",
            transition: {
                delay: 0.1,
                staggerChildren: 0.1,
            },
        },
    };

    const buttonVariants = {
        hidden: { opacity: 0, x: 10 },
        visible: { opacity: 1, x: 0 },
        hover: {
            scale: 1.05,
            backgroundColor: "rgba(193, 199, 230, 0.1)",
        },
        tap: {
            scale: 0.95,
            backgroundColor: "rgba(193, 199, 230, 0.15)",
        },
    };

    const handleExecute = async () => {
        try {
            if (getEditorContent) {
                const content = getEditorContent();
                await executeScript({ content });
            } else {
                await executeScript();
            }
        } catch (error) {
            console.error("Execute error:", error);
        }
    };

    const toggleConsole = () => {
        updateSettings({
            interface: {
                ...settings.interface,
                showConsole: !settings.interface.showConsole,
            },
        });
    };

    const togglePinned = () => {
        setIsPinned(!isPinned);
        setIsExpanded(true);
    };

    const handleHoverStart = () => {
        if (!isPinned) {
            setIsExpanded(true);
        }
    };

    const handleHoverEnd = () => {
        if (!isPinned) {
            setIsExpanded(false);
        }
    };

    const bottomSpacing: "bottom-6" | "bottom-12" =
        settings.interface.zenMode ||
        isFloating ||
        !settings.interface.showConsole
            ? "bottom-6"
            : "bottom-12";

    return (
        <>
            <motion.div
                className={`absolute right-4 ${bottomSpacing} flex items-center justify-end`}
                onHoverStart={handleHoverStart}
                onHoverEnd={handleHoverEnd}
            >
                <motion.div
                    className="relative flex h-11 items-center justify-end overflow-hidden rounded-xl border border-ctp-surface2 bg-ctp-surface0 shadow-lg"
                    variants={containerVariants}
                    initial="collapsed"
                    animate={isExpanded ? "expanded" : "collapsed"}
                    transition={{ duration: 0.3 }}
                >
                    <div className="absolute inset-0 flex items-center">
                        <motion.div
                            className="ml-3 mr-14 flex items-center gap-3"
                            variants={buttonsVariants}
                            initial="hidden"
                            animate={isExpanded ? "visible" : "hidden"}
                        >
                            <motion.button
                                data-tooltip-id="editor-action-tooltip"
                                data-tooltip-content="Execution History"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={() => setShowHistory(!showHistory)}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors"
                            >
                                <History size={14} className="stroke-[2.5]" />
                            </motion.button>

                            <motion.button
                                data-tooltip-id="editor-action-tooltip"
                                data-tooltip-content={
                                    settings.interface.showConsole
                                        ? "Hide Console"
                                        : "Show Console"
                                }
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={toggleConsole}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors"
                            >
                                <Terminal size={14} className="stroke-[2.5]" />
                            </motion.button>

                            <motion.button
                                data-tooltip-id="editor-action-tooltip"
                                data-tooltip-content="Open Roblox"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={openRoblox}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors"
                            >
                                <ExternalLink size={14} className="stroke-[2.5]" />
                            </motion.button>

                            <motion.button
                                data-tooltip-id="editor-action-tooltip"
                                data-tooltip-content="Execute Script"
                                variants={buttonVariants}
                                whileHover="hover"
                                whileTap="tap"
                                onClick={handleExecute}
                                disabled={isExecuting}
                                className="flex h-7 w-7 items-center justify-center rounded-lg border border-ctp-surface2 bg-ctp-surface1 text-accent transition-colors disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {isExecuting ? (
                                    <Loader2
                                        size={14}
                                        className="animate-spin stroke-[2.5]"
                                    />
                                ) : (
                                    <Play
                                        size={14}
                                        className="ml-0.5 stroke-[2.5]"
                                    />
                                )}
                            </motion.button>
                        </motion.div>
                    </div>

                    <motion.button
                        onClick={togglePinned}
                        variants={iconVariants}
                        initial="collapsed"
                        animate={isExpanded ? "expanded" : "collapsed"}
                        transition={{ duration: 0.3 }}
                        className={`absolute right-0 flex h-10 w-10 cursor-pointer items-center justify-center text-accent ${
                            isPinned ? "bg-ctp-surface1" : ""
                        }`}
                    >
                        <ChevronRight size={14} className="stroke-[2.5]" />
                    </motion.button>
                </motion.div>
            </motion.div>

            <ExecutionHistory isVisible={showHistory} onClose={() => setShowHistory(false)} />

            <Tooltip
                id="editor-action-tooltip"
                place="top"
                className="!rounded-lg !border !border-ctp-surface2 !bg-ctp-mantle !px-2 !py-1 !text-xs !shadow-lg"
                classNameArrow="!hidden"
            />
        </>
    );
};

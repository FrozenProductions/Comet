import { motion } from "framer-motion";
import { Play, ExternalLink, Loader2 } from "lucide-react";
import { useExecute } from "../contexts/ExecuteContext";
import { toast } from "react-hot-toast";
import { Tooltip } from "react-tooltip";
import { invoke } from "@tauri-apps/api/tauri";

type ActionMenuProps = {
    onExecute?: () => Promise<void>;
    getEditorContent?: () => string;
};

export const Actions = ({ onExecute, getEditorContent }: ActionMenuProps) => {
    const { execute, isExecuting } = useExecute();

    const buttonVariants = {
        initial: { opacity: 0, y: 10 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 5 },
        hover: {
            scale: 1.05,
            backgroundColor: "rgb(193, 199, 230, 0.1)",
        },
        tap: {
            scale: 0.95,
            backgroundColor: "rgb(193, 199, 230, 0.15)",
        },
    };

    const handleExecute = async () => {
        try {
            if (onExecute) {
                await onExecute();
            } else if (getEditorContent) {
                const content = getEditorContent();
                if (!content.trim()) {
                    toast.error("Cannot execute empty script");
                    return;
                }
                await execute(content);
            }
        } catch (error) {
            console.error("Execute error:", error);
        }
    };

    const handleOpenRoblox = async () => {
        try {
            await invoke("open_roblox");
        } catch (error) {
            toast.error("Failed to open Roblox Studio");
            console.error("Failed to open Roblox:", error);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex gap-3">
            <motion.button
                data-tooltip-id="action-tooltip"
                data-tooltip-content="Open Roblox"
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="hover"
                whileTap="tap"
                onClick={handleOpenRoblox}
                className="w-11 h-11 bg-white/5 text-[#c1c7e6] rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/5 transition-colors"
            >
                <ExternalLink size={16} className="stroke-[2.5]" />
            </motion.button>

            <motion.button
                data-tooltip-id="action-tooltip"
                data-tooltip-content="Execute"
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="hover"
                whileTap="tap"
                onClick={handleExecute}
                disabled={isExecuting}
                className="w-11 h-11 bg-white/5 text-[#c1c7e6] rounded-xl flex items-center justify-center shadow-lg backdrop-blur-sm border border-white/5 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isExecuting ? (
                    <Loader2 size={16} className="stroke-[2.5] animate-spin" />
                ) : (
                    <Play size={16} className="ml-0.5 stroke-[2.5]" />
                )}
            </motion.button>

            <Tooltip
                id="action-tooltip"
                place="left"
                className="!bg-ctp-mantle !px-2 !py-1 !rounded-lg !text-xs !border !border-white/5 !shadow-lg"
                classNameArrow="!hidden"
            />
        </div>
    );
};

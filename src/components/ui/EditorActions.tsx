import { motion } from "framer-motion";
import { Play, ExternalLink, Loader2 } from "lucide-react";
import { useExecute } from "../../hooks/useExecute";
import { useRoblox } from "../../hooks/useRoblox";
import { useScript } from "../../hooks/useScript";
import { Tooltip } from "react-tooltip";
import type { ActionMenuProps } from "../../types/workspace";
import { useConsole } from "../../hooks/useConsole";
import { useSettings } from "../../hooks/useSettings";
import { FC } from "react";

export const Actions: FC<Pick<ActionMenuProps, "getEditorContent">> = ({
    getEditorContent,
}) => {
    const { isExecuting } = useExecute();
    const { openRoblox } = useRoblox();
    const { executeScript } = useScript();
    const { isFloating } = useConsole();
    const { settings } = useSettings();

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

    const bottomSpacing: "bottom-6" | "bottom-12" =
        settings.interface.zenMode ||
        isFloating ||
        !settings.interface.showConsole
            ? "bottom-6"
            : "bottom-12";

    return (
        <div
            className={`absolute right-4 ${bottomSpacing} flex items-center gap-2`}
        >
            <motion.button
                data-tooltip-id="action-tooltip"
                data-tooltip-content="Open Roblox"
                variants={buttonVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                whileHover="hover"
                whileTap="tap"
                onClick={openRoblox}
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

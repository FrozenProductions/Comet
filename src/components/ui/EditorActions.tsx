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
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-[#c1c7e6] shadow-lg transition-colors"
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
                className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/5 bg-white/5 text-[#c1c7e6] shadow-lg transition-colors disabled:cursor-not-allowed disabled:opacity-50"
            >
                {isExecuting ? (
                    <Loader2 size={16} className="animate-spin stroke-[2.5]" />
                ) : (
                    <Play size={16} className="ml-0.5 stroke-[2.5]" />
                )}
            </motion.button>

            <Tooltip
                id="action-tooltip"
                place="left"
                className="!rounded-lg !border !border-white/5 !bg-ctp-mantle !px-2 !py-1 !text-xs !shadow-lg"
                classNameArrow="!hidden"
            />
        </div>
    );
};

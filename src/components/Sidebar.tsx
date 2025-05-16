import { FC } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import type { SidebarProps } from "../types/sidebar";
import { MAIN_SCREENS, BUTTON_SPACING } from "../constants/sidebar";
import { motion } from "framer-motion";

export const Sidebar: FC<SidebarProps> = ({ activeScreen, onScreenChange }) => {
    return (
        <div className="w-[72px] h-full bg-ctp-mantle border-r border-white/5 flex flex-col items-center py-3 flex-shrink-0 select-none">
            <div className="flex-1 flex flex-col items-center gap-[10px] relative">
                <motion.div
                    className="absolute w-10 h-10 rounded-xl bg-accent-gradient shadow-lg shadow-white/20"
                    layoutId="sidebar-focus"
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 30,
                        mass: 0.8,
                    }}
                    style={{
                        top:
                            MAIN_SCREENS.findIndex(
                                (screen) => screen.id === activeScreen
                            ) * BUTTON_SPACING,
                    }}
                />
                {MAIN_SCREENS.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        data-tooltip-id="sidebar-tooltip"
                        data-tooltip-content={label}
                        data-tooltip-place="right"
                        data-tooltip-offset={4}
                        onClick={() => onScreenChange(id)}
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center transition-colors duration-200 relative z-10 group
                            ${
                                activeScreen === id
                                    ? "text-ctp-base"
                                    : "text-accent hover:text-ctp-text"
                            }
                        `}
                    >
                        <Icon
                            size={18}
                            className="transition-transform duration-200 group-hover:scale-110"
                        />
                    </button>
                ))}
            </div>
            <Tooltip
                id="sidebar-tooltip"
                className="!bg-ctp-mantle !px-2.5 !py-1.5 !rounded-lg !text-xs !font-medium !border !border-white/5 !shadow-lg !z-50"
                classNameArrow="!hidden"
                delayShow={50}
                delayHide={0}
            />
        </div>
    );
};

import { FC } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import type { SidebarProps } from "../types/sidebar";
import { MAIN_SCREENS } from "../constants/sidebar";

export const Sidebar: FC<SidebarProps> = ({ activeScreen, onScreenChange }) => {
    return (
        <div className="w-[72px] h-full bg-ctp-mantle border-r border-white/5 flex flex-col items-center py-3 flex-shrink-0">
            <div className="flex-1 flex flex-col items-center gap-2">
                {MAIN_SCREENS.map(({ id, icon: Icon, label }) => (
                    <button
                        key={id}
                        data-tooltip-id="sidebar-tooltip"
                        data-tooltip-content={label}
                        onClick={() => onScreenChange(id)}
                        className={`
                            w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300
                            ${
                                activeScreen === id
                                    ? "bg-accent-gradient text-ctp-base shadow-lg shadow-white/20"
                                    : "text-accent hover:bg-white/5 hover:shadow-lg hover:shadow-white/10"
                            }
                        `}
                    >
                        <Icon size={18} />
                    </button>
                ))}
            </div>
            <Tooltip
                id="sidebar-tooltip"
                className="!bg-ctp-mantle !px-2 !py-1 !rounded-lg !text-xs !border !border-white/5 !shadow-lg"
                classNameArrow="!hidden"
            />
        </div>
    );
};

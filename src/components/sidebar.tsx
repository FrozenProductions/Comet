import type { FC } from "react";
import { Tooltip } from "react-tooltip";
import "react-tooltip/dist/react-tooltip.css";
import { AnimatePresence, motion } from "framer-motion";
import { BUTTON_SPACING, MAIN_SCREENS } from "../constants/sidebar";
import { useSidebar } from "../hooks/useSidebar";
import type { SidebarProps } from "../types/ui/sidebar";

export const Sidebar: FC<SidebarProps> = ({ activeScreen, onScreenChange }) => {
	const { isVisible } = useSidebar();

	return (
		<AnimatePresence>
			{isVisible && (
				<motion.div
					initial={{ width: 0, opacity: 0 }}
					animate={{ width: 72, opacity: 1 }}
					exit={{ width: 0, opacity: 0 }}
					transition={{ type: "spring", stiffness: 400, damping: 30 }}
					className="flex h-full w-[72px] flex-shrink-0 select-none flex-col items-center border-r border-white/5 bg-ctp-mantle py-3 overflow-hidden"
				>
					<div className="relative flex flex-1 flex-col items-center gap-[10px]">
						<motion.div
							className="absolute h-10 w-10 rounded-xl bg-accent-gradient shadow-lg shadow-white/20"
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
										(screen) => screen.id === activeScreen,
									) * BUTTON_SPACING,
							}}
						/>
						{MAIN_SCREENS.map(({ id, icon: Icon, label }) => (
							<button
								key={id}
								type="button"
								data-tooltip-id="sidebar-tooltip"
								data-tooltip-content={label}
								data-tooltip-place="right"
								data-tooltip-offset={4}
								onClick={() => onScreenChange(id)}
								className={`group relative z-10 flex h-10 w-10 items-center justify-center rounded-xl transition-colors duration-200 ${
									activeScreen === id
										? "text-ctp-base"
										: "text-accent hover:text-ctp-text"
								} `}
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
						className="!z-50 !rounded-lg !border !border-white/5 !bg-ctp-mantle !px-2.5 !py-1.5 !text-xs !font-medium !shadow-lg"
						classNameArrow="!hidden"
						delayShow={50}
						delayHide={0}
					/>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

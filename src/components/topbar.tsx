import { PanelLeft } from "lucide-react";
import type { FC } from "react";
import { Tooltip } from "react-tooltip";
import { useSidebar } from "../hooks/ui/useSidebar";
import { TrafficLights } from "./trafficLights";

export const Topbar: FC = () => {
	const { isVisible, toggleSidebar } = useSidebar();

	return (
		<div className="relative h-10 w-full border-b border-white/5 bg-ctp-mantle">
			<div className="absolute inset-0" data-tauri-drag-region />
			<div className="absolute bottom-0 left-0 top-0 flex items-center">
				<TrafficLights />
				<button
					type="button"
					onClick={toggleSidebar}
					data-tooltip-id="topbar-tooltip"
					data-tooltip-content={isVisible ? "Hide sidebar" : "Show sidebar"}
					className={`group flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-white/5 ${
						isVisible ? "text-accent" : "text-ctp-subtext0"
					}`}
				>
					<PanelLeft
						size={17}
						className="transition-transform duration-200 group-hover:scale-110"
					/>
				</button>
				<Tooltip
					id="topbar-tooltip"
					className="!z-50 !rounded-lg !border !border-white/5 !bg-ctp-mantle !px-2.5 !py-1.5 !text-xs !font-medium !shadow-lg"
					classNameArrow="!hidden"
					delayShow={50}
					delayHide={0}
				/>
			</div>
			<div className="flex h-full items-center justify-center">
				<span className="text-sm font-medium text-ctp-text">
					Hydrogen - Comet
				</span>
			</div>
		</div>
	);
};

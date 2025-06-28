import { FC } from "react";
import { TrafficLights } from "./trafficLights";
import { useConnection } from "../hooks/useConnection";
import { Loader2, PanelLeft } from "lucide-react";
import { useSidebar } from "../hooks/useSidebar";
import { Tooltip } from "react-tooltip";

export const Topbar: FC = () => {
	const { status } = useConnection();
	const { isVisible, toggleSidebar } = useSidebar();

	return (
		<div className="relative h-10 w-full border-b border-white/5 bg-ctp-mantle">
			<div className="absolute inset-0" data-tauri-drag-region />
			<div className="absolute bottom-0 left-0 top-0 flex items-center">
				<TrafficLights />
				<button
					onClick={toggleSidebar}
					data-tooltip-id="topbar-tooltip"
					data-tooltip-content={isVisible ? "Hide sidebar" : "Show sidebar"}
					className={`group flex h-7 w-7 items-center justify-center rounded-lg transition-colors duration-200 hover:bg-white/5 ${
						isVisible ? "text-accent" : "text-ctp-subtext0"
					}`}
				>
					<PanelLeft size={17} className="transition-transform duration-200 group-hover:scale-110" />
				</button>
				<Tooltip
					id="topbar-tooltip"
					className="!z-50 !rounded-lg !border !border-white/5 !bg-ctp-mantle !px-2.5 !py-1.5 !text-xs !font-medium !shadow-lg"
					classNameArrow="!hidden"
					delayShow={50}
					delayHide={0}
				/>
			</div>
			<div className="flex h-full items-center justify-center gap-2">
				<span className="text-sm font-medium text-ctp-text">
					Hydrogen - Comet
				</span>
				<div className="flex items-center gap-2 text-xs">
					<span className="text-ctp-subtext0">•</span>
					<div className="flex items-center gap-1.5 rounded-full border border-white/5 bg-ctp-surface0/50 px-2 py-0.5">
						<div
							className={`h-1.5 w-1.5 rounded-full ${
								status.is_connecting
									? "animate-pulse bg-ctp-yellow"
									: status.is_connected
										? "bg-ctp-green"
										: "bg-ctp-red"
							}`}
						/>
						<span className="text-[11px] font-medium text-ctp-subtext0">
							{status.is_connecting
								? `Port ${status.current_port}`
								: status.is_connected
									? `Port ${status.port}`
									: "Disconnected"}
						</span>
						{status.is_connecting && (
							<Loader2
								size={10}
								className="ml-0.5 animate-spin stroke-[2.5] text-ctp-yellow"
							/>
						)}
					</div>
				</div>
			</div>
		</div>
	);
};

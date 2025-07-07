import { AlertTriangle, Code, Eye, Globe, Key, Shield } from "lucide-react";
import { motion } from "motion/react";
import type { ScriptCardProps } from "../../types/core/scriptBlox";

export const ScriptCard = ({ script, onSelect }: ScriptCardProps) => {
	const formatNumber = (num: number | undefined) => {
		if (num === undefined) return "0";
		if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
		if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
		return num.toString();
	};

	const formatDate = (dateString: string) => {
		const date = new Date(dateString);
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	return (
		<motion.div
			initial={{ scale: 1 }}
			whileHover={{ scale: 1.02 }}
			whileTap={{ scale: 0.98 }}
			onClick={() => onSelect(script)}
			className="group cursor-pointer overflow-hidden rounded-xl border border-white/5 bg-ctp-mantle"
		>
			<div className="p-4">
				<div className="flex items-start justify-between gap-4">
					<div className="min-w-0 flex-1">
						<h3 className="truncate text-sm font-medium text-ctp-text transition-colors group-hover:text-ctp-blue">
							{script.title || "Untitled Script"}
						</h3>
						<p className="mt-1 truncate text-xs text-ctp-subtext0">
							{script.game?.name || "Unknown Game"}
						</p>
					</div>
				</div>

				<div className="mt-3 flex flex-wrap gap-1.5">
					{script.verified && (
						<div
							data-tooltip-id="script-tooltip"
							data-tooltip-content="Verified Script"
							className="flex items-center gap-1 rounded-md bg-ctp-green/10 px-1.5 py-0.5 text-[10px] font-medium text-ctp-green"
						>
							<Shield size={10} className="stroke-[2.5]" />
							<span>Verified</span>
						</div>
					)}
					{script.isUniversal && (
						<div
							data-tooltip-id="script-tooltip"
							data-tooltip-content="Works on any game"
							className="flex items-center gap-1 rounded-md bg-ctp-blue/10 px-1.5 py-0.5 text-[10px] font-medium text-ctp-blue"
						>
							<Globe size={10} className="stroke-[2.5]" />
							<span>Universal</span>
						</div>
					)}
					{script.isPatched && (
						<div
							data-tooltip-id="script-tooltip"
							data-tooltip-content="Script is currently patched"
							className="flex items-center gap-1 rounded-md bg-ctp-red/10 px-1.5 py-0.5 text-[10px] font-medium text-ctp-red"
						>
							<AlertTriangle size={10} className="stroke-[2.5]" />
							<span>Patched</span>
						</div>
					)}
					{script.key && (
						<div
							data-tooltip-id="script-tooltip"
							data-tooltip-content="Requires key to use"
							className="flex items-center gap-1 rounded-md bg-ctp-yellow/10 px-1.5 py-0.5 text-[10px] font-medium text-ctp-yellow"
						>
							<Key size={10} className="stroke-[2.5]" />
							<span>Key Required</span>
						</div>
					)}
					{script.scriptType && (
						<div
							data-tooltip-id="script-tooltip"
							data-tooltip-content={`Script type: ${script.scriptType}`}
							className="flex items-center gap-1 rounded-md bg-ctp-mauve/10 px-1.5 py-0.5 text-[10px] font-medium text-ctp-mauve"
						>
							<Code size={10} className="stroke-[2.5]" />
							<span>{script.scriptType}</span>
						</div>
					)}
				</div>

				<div className="mt-4 flex items-center justify-between text-[10px] text-ctp-subtext0">
					<div
						data-tooltip-id="script-tooltip"
						data-tooltip-content={`${
							script.views?.toLocaleString() || 0
						} views`}
						className="flex items-center gap-1"
					>
						<Eye size={12} className="stroke-[2.5]" />
						<span>{formatNumber(script.views)}</span>
					</div>
					<div
						data-tooltip-id="script-tooltip"
						data-tooltip-content={`Updated ${formatDate(script.updatedAt)}`}
						className="text-[10px] text-ctp-subtext1"
					>
						{formatDate(script.updatedAt)}
					</div>
				</div>
			</div>
		</motion.div>
	);
};

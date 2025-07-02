import type { FC } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { History, X } from "lucide-react";
import type { RecentSearchesDropdownProps } from "../../types/ui";

export const RecentSearchesDropdown: FC<RecentSearchesDropdownProps> = ({
	recentSearches,
	onSelect,
	onClear,
	visible,
}) => {
	if (!visible || recentSearches.length === 0) return null;

	return (
		<AnimatePresence>
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, y: -10 }}
				className="absolute left-0 right-0 top-full z-50 mt-1 overflow-hidden rounded-lg border border-white/5 bg-ctp-mantle shadow-lg"
			>
				<div className="flex items-center justify-between border-b border-white/5 px-3 py-2">
					<div className="flex items-center gap-2 text-xs text-ctp-subtext0">
						<History size={12} />
						Recent Searches
					</div>
					<button
						onClick={onClear}
						className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs text-ctp-subtext0 hover:bg-white/5 hover:text-ctp-text"
					>
						<X size={12} />
						Clear
					</button>
				</div>
				<div className="max-h-48 overflow-y-auto">
					{recentSearches.map((search, index) => (
						<motion.button
							key={search}
							initial={{ opacity: 0, x: -20 }}
							animate={{ opacity: 1, x: 0 }}
							transition={{ delay: index * 0.05 }}
							onClick={() => onSelect(search)}
							className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ctp-text transition-colors hover:bg-white/5"
						>
							<History size={14} className="text-ctp-subtext0" />
							{search}
						</motion.button>
					))}
				</div>
			</motion.div>
		</AnimatePresence>
	);
};

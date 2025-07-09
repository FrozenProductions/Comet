import { motion } from "motion/react";
import type { FC } from "react";
import { CATEGORY_CONFIG } from "../../constants/changelog";
import type { ChangelogEntryProps } from "../../types/changelogs";

const ChangelogEntry: FC<ChangelogEntryProps> = ({ change }) => {
	const config = CATEGORY_CONFIG[change.type];
	const Icon = config.icon;

	return (
		<motion.div
			className="group"
			initial={{ opacity: 0, y: 10 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
		>
			<div className="flex items-start gap-4 py-3 -mx-3 px-3 rounded-lg hover:bg-theme-surface/30 transition-colors">
				<div
					className={`${config.bg} w-7 h-7 mt-0.5 rounded flex items-center justify-center flex-shrink-0`}
				>
					<Icon className={`w-4 h-4 ${config.text}`} />
				</div>
				<div className="min-w-0 flex-1">
					<div className="flex items-center gap-3 mb-1.5">
						<h3 className="text-theme-bright text-[15px] font-medium group-hover:text-theme-accent-light transition-colors">
							{change.title}
						</h3>
						<span
							className={`${config.text} ${config.bg} px-2 py-0.5 rounded-full text-xs font-medium`}
						>
							{config.label}
						</span>
					</div>
					<p className="text-theme-subtle text-sm leading-relaxed">
						{change.description}
					</p>
				</div>
			</div>
		</motion.div>
	);
};

export default ChangelogEntry;

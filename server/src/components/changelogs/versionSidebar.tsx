import { motion } from "motion/react";
import type { FC } from "react";
import type { VersionSidebarProps } from "../../types/changelogs";

const VersionSidebar: FC<VersionSidebarProps> = ({
	sections,
	selectedVersion,
	onVersionSelect,
}) => {
	return (
		<nav className="h-[calc(100vh-8rem)] overflow-y-auto pr-4">
			<div className="space-y-6">
				{sections.map((section) => (
					<div key={section.year}>
						<div className="flex items-center gap-3 mb-3">
							<h2 className="text-theme-subtle text-xs font-medium uppercase tracking-wider">
								{section.year}
							</h2>
							<div className="h-px flex-1 bg-theme-surface" />
						</div>
						<div className="space-y-0.5">
							{section.releases.map((release) => (
								<motion.button
									type="button"
									key={`${section.year}-${release.version}`}
									onClick={() => onVersionSelect(release.version)}
									className={`group relative w-full text-left px-3 py-2 rounded-lg text-sm transition-all ${
										selectedVersion === release.version
											? "text-theme-bright"
											: "text-theme-text hover:text-theme-bright"
									}`}
									whileHover={{ x: 4 }}
									transition={{ duration: 0.2 }}
								>
									{selectedVersion === release.version && (
										<motion.div
											layoutId="activeVersion"
											className="absolute inset-0 bg-theme-surface rounded-lg"
											transition={{ duration: 0.3 }}
										/>
									)}
									<span className="relative z-10 flex items-baseline gap-2">
										<span className="font-medium">v{release.version}</span>
										<time className="text-xs text-theme-subtle group-hover:text-theme-text transition-colors">
											{new Date(release.date).toLocaleDateString("en-US", {
												month: "short",
												day: "numeric",
											})}
										</time>
									</span>
								</motion.button>
							))}
						</div>
					</div>
				))}
			</div>
		</nav>
	);
};

export default VersionSidebar;

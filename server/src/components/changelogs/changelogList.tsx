import type { FC } from "react";
import { CATEGORY_CONFIG, CATEGORY_ORDER } from "../../constants/changelog";
import type { Change, ChangelogListProps } from "../../types/changelogs";
import ChangelogEntry from "./changelogEntry";

const ChangelogList: FC<ChangelogListProps> = ({ sections }) => {
	const groupChangesByCategory = (changes: Change[]) => {
		const grouped = changes.reduce(
			(acc, change) => {
				if (!acc[change.type]) {
					acc[change.type] = [];
				}
				acc[change.type].push(change);
				return acc;
			},
			{} as Record<string, Change[]>,
		);

		return CATEGORY_ORDER.map((category) => ({
			type: category,
			changes: grouped[category] || [],
		})).filter((group) => group.changes.length > 0);
	};

	return (
		<div className="space-y-10">
			{sections.map((section) => (
				<div key={section.year}>
					{section.releases.map((release) => {
						const groupedChanges = groupChangesByCategory(release.changes);

						return (
							<div key={release.version} className="space-y-6">
								{groupedChanges.map((group) => {
									const config = CATEGORY_CONFIG[group.type];
									const Icon = config.icon;
									return (
										<div key={group.type} className="space-y-3">
											<div className="flex items-center gap-2 text-theme-subtle">
												<div
													className={`${config.bg} w-5 h-5 rounded flex items-center justify-center`}
												>
													<Icon className={`w-3 h-3 ${config.text}`} />
												</div>
												<h4 className="text-sm font-medium">{config.label}</h4>
											</div>
											<div className="space-y-3">
												{group.changes.map((change, index) => (
													<ChangelogEntry
														key={`${release.version}-${group.type}-${index}`}
														change={change}
													/>
												))}
											</div>
										</div>
									);
								})}
							</div>
						);
					})}
				</div>
			))}
		</div>
	);
};

export default ChangelogList;

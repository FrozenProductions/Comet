import type { FC } from "react";
import type { ReleaseSectionProps } from "../../types/changelogs";
import ChangelogEntry from "./changelogEntry";

const ReleaseSection: FC<ReleaseSectionProps> = ({ release }) => {
    const changesByType = {
        feature: release.changes.filter((c) => c.type === "feature"),
        improvement: release.changes.filter((c) => c.type === "improvement"),
        bugfix: release.changes.filter((c) => c.type === "bugfix"),
    };

    return (
        <div className="mb-12 last:mb-0">
            <div className="flex items-center justify-between mb-8 pb-3 border-b border-theme-surface">
                <div>
                    <h3 className="text-theme-text text-2xl font-bold mb-1">
                        Version {release.version}
                    </h3>
                    <time className="text-theme-text/60 text-sm">
                        {release.date}
                    </time>
                </div>
            </div>

            {Object.entries(changesByType).map(([type, changes]) =>
                changes.length > 0 ? (
                    <div key={type} className="mb-8 last:mb-0">
                        <h4 className="text-theme-text/80 text-lg font-medium mb-4 capitalize">
                            {type}s
                        </h4>
                        <div className="space-y-4">
                            {changes.map((change) => (
                                <ChangelogEntry
                                    key={`${release.version}-${type}-${change.title}`}
                                    change={change}
                                />
                            ))}
                        </div>
                    </div>
                ) : null,
            )}
        </div>
    );
};

export default ReleaseSection;

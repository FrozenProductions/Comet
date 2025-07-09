import type { LucideIcon } from "lucide-react";

export type ChangeType = "feature" | "improvement" | "bugfix";

export interface Change {
	type: ChangeType;
	title: string;
	description: string;
}

export interface Release {
	version: string;
	date: string;
	changes: Change[];
}

export interface ChangelogSection {
	year: number;
	releases: Release[];
}

export interface ChangelogListProps {
	sections: ChangelogSection[];
}

export interface ChangelogEntryProps {
	change: Change;
}

export interface ReleaseSectionProps {
	release: Release;
}

export interface VersionSidebarProps {
	sections: ChangelogSection[];
	selectedVersion: string;
	onVersionSelect: (version: string) => void;
}

export interface CategoryConfig {
	label: string;
	icon: LucideIcon;
	text: string;
	bg: string;
}

export interface ReleaseSectionProps {
	release: Release;
}

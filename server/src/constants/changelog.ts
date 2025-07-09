import { Bug, Sparkles, Zap } from "lucide-react";
import type { CategoryConfig, ChangeType } from "../types/changelogs";

export const CATEGORY_CONFIG: Record<ChangeType, CategoryConfig> = {
	feature: {
		label: "New Features",
		icon: Sparkles,
		text: "text-palette-green",
		bg: "bg-palette-green/5",
	},
	improvement: {
		label: "Improvements",
		icon: Zap,
		text: "text-palette-blue",
		bg: "bg-palette-blue/5",
	},
	bugfix: {
		label: "Bug Fixes",
		icon: Bug,
		text: "text-palette-yellow",
		bg: "bg-palette-yellow/5",
	},
} as const;

export const CATEGORY_ORDER: readonly ChangeType[] = [
	"feature",
	"improvement",
	"bugfix",
] as const;

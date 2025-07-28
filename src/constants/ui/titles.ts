import type { BRANDS_CONFIG } from "../../../.comet/build/constants/brands";

export const TITLES: Record<keyof typeof BRANDS_CONFIG, string> = {
	default: "Comet",
	hydrogen: "Hydrogen",
} as const;

export const APP_TITLE = TITLES.default;

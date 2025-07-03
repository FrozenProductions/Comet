import type { FastFlagsState } from "../../types/roblox/fastFlags";

export const INITIAL_FAST_FLAGS_STATE: FastFlagsState = {
	profiles: [],
	activeProfileId: null,
	isLoading: true,
	error: null,
} as const;

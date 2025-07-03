import { createContext } from "react";
import type {
	FastFlagsProfile,
	FastFlagsState,
} from "../../types/roblox/fastFlags";

export interface FastFlagsContextType {
	state: FastFlagsState;
	createProfile: (name: string) => Promise<void>;
	saveProfile: (profile: FastFlagsProfile) => Promise<void>;
	deleteProfile: (profileId: string) => Promise<void>;
	activateProfile: (profileId: string) => Promise<void>;
	deactivateProfile: () => Promise<void>;
	updateFlagValue: (
		profileId: string,
		keyOrUpdates: string | Record<string, string | null>,
		value?: string | null,
	) => Promise<void>;
	renameProfile: (profileId: string, newName: string) => Promise<void>;
	loadProfiles: () => Promise<void>;
}

export const FastFlagsContext = createContext<FastFlagsContextType | null>(
	null,
);

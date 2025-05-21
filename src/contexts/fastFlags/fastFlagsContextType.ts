import { createContext } from "react";
import { FastFlagsState, FastFlagsProfile } from "../../types/fastFlags";

export const FastFlagsContext = createContext<{
    state: FastFlagsState;
    createProfile: (name: string) => Promise<void>;
    saveProfile: (profile: FastFlagsProfile) => Promise<void>;
    deleteProfile: (profileId: string) => Promise<void>;
    activateProfile: (profileId: string) => Promise<void>;
    deactivateProfile: () => Promise<void>;
    updateFlagValue: (
        profileId: string,
        key: string,
        value: any | null
    ) => Promise<void>;
} | null>(null);

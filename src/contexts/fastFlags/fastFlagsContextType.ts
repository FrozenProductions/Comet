import { createContext } from "react";
import { FastFlagsState, FastFlagsProfile } from "../../types/fastFlags";

export interface FastFlagsContextType {
    state: FastFlagsState;
    createProfile: (name: string) => Promise<void>;
    saveProfile: (profile: FastFlagsProfile) => Promise<void>;
    deleteProfile: (profileId: string) => Promise<void>;
    activateProfile: (profileId: string) => Promise<void>;
    deactivateProfile: () => Promise<void>;
    updateFlagValue: (
        profileId: string,
        key: string,
        value: any | null,
    ) => Promise<void>;
    renameProfile: (profileId: string, newName: string) => Promise<void>;
}

export const FastFlagsContext = createContext<FastFlagsContextType>({
    state: {
        profiles: [],
        activeProfileId: null,
        isLoading: true,
        error: null,
    },
    createProfile: async () => {},
    saveProfile: async () => {},
    deleteProfile: async () => {},
    activateProfile: async () => {},
    deactivateProfile: async () => {},
    updateFlagValue: async () => {},
    renameProfile: async () => {},
});

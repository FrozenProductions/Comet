import React, { createContext, useContext, useEffect, useState } from "react";
import { FastFlagsProfile, FastFlagsState } from "../types/FastFlags";
import { FastFlagsProfileService } from "../services/FastFlagsProfileService";

const initialState: FastFlagsState = {
    profiles: [],
    activeProfileId: null,
    isLoading: true,
    error: null,
};

const FastFlagsContext = createContext<{
    state: FastFlagsState;
    createProfile: (name: string) => Promise<void>;
    saveProfile: (profile: FastFlagsProfile) => Promise<void>;
    deleteProfile: (profileId: string) => Promise<void>;
    activateProfile: (profileId: string) => Promise<void>;
    updateFlagValue: (
        profileId: string,
        key: string,
        value: any | null
    ) => Promise<void>;
} | null>(null);

export const FastFlagsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [state, setState] = useState<FastFlagsState>(initialState);

    useEffect(() => {
        loadProfiles();
    }, []);

    const loadProfiles = async () => {
        try {
            const { profiles, activeProfileId } =
                await FastFlagsProfileService.loadProfiles();
            setState((prev) => ({
                ...prev,
                profiles,
                activeProfileId,
                isLoading: false,
            }));
        } catch (error) {
            setState((prev) => ({
                ...prev,
                error: String(error),
                isLoading: false,
            }));
        }
    };

    const createProfile = async (name: string) => {
        const newProfile = FastFlagsProfileService.createNewProfile(name);
        await FastFlagsProfileService.saveProfile(newProfile);
        await loadProfiles();
    };

    const saveProfile = async (profile: FastFlagsProfile) => {
        await FastFlagsProfileService.saveProfile(profile);
        await loadProfiles();
    };

    const deleteProfile = async (profileId: string) => {
        await FastFlagsProfileService.deleteProfile(profileId);
        await loadProfiles();
    };

    const activateProfile = async (profileId: string) => {
        await FastFlagsProfileService.activateProfile(profileId);
        setState((prev) => ({ ...prev, activeProfileId: profileId }));
    };

    const updateFlagValue = async (
        profileId: string,
        key: string,
        value: any | null
    ) => {
        const profile = state.profiles.find((p) => p.id === profileId);
        if (!profile) return;

        const updatedProfile = {
            ...profile,
            flags:
                value === null
                    ? Object.fromEntries(
                          Object.entries(profile.flags).filter(
                              ([k]) => k !== key
                          )
                      )
                    : {
                          ...profile.flags,
                          [key]: value,
                      },
        };

        await saveProfile(updatedProfile);
    };

    return (
        <FastFlagsContext.Provider
            value={{
                state,
                createProfile,
                saveProfile,
                deleteProfile,
                activateProfile,
                updateFlagValue,
            }}
        >
            {children}
        </FastFlagsContext.Provider>
    );
};

export const useFastFlags = () => {
    const context = useContext(FastFlagsContext);
    if (!context) {
        throw new Error("useFastFlags must be used within a FastFlagsProvider");
    }
    return context;
};

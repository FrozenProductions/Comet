import React, { useEffect, useState } from "react";
import { FastFlagsProfile, FastFlagsState } from "../../types/fastFlags";
import { FastFlagsProfileService } from "../../services/fastFlagsProfileService";
import { invoke } from "@tauri-apps/api/tauri";
import { INITIAL_FAST_FLAGS_STATE } from "../../constants/fastFlags";
import { FastFlagsContext } from "./fastFlagsContextType";

export const FastFlagsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const [state, setState] = useState<FastFlagsState>(
        INITIAL_FAST_FLAGS_STATE,
    );

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

    useEffect(() => {
        loadProfiles();
    }, []);

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

    const deactivateProfile = async () => {
        try {
            await invoke("cleanup_fast_flags");
            setState((prev) => ({ ...prev, activeProfileId: null }));
        } catch (error) {
            console.error("Failed to deactivate profile:", error);
            throw error;
        }
    };

    const updateFlagValue = async (
        profileId: string,
        key: string | Record<string, string | null>,
        value: string | null = null,
    ) => {
        const profile = state.profiles.find((p) => p.id === profileId);
        if (!profile) return;

        let updatedFlags = { ...profile.flags };

        if (typeof key === "object") {
            Object.entries(key).forEach(([flagKey, flagValue]) => {
                if (flagValue === null) {
                    delete updatedFlags[flagKey];
                } else {
                    updatedFlags[flagKey] = flagValue;
                }
            });
        } else {
            if (value === null) {
                delete updatedFlags[key];
            } else {
                updatedFlags[key] = value;
            }
        }

        const updatedProfile = {
            ...profile,
            flags: updatedFlags,
        };

        await saveProfile(updatedProfile);
    };

    const renameProfile = async (profileId: string, newName: string) => {
        const profile = state.profiles.find((p) => p.id === profileId);
        if (!profile) return;

        await FastFlagsProfileService.renameProfile(profileId, newName);
        await loadProfiles();
    };

    return (
        <FastFlagsContext.Provider
            value={{
                state,
                createProfile,
                saveProfile,
                deleteProfile,
                activateProfile,
                deactivateProfile,
                updateFlagValue,
                renameProfile,
                loadProfiles,
            }}
        >
            {children}
        </FastFlagsContext.Provider>
    );
};

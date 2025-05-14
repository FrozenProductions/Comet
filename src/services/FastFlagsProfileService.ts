import { invoke } from "@tauri-apps/api/tauri";
import { FastFlagsProfile } from "../types/FastFlags";
import { v4 as uuidv4 } from "uuid";

export interface LoadProfilesResponse {
    profiles: FastFlagsProfile[];
    activeProfileId: string | null;
}

export const FastFlagsProfileService = {
    async loadProfiles(): Promise<LoadProfilesResponse> {
        const [profiles, activeId] = await invoke<
            [FastFlagsProfile[], string | null]
        >("load_fast_flags_profiles");
        return {
            profiles,
            activeProfileId: activeId || null,
        };
    },

    async saveProfile(profile: FastFlagsProfile): Promise<void> {
        await invoke("save_fast_flags_profile", { profile });
    },

    async deleteProfile(profileId: string): Promise<void> {
        await invoke("delete_fast_flags_profile", { profileId });
    },

    async activateProfile(profileId: string): Promise<void> {
        await invoke("activate_fast_flags_profile", { profileId });
    },

    createNewProfile(name: string): FastFlagsProfile {
        return {
            id: uuidv4(),
            name,
            flags: {},
        };
    },
};

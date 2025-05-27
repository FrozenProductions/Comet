import { invoke } from "@tauri-apps/api/tauri";
import { FastFlagsProfile, LoadProfilesResponse } from "../types/fastFlags";
import { v4 as uuidv4 } from "uuid";

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

    async renameProfile(profileId: string, newName: string): Promise<void> {
        const [profiles] = await invoke<[FastFlagsProfile[], string | null]>(
            "load_fast_flags_profiles",
        );
        const profile = profiles.find((p) => p.id === profileId);
        if (!profile) throw new Error("Profile not found");

        const updatedProfile = { ...profile, name: newName };
        await invoke("save_fast_flags_profile", { profile: updatedProfile });
    },

    createNewProfile(name: string): FastFlagsProfile {
        return {
            id: uuidv4(),
            name,
            flags: {},
        };
    },

    async exportProfiles(): Promise<FastFlagsProfile[]> {
        return await invoke<FastFlagsProfile[]>("export_fast_flags_profiles");
    },

    async importProfiles(profiles: FastFlagsProfile[]): Promise<void> {
        await invoke("import_fast_flags_profiles", { profiles });
    },

    async exportToFile(): Promise<void> {
        await invoke("export_fast_flags_profiles");
    },

    async importFromFile(): Promise<void> {
        await invoke("import_fast_flags_profiles");
    },
};

import { invoke } from "@tauri-apps/api/tauri";
import { FastFlagsProfile, LoadProfilesResponse } from "../types/fastFlags";
import { v4 as uuidv4 } from "uuid";

/**
 * Loads all fast flags profiles and the active profile
 * @returns Promise with profiles and active profile ID
 * @throws Error if loading profiles fails
 */
export const loadProfiles = async (): Promise<LoadProfilesResponse> => {
	const [profiles, activeId] = await invoke<
		[FastFlagsProfile[], string | null]
	>("load_fast_flags_profiles");
	return {
		profiles,
		activeProfileId: activeId || null,
	};
};

/**
 * Saves a fast flags profile
 * @param profile The profile to save
 * @throws Error if saving profile fails
 */
export const saveProfile = async (profile: FastFlagsProfile): Promise<void> => {
	await invoke("save_fast_flags_profile", { profile });
};

/**
 * Deletes a fast flags profile
 * @param profileId The ID of the profile to delete
 * @throws Error if deleting profile fails
 */
export const deleteProfile = async (profileId: string): Promise<void> => {
	await invoke("delete_fast_flags_profile", { profileId });
};

/**
 * Activates a fast flags profile
 * @param profileId The ID of the profile to activate
 * @throws Error if activating profile fails
 */
export const activateProfile = async (profileId: string): Promise<void> => {
	await invoke("activate_fast_flags_profile", { profileId });
};

/**
 * Deactivates the current fast flags profile and cleans up the fast flags file
 * @throws Error if the deactivation fails
 */
export const deactivateProfile = async (): Promise<void> => {
	try {
		await invoke("cleanup_fast_flags");
	} catch (error) {
		console.error("Failed to deactivate profile:", error);
		throw error;
	}
};

/**
 * Renames a fast flags profile
 * @param profileId The ID of the profile to rename
 * @param newName The new name for the profile
 * @throws Error if renaming profile fails or profile not found
 */
export const renameProfile = async (
	profileId: string,
	newName: string,
): Promise<void> => {
	const [profiles] = await invoke<[FastFlagsProfile[], string | null]>(
		"load_fast_flags_profiles",
	);
	const profile = profiles.find((p) => p.id === profileId);
	if (!profile) throw new Error("Profile not found");

	const updatedProfile = { ...profile, name: newName };
	await invoke("save_fast_flags_profile", { profile: updatedProfile });
};

/**
 * Creates a new fast flags profile
 * @param name The name for the new profile
 * @returns The created profile object
 */
export const createNewProfile = (name: string): FastFlagsProfile => {
	const now = new Date().toISOString();
	return {
		id: uuidv4(),
		name,
		flags: {},
		createdAt: now,
		updatedAt: now,
	};
};

/**
 * Exports all fast flags profiles
 * @returns Promise with array of profiles
 * @throws Error if exporting profiles fails
 */
export const exportProfiles = async (): Promise<FastFlagsProfile[]> => {
	return await invoke<FastFlagsProfile[]>("export_fast_flags_profiles");
};

/**
 * Imports fast flags profiles
 * @param profiles Array of profiles to import
 * @throws Error if importing profiles fails
 */
export const importProfiles = async (
	profiles: FastFlagsProfile[],
): Promise<void> => {
	await invoke("import_fast_flags_profiles", { profiles });
};

/**
 * Exports fast flags profiles to a file
 * @param selectedProfileId Optional ID of the profile to export flags from
 * @throws Error if exporting to file fails
 */
export const exportToFile = async (
	selectedProfileId?: string,
): Promise<boolean> => {
	return await invoke("export_fast_flags_profiles", { selectedProfileId });
};

/**
 * Imports fast flags profiles from a file
 * @throws Error if importing from file fails
 */
export const importFromFile = async (): Promise<boolean> => {
	return await invoke("import_fast_flags_profiles");
};

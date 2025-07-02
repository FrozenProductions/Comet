import type React from "react";
import { useCallback, useEffect, useState } from "react";
import { INITIAL_FAST_FLAGS_STATE } from "../../constants/fastFlags";
import {
	activateProfile as activateProfileService,
	createNewProfile as createNewProfileService,
	deactivateProfile as deactivateProfileService,
	deleteProfile as deleteProfileService,
	loadProfiles as loadProfilesService,
	renameProfile as renameProfileService,
	saveProfile as saveProfileService,
} from "../../services/fastFlagsProfileService";
import type { FastFlagsProfile, FastFlagsState } from "../../types/fastFlags";
import { FastFlagsContext } from "./fastFlagsContextType";

export const FastFlagsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const [state, setState] = useState<FastFlagsState>(INITIAL_FAST_FLAGS_STATE);

	const loadProfiles = useCallback(async () => {
		try {
			const { profiles, activeProfileId } = await loadProfilesService();
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
	}, []);

	useEffect(() => {
		loadProfiles();
	}, [loadProfiles]);

	const createProfile = async (name: string) => {
		const newProfile = createNewProfileService(name);
		await saveProfileService(newProfile);
		await loadProfiles();
	};

	const saveProfile = async (profile: FastFlagsProfile) => {
		await saveProfileService(profile);
		await loadProfiles();
	};

	const deleteProfile = async (profileId: string) => {
		await deleteProfileService(profileId);
		await loadProfiles();
	};

	const activateProfile = async (profileId: string) => {
		await activateProfileService(profileId);
		setState((prev) => ({ ...prev, activeProfileId: profileId }));
	};

	const deactivateProfile = async () => {
		try {
			await deactivateProfileService();
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

		const updatedFlags = { ...profile.flags };

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

		await renameProfileService(profileId, newName);
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

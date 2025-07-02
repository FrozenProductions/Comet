import { useState, useEffect } from "react";
import {
	DEFAULT_EDITOR_SETTINGS,
	SETTINGS_STORAGE_KEY,
} from "../../constants/settings";
import type { EditorSettings } from "../../types/settings";
import { SettingsContext } from "./settingsContextType";
import { toast } from "react-hot-toast";

const mergeWithDefaults = (
	savedSettings: Partial<EditorSettings>,
	defaults: EditorSettings,
): EditorSettings => {
	const merged = { ...defaults };

	for (const [key, value] of Object.entries(savedSettings)) {
		if (key in defaults) {
			if (typeof defaults[key as keyof EditorSettings] === "object" && value) {
				merged[key as keyof EditorSettings] = {
					...defaults[key as keyof EditorSettings],
					...value,
				} as any;
			} else {
				merged[key as keyof EditorSettings] = value as any;
			}
		}
	}

	return merged;
};

const validateSettings = (settings: EditorSettings): boolean => {
	try {
		if (
			!settings.display ||
			typeof settings.display.showLineNumbers !== "boolean"
		)
			return false;
		if (!settings.text || typeof settings.text.fontSize !== "number")
			return false;
		if (!settings.cursor || typeof settings.cursor.smoothCaret !== "boolean")
			return false;
		if (
			!settings.intellisense ||
			typeof settings.intellisense.enabled !== "boolean"
		)
			return false;
		if (!settings.interface || typeof settings.interface.zenMode !== "boolean")
			return false;
		if (
			!settings.interface.executionHistory ||
			typeof settings.interface.executionHistory.maxItems !== "number"
		)
			return false;

		return true;
	} catch {
		return false;
	}
};

const safeLocalStorageGet = (key: string): string | null => {
	try {
		return localStorage.getItem(key);
	} catch (error) {
		console.error("Failed to access localStorage:", error);
		return null;
	}
};

const safeLocalStorageSet = (key: string, value: string): boolean => {
	try {
		localStorage.setItem(key, value);
		return true;
	} catch (error) {
		console.error("Failed to write to localStorage:", error);
		return false;
	}
};

export const SettingsProvider = ({
	children,
}: {
	children: React.ReactNode;
}) => {
	const [settings, setSettings] = useState<EditorSettings>(
		DEFAULT_EDITOR_SETTINGS,
	);
	const [isInitialized, setIsInitialized] = useState(false);
	const [hasLocalStorageError, setHasLocalStorageError] = useState(false);

	useEffect(() => {
		const initializeSettings = () => {
			try {
				const savedSettings = safeLocalStorageGet(SETTINGS_STORAGE_KEY);
				let parsedSettings: Partial<EditorSettings> = {};

				if (savedSettings) {
					try {
						parsedSettings = JSON.parse(savedSettings);
					} catch (error) {
						console.error("Failed to parse saved settings:", error);
						toast.error("Failed to load saved settings. Restoring defaults.");
					}
				}

				const mergedSettings = mergeWithDefaults(
					parsedSettings,
					DEFAULT_EDITOR_SETTINGS,
				);

				if (!validateSettings(mergedSettings)) {
					throw new Error("Invalid settings structure");
				}

				setSettings(mergedSettings);

				const saveSuccess = safeLocalStorageSet(
					SETTINGS_STORAGE_KEY,
					JSON.stringify(mergedSettings),
				);

				if (!saveSuccess) {
					setHasLocalStorageError(true);
					toast.error("Unable to save settings to local storage");
				}
			} catch (error) {
				console.error("Settings initialization error:", error);
				setSettings(DEFAULT_EDITOR_SETTINGS);

				const saveSuccess = safeLocalStorageSet(
					SETTINGS_STORAGE_KEY,
					JSON.stringify(DEFAULT_EDITOR_SETTINGS),
				);

				if (!saveSuccess) {
					setHasLocalStorageError(true);
				}

				toast.error("Settings were corrupted. Restored to defaults.");
			} finally {
				setIsInitialized(true);
			}
		};

		initializeSettings();
	}, []);

	const updateSettings = (newSettings: Partial<EditorSettings>) => {
		setSettings((prev) => {
			try {
				const updated = {
					...prev,
					...newSettings,
					display: {
						...prev.display,
						...(newSettings.display || {}),
					},
					text: {
						...prev.text,
						...(newSettings.text || {}),
					},
					cursor: {
						...prev.cursor,
						...(newSettings.cursor || {}),
					},
					intellisense: {
						...prev.intellisense,
						...(newSettings.intellisense || {}),
					},
					interface: {
						...prev.interface,
						...(newSettings.interface || {}),
						recentSearches: {
							...prev.interface.recentSearches,
							...(newSettings.interface?.recentSearches || {}),
						},
						executionHistory: {
							...prev.interface.executionHistory,
							...(newSettings.interface?.executionHistory || {}),
						},
					},
				};

				if (!validateSettings(updated)) {
					throw new Error("Invalid settings update");
				}

				if (!hasLocalStorageError) {
					const saveSuccess = safeLocalStorageSet(
						SETTINGS_STORAGE_KEY,
						JSON.stringify(updated),
					);

					if (!saveSuccess) {
						setHasLocalStorageError(true);
						toast.error("Unable to save settings to local storage");
					}
				}

				return updated;
			} catch (error) {
				console.error("Failed to update settings:", error);
				toast.error("Failed to save settings");
				return prev;
			}
		});
	};

	if (!isInitialized) {
		return null;
	}

	return (
		<SettingsContext.Provider
			value={{
				settings,
				updateSettings,
				hasLocalStorageError,
			}}
		>
			{children}
		</SettingsContext.Provider>
	);
};

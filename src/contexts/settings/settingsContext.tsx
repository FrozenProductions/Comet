import { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
    DEFAULT_EDITOR_SETTINGS,
    SETTINGS_STORAGE_KEY,
} from "../../constants/core/settings";
import { useLocalStorage } from "../../hooks/core/useLocalStorage";
import type { EditorSettings } from "../../types/core/settings";
import { SettingsContext } from "./settingsContextType";

const mergeWithDefaults = (
    savedSettings: Partial<EditorSettings>,
    defaults: EditorSettings,
): EditorSettings => {
    const merged = { ...defaults };

    for (const [key, value] of Object.entries(savedSettings)) {
        if (key in defaults) {
            if (
                typeof defaults[key as keyof EditorSettings] === "object" &&
                value
            ) {
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
        if (
            !settings.cursor ||
            typeof settings.cursor.smoothCaret !== "boolean"
        )
            return false;
        if (
            !settings.intellisense ||
            typeof settings.intellisense.enabled !== "boolean"
        )
            return false;
        if (
            !settings.interface ||
            typeof settings.interface.zenMode !== "boolean"
        )
            return false;
        if (
            !settings.interface.executionHistory ||
            typeof settings.interface.executionHistory.maxItems !== "number"
        )
            return false;
        if (
            !settings.app ||
            typeof settings.app.startAtLogin !== "boolean" ||
            typeof settings.app.apiType !== "string"
        )
            return false;

        return true;
    } catch {
        return false;
    }
};

export const SettingsProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [settings, setSettings] = useLocalStorage<EditorSettings>(
        SETTINGS_STORAGE_KEY,
        DEFAULT_EDITOR_SETTINGS,
    );
    const [isInitialized, setIsInitialized] = useState(false);
    const [hasLocalStorageError] = useState(false);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <>
    useEffect(() => {
        try {
            const savedValue = localStorage.getItem(SETTINGS_STORAGE_KEY);
            if (!savedValue) return;

            const parsed = JSON.parse(savedValue);
            const merged = mergeWithDefaults(parsed, DEFAULT_EDITOR_SETTINGS);

            if (!validateSettings(merged)) {
                toast.error("Settings were corrupted. Restored to defaults.");
                setSettings(DEFAULT_EDITOR_SETTINGS);
                return;
            }

            setSettings(merged);
        } catch (error) {
            console.error("Failed to parse saved settings:", error);
            toast.error("Failed to load saved settings. Restoring defaults.");
            setSettings(DEFAULT_EDITOR_SETTINGS);
        } finally {
            setIsInitialized(true);
        }
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
                    app: {
                        ...prev.app,
                        ...(newSettings.app || {}),
                    },
                };

                if (!validateSettings(updated)) {
                    throw new Error("Invalid settings update");
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

import { useState } from "react";
import {
    DEFAULT_EDITOR_SETTINGS,
    SETTINGS_STORAGE_KEY,
} from "../../constants/settings";
import type { EditorSettings } from "../../types/settings";
import { SettingsContext } from "./settingsContextType";

export const SettingsProvider = ({
    children,
}: {
    children: React.ReactNode;
}) => {
    const [settings, setSettings] = useState<EditorSettings>(() => {
        const savedSettings = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (savedSettings) {
            try {
                return {
                    ...DEFAULT_EDITOR_SETTINGS,
                    ...JSON.parse(savedSettings),
                };
            } catch {
                return DEFAULT_EDITOR_SETTINGS;
            }
        }
        return DEFAULT_EDITOR_SETTINGS;
    });

    const updateSettings = (newSettings: Partial<EditorSettings>) => {
        setSettings((prev) => {
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
                },
            };
            localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

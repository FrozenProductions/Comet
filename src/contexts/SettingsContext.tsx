import { createContext, useContext, useState } from "react";
import type { EditorSettings, SettingsContextType } from "../types/settings";
import { DEFAULT_EDITOR_SETTINGS } from "../constants/settings";

const SettingsContext = createContext<SettingsContextType | undefined>(
    undefined
);

const SETTINGS_STORAGE_KEY = "comet-settings";

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

export const useSettings = () => {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        throw new Error("useSettings must be used within a SettingsProvider");
    }
    return context;
};

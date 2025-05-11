import { createContext, useContext, useState, FC, ReactNode } from "react";

export interface EditorSettings {
    display: {
        showLineNumbers: boolean;
        wordWrap: boolean;
    };
    text: {
        fontSize: number;
        tabSize: number;
        lineHeight: number;
    };
    cursor: {
        style: "line" | "block" | "underline";
        blinking: "blink" | "smooth" | "phase" | "expand" | "solid";
        smoothCaret: boolean;
    };
    theme: "light" | "dark" | "system";
    interface: {
        showTabBar: boolean;
        zenMode: boolean;
    };
    application: {
        startAtLogin: boolean;
        hardwareAcceleration: boolean;
    };
    developer: {
        developerMode: boolean;
        experimentalFeatures: boolean;
    };
    intellisense: {
        enabled: boolean;
        maxSuggestions: number;
    };
}

const defaultSettings: EditorSettings = {
    display: {
        showLineNumbers: true,
        wordWrap: false,
    },
    text: {
        fontSize: 14,
        tabSize: 2,
        lineHeight: 1.6,
    },
    cursor: {
        style: "line",
        blinking: "smooth",
        smoothCaret: true,
    },
    theme: "system",
    interface: {
        showTabBar: true,
        zenMode: false,
    },
    application: {
        startAtLogin: false,
        hardwareAcceleration: true,
    },
    developer: {
        developerMode: false,
        experimentalFeatures: false,
    },
    intellisense: {
        enabled: true,
        maxSuggestions: 10,
    },
};

const SETTINGS_STORAGE_KEY = "comet_editor_settings";

const loadSettings = (): EditorSettings => {
    try {
        const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
        if (stored) {
            const parsedSettings = JSON.parse(stored);
            return {
                ...defaultSettings,
                display: {
                    ...defaultSettings.display,
                    ...parsedSettings.display,
                },
                text: { ...defaultSettings.text, ...parsedSettings.text },
                interface: {
                    ...defaultSettings.interface,
                    ...parsedSettings.interface,
                },
                intellisense: {
                    ...defaultSettings.intellisense,
                    ...parsedSettings.intellisense,
                },
                application: {
                    ...defaultSettings.application,
                    ...parsedSettings.application,
                },
                developer: {
                    ...defaultSettings.developer,
                    ...parsedSettings.developer,
                },
            };
        }
    } catch (error) {
        console.error("Failed to load settings:", error);
    }

    localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(defaultSettings));
    return defaultSettings;
};

const SettingsContext = createContext<{
    settings: EditorSettings;
    updateSettings: (newSettings: Partial<EditorSettings>) => void;
}>({
    settings: defaultSettings,
    updateSettings: () => {},
});

export const useSettings = () => useContext(SettingsContext);

export const SettingsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [settings, setSettings] = useState<EditorSettings>(loadSettings);

    const updateSettings = (newSettings: Partial<EditorSettings>) => {
        const updated = {
            ...settings,
            ...newSettings,
            display: {
                ...settings.display,
                ...(newSettings.display || {}),
            },
            text: {
                ...settings.text,
                ...(newSettings.text || {}),
            },
            interface: {
                ...settings.interface,
                ...(newSettings.interface || {}),
            },
            application: {
                ...settings.application,
                ...(newSettings.application || {}),
            },
            developer: {
                ...settings.developer,
                ...(newSettings.developer || {}),
            },
            intellisense: {
                ...settings.intellisense,
                ...(newSettings.intellisense || {}),
            },
        };

        setSettings(updated);
        localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(updated));
    };

    return (
        <SettingsContext.Provider value={{ settings, updateSettings }}>
            {children}
        </SettingsContext.Provider>
    );
};

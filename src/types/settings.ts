import { Code2 } from "lucide-react";
import { ReactNode } from "react";

export type SettingsSection = {
    id: string;
    title: string;
    description: string;
    icon: typeof Code2;
};

export type SettingsContextType = {
    settings: EditorSettings;
    updateSettings: (newSettings: Partial<EditorSettings>) => void;
    hasLocalStorageError: boolean;
};

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
    intellisense: {
        enabled: boolean;
        maxSuggestions: number;
        acceptSuggestionKey: "Tab" | "Enter";
    };
    interface: {
        zenMode: boolean;
        showTabBar: boolean;
        showConsole: boolean;
        recentSearches: {
            enabled: boolean;
            maxItems: number;
        };
    };
    app: {
        nightlyReleases: boolean;
    };
}

export type SettingsKey = keyof EditorSettings;

export interface SettingGroupProps {
    title: string;
    description?: string;
    info?: string;
    icon?: ReactNode;
    children: ReactNode;
}

export interface TechStackItemProps {
    name: string;
    description: string;
    href: string;
    icon: string;
    invertIcon?: boolean;
}

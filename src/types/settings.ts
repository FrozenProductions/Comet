import { Code2 } from "lucide-react";

export type SettingsSection = {
    id: string;
    title: string;
    description: string;
    icon: typeof Code2;
};

export type SettingsContextType = {
    settings: EditorSettings;
    updateSettings: (newSettings: Partial<EditorSettings>) => void;
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
    };
    interface: {
        zenMode: boolean;
        showTabBar: boolean;
        showConsole: boolean;
    };
}

export type SettingsKey = keyof EditorSettings;

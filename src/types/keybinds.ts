export type Screen =
    | "Editor"
    | "Settings"
    | "FastFlags"
    | "Library"
    | "AutoExecution";

export type KeybindAction =
    | "newTab"
    | "closeTab"
    | "nextTab"
    | "previousTab"
    | "switchTab"
    | "toggleZenMode"
    | "toggleCommandPalette"
    | "executeScript"
    | "openRoblox"
    | "openSettings"
    | "toggleConsole";

export interface Keybind {
    key: string;
    modifiers: {
        cmd?: boolean;
        shift?: boolean;
        alt?: boolean;
        ctrl?: boolean;
    };
    action: KeybindAction;
    description: string;
    data?: {
        index?: number;
    };
}

export interface KeybindsContextType {
    keybinds: Keybind[];
    updateKeybind: (
        action: KeybindAction,
        newKeybind: Partial<Keybind>
    ) => void;
    isCommandPaletteOpen: boolean;
    toggleCommandPalette: () => void;
    activeScreen: Screen;
    handleScreenChange: (screen: Screen) => void;
    isConsoleOpen: boolean;
    setIsConsoleOpen: (isOpen: boolean | ((prev: boolean) => boolean)) => void;
    isKeybindEditorOpen: boolean;
    setIsKeybindEditorOpen: (isOpen: boolean) => void;
}

export interface KeybindEditorProps {
    isOpen: boolean;
    onClose: () => void;
    keybind: Keybind;
    onSave: (action: KeybindAction, updates: Partial<Keybind>) => void;
}

export interface ValidationError {
    type: "conflict" | "reserved" | "invalid";
    message: string;
}

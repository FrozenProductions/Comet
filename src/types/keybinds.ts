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
    | "openSettings";

export interface KeybindModifiers {
    cmd?: boolean;
    shift?: boolean;
    alt?: boolean;
    ctrl?: boolean;
}

export interface Keybind {
    key: string;
    modifiers: KeybindModifiers;
    action: KeybindAction;
    description: string;
    data?: any;
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
}

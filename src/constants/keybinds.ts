import type { KeybindAction, Keybind } from "../types/keybinds";

export const KEYBIND_CATEGORIES = {
    EDITOR: "Editor Actions",
    NAVIGATION: "Navigation",
    APPLICATION: "Application",
    SCREENS: "Screen Navigation",
} as const;

export const KEYBIND_CATEGORY_MAPPING: Record<
    KeybindAction,
    keyof typeof KEYBIND_CATEGORIES
> = {
    hideWindow: "APPLICATION",
    newTab: "EDITOR",
    closeTab: "EDITOR",
    executeScript: "EDITOR",
    nextTab: "NAVIGATION",
    previousTab: "NAVIGATION",
    switchTab: "NAVIGATION",
    toggleZenMode: "APPLICATION",
    toggleCommandPalette: "APPLICATION",
    openRoblox: "APPLICATION",
    openSettings: "SCREENS",
    collapseConsole: "APPLICATION",
    toggleConsole: "APPLICATION",
    openEditor: "SCREENS",
    openFastFlags: "SCREENS",
    openLibrary: "SCREENS",
    openAutoExecution: "SCREENS",
};

export const DEFAULT_KEYBINDS: Keybind[] = [
    {
        key: "q",
        modifiers: { cmd: true },
        action: "hideWindow",
        description: "Hide application window",
    },
    {
        key: "t",
        modifiers: { cmd: true },
        action: "newTab",
        description: "Create a new tab",
    },
    {
        key: "w",
        modifiers: { cmd: true },
        action: "closeTab",
        description: "Close current tab",
    },
    {
        key: "k",
        modifiers: { cmd: true, shift: true },
        action: "toggleZenMode",
        description: "Toggle zen mode",
    },
    {
        key: "p",
        modifiers: { cmd: true },
        action: "toggleCommandPalette",
        description: "Toggle command palette",
    },
    {
        key: "enter",
        modifiers: { cmd: true },
        action: "executeScript",
        description: "Execute current script",
    },
    {
        key: "o",
        modifiers: { cmd: true },
        action: "openRoblox",
        description: "Open Roblox",
    },
    {
        key: ",",
        modifiers: { cmd: true },
        action: "openSettings",
        description: "Open settings",
    },
    {
        key: "j",
        modifiers: { cmd: true },
        action: "collapseConsole",
        description: "Expand/collapse Roblox console",
    },
    {
        key: "l",
        modifiers: { cmd: true },
        action: "toggleConsole",
        description: "Show/hide Roblox console",
    },
    {
        key: "e",
        modifiers: { cmd: true, shift: true },
        action: "openEditor",
        description: "Switch to editor",
    },
    {
        key: "f",
        modifiers: { cmd: true, shift: true },
        action: "openFastFlags",
        description: "Switch to fast flags",
    },
    {
        key: "l",
        modifiers: { cmd: true, shift: true },
        action: "openLibrary",
        description: "Switch to library",
    },
    {
        key: "a",
        modifiers: { cmd: true, shift: true },
        action: "openAutoExecution",
        description: "Switch to auto execution",
    },
    ...Array.from({ length: 20 }, (_, i) => ({
        key: (i + 1).toString(),
        modifiers: { cmd: true },
        action: "switchTab" as const,
        description: `Switch to tab ${i + 1}`,
        data: { index: i },
    })),
] as const;

export const INVALID_KEYS = [
    "meta",
    "shift",
    "alt",
    "control",
    "escape",
    "tab",
] as const;

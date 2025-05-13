import type { KeybindAction } from "../contexts/KeybindsContext";

export const KEYBIND_CATEGORIES = {
    EDITOR: "Editor Actions",
    NAVIGATION: "Navigation",
    APPLICATION: "Application",
} as const;

export const KEYBIND_CATEGORY_MAPPING: Record<
    KeybindAction,
    keyof typeof KEYBIND_CATEGORIES
> = {
    newTab: "EDITOR",
    closeTab: "EDITOR",
    executeScript: "EDITOR",
    nextTab: "NAVIGATION",
    previousTab: "NAVIGATION",
    switchTab: "NAVIGATION",
    toggleZenMode: "APPLICATION",
    toggleCommandPalette: "APPLICATION",
    openRoblox: "APPLICATION",
    openSettings: "APPLICATION",
};

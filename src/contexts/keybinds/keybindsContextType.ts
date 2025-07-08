import { createContext } from "react";
import { DEFAULT_KEYBINDS } from "../../constants/core/keybinds";
import type { KeybindsContextType } from "../../types/core/keybinds";

export const KeybindsContext = createContext<KeybindsContextType>({
	keybinds: DEFAULT_KEYBINDS,
	updateKeybind: () => {},
	isCommandPaletteOpen: false,
	toggleCommandPalette: () => {},
	activeScreen: "Editor",
	handleScreenChange: () => {},
	isConsoleOpen: false,
	setIsConsoleOpen: () => {},
	isKeybindEditorOpen: false,
	setIsKeybindEditorOpen: () => {},
	isWorkspaceSearchOpen: false,
	setIsWorkspaceSearchOpen: () => {},
});

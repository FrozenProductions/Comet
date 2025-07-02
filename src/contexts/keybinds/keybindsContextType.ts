import { createContext } from "react";
import type { KeybindsContextType } from "../../types/keybinds";
import { DEFAULT_KEYBINDS } from "../../constants/keybinds";

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
});

import { useContext } from "react";
import { KeybindsContext } from "../contexts/keybinds/keybindsContextType";

export const useKeybinds = () => useContext(KeybindsContext);

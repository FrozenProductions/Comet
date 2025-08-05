import readline from "node:readline";
import { LOG_KEYBINDS, MAIN_KEYBINDS } from "../constants/keybinds.js";
import type { KeybindAction } from "../types/keybinds.js";

export function setupKeyboardListener(
    onAction: (action: KeybindAction) => void,
    isEnabled: () => boolean,
    isLogView = false,
): () => void {
    readline.emitKeypressEvents(process.stdin);
    if (process.stdin.isTTY) {
        process.stdin.setRawMode(true);
    }

    const handleKeypress = (str: string, key: readline.Key) => {
        if (!isEnabled()) return;

        if (key.ctrl && key.name === "c") {
            process.exit(0);
        }

        const keybinds = isLogView ? LOG_KEYBINDS : MAIN_KEYBINDS;
        const keybind = keybinds[str];
        if (keybind) {
            onAction(keybind.action);
        }
    };

    process.stdin.on("keypress", handleKeypress);

    return () => {
        process.stdin.removeListener("keypress", handleKeypress);
        if (process.stdin.isTTY) {
            process.stdin.setRawMode(false);
        }
    };
}

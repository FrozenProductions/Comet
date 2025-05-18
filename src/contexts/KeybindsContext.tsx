import React, { createContext, useContext, useState, useEffect } from "react";
import { useEditor } from "./editorContext";
import { useSettings } from "./settingsContext";
import { useRoblox } from "../hooks/useRoblox";
import { useScript } from "../hooks/useScript";
import { toast } from "react-hot-toast";
import {
    KeybindsContextType,
    Screen,
    Keybind,
    KeybindAction,
} from "../types/keybinds";
import { DEFAULT_KEYBINDS } from "../constants/keybinds";

const KeybindsContext = createContext<KeybindsContextType>({
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

export const useKeybinds = () => useContext(KeybindsContext);

export const KeybindsProvider: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { createTab, closeTab, activeTab, tabs, setActiveTab } = useEditor();
    const { settings, updateSettings } = useSettings();
    const { openRoblox } = useRoblox();
    const { executeScript } = useScript();
    const [activeScreen, setActiveScreen] = useState<Screen>("Editor");
    const [keybinds, setKeybinds] = useState<Keybind[]>(() => {
        const saved = localStorage.getItem("keybinds");
        return saved ? JSON.parse(saved) : DEFAULT_KEYBINDS;
    });
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const [isKeybindEditorOpen, setIsKeybindEditorOpen] = useState(false);

    const numberBuffer = React.useRef("");
    const bufferTimeout = React.useRef<number>();

    const toggleCommandPalette = () => {
        setIsCommandPaletteOpen((prev) => !prev);
    };

    const handleScreenChange = (screen: Screen) => {
        setActiveScreen(screen);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (isKeybindEditorOpen) return;

            if (e.metaKey && !e.shiftKey && !e.altKey && !e.ctrlKey) {
                const num = parseInt(e.key);
                if (!isNaN(num)) {
                    e.preventDefault();

                    if (bufferTimeout.current) {
                        window.clearTimeout(bufferTimeout.current);
                    }

                    numberBuffer.current += num.toString();

                    bufferTimeout.current = window.setTimeout(() => {
                        const targetIndex = parseInt(numberBuffer.current) - 1;
                        if (tabs[targetIndex]) {
                            setActiveTab(tabs[targetIndex].id);
                        }
                        numberBuffer.current = "";
                        bufferTimeout.current = undefined;
                    }, 250);

                    return;
                }
            }

            if (numberBuffer.current) {
                numberBuffer.current = "";
                if (bufferTimeout.current) {
                    window.clearTimeout(bufferTimeout.current);
                }
            }

            const matchingKeybind = keybinds.find((keybind) => {
                const cmdMatch = keybind.modifiers.cmd ? e.metaKey : !e.metaKey;
                const shiftMatch = keybind.modifiers.shift
                    ? e.shiftKey
                    : !e.shiftKey;
                const altMatch = keybind.modifiers.alt ? e.altKey : !e.altKey;
                const ctrlMatch = keybind.modifiers.ctrl
                    ? e.ctrlKey
                    : !e.ctrlKey;
                const keyMatch =
                    e.key.toLowerCase() === keybind.key.toLowerCase();

                return (
                    cmdMatch && shiftMatch && altMatch && ctrlMatch && keyMatch
                );
            });

            if (matchingKeybind) {
                e.preventDefault();
                handleKeybindAction(matchingKeybind);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            if (bufferTimeout.current) {
                window.clearTimeout(bufferTimeout.current);
            }
        };
    }, [
        createTab,
        closeTab,
        activeTab,
        keybinds,
        tabs,
        setActiveTab,
        settings,
        updateSettings,
        executeScript,
        openRoblox,
        isConsoleOpen,
        isKeybindEditorOpen,
    ]);

    const updateKeybind = (
        action: KeybindAction,
        newKeybind: Partial<Keybind>
    ) => {
        setKeybinds((prev) => {
            const updated = prev.map((kb) =>
                kb.action === action
                    ? {
                          ...kb,
                          key: newKeybind.key || kb.key,
                          modifiers: {
                              ...kb.modifiers,
                              ...newKeybind.modifiers,
                          },
                      }
                    : kb
            );
            localStorage.setItem("keybinds", JSON.stringify(updated));
            return updated;
        });
    };

    const handleKeybindAction = (keybind: Keybind) => {
        switch (keybind.action) {
            case "newTab":
                createTab();
                break;
            case "closeTab":
                if (activeTab) {
                    closeTab(activeTab);
                }
                break;
            case "switchTab":
                const targetIndex = keybind.data?.index;
                if (typeof targetIndex === "number" && tabs[targetIndex]) {
                    setActiveTab(tabs[targetIndex].id);
                }
                break;
            case "toggleZenMode":
                updateSettings({
                    interface: {
                        ...settings.interface,
                        zenMode: !settings.interface.zenMode,
                    },
                });
                toast.success(
                    !settings.interface.zenMode
                        ? "Zen mode enabled"
                        : "Zen mode disabled",
                    {
                        id: "zen-mode-toast",
                    }
                );
                break;
            case "toggleCommandPalette":
                toggleCommandPalette();
                break;
            case "executeScript":
                executeScript();
                break;
            case "openRoblox":
                openRoblox();
                break;
            case "openSettings":
                handleScreenChange("Settings");
                break;
            case "toggleConsole":
                setIsConsoleOpen((prev) => !prev);
                break;
        }
    };

    return (
        <KeybindsContext.Provider
            value={{
                keybinds,
                updateKeybind,
                isCommandPaletteOpen,
                toggleCommandPalette,
                activeScreen,
                handleScreenChange,
                isConsoleOpen,
                setIsConsoleOpen,
                isKeybindEditorOpen,
                setIsKeybindEditorOpen,
            }}
        >
            {children}
        </KeybindsContext.Provider>
    );
};

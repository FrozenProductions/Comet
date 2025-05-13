import {
    createContext,
    useContext,
    useEffect,
    FC,
    ReactNode,
    useState,
    useRef,
} from "react";
import { useEditor } from "./EditorContext";
import { useSettings } from "./SettingsContext";
import { useRoblox } from "../hooks/useRoblox";
import { useScript } from "../hooks/useScript";
import { toast } from "react-hot-toast";

type Screen = "Editor" | "Settings" | "Profile" | "Library" | "AutoExecution";

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

export type Keybind = {
    key: string;
    modifiers: {
        cmd?: boolean;
        shift?: boolean;
        alt?: boolean;
        ctrl?: boolean;
    };
    action: KeybindAction;
    description: string;
    data?: any;
};

type KeybindsContextType = {
    keybinds: Keybind[];
    updateKeybind: (
        action: KeybindAction,
        newKeybind: Partial<Keybind>
    ) => void;
    isCommandPaletteOpen: boolean;
    toggleCommandPalette: () => void;
    activeScreen: Screen;
    handleScreenChange: (screen: Screen) => void;
};

const defaultKeybinds: Keybind[] = [
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
];

for (let i = 1; i <= 20; i++) {
    defaultKeybinds.push({
        key: i.toString(),
        modifiers: { cmd: true },
        action: "switchTab",
        description: `Switch to tab ${i}`,
        data: { index: i - 1 },
    });
}

const KeybindsContext = createContext<KeybindsContextType>({
    keybinds: defaultKeybinds,
    updateKeybind: () => {},
    isCommandPaletteOpen: false,
    toggleCommandPalette: () => {},
    activeScreen: "Editor",
    handleScreenChange: () => {},
});

export const useKeybinds = () => useContext(KeybindsContext);

export const KeybindsProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { createTab, closeTab, activeTab, tabs, setActiveTab } = useEditor();
    const { settings, updateSettings } = useSettings();
    const { openRoblox } = useRoblox();
    const { executeScript } = useScript();
    const [activeScreen, setActiveScreen] = useState<Screen>("Editor");
    const [keybinds, setKeybinds] = useState<Keybind[]>(() => {
        const saved = localStorage.getItem("keybinds");
        return saved ? JSON.parse(saved) : defaultKeybinds;
    });
    const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

    const numberBuffer = useRef("");
    const bufferTimeout = useRef<number>();

    const toggleCommandPalette = () => {
        setIsCommandPaletteOpen((prev) => !prev);
    };

    const handleScreenChange = (screen: Screen) => {
        setActiveScreen(screen);
    };

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
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

                switch (matchingKeybind.action) {
                    case "newTab":
                        createTab();
                        break;
                    case "closeTab":
                        if (activeTab) {
                            closeTab(activeTab);
                        }
                        break;
                    case "switchTab":
                        const targetIndex = matchingKeybind.data?.index;
                        if (
                            typeof targetIndex === "number" &&
                            tabs[targetIndex]
                        ) {
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
                }
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

    return (
        <KeybindsContext.Provider
            value={{
                keybinds,
                updateKeybind,
                isCommandPaletteOpen,
                toggleCommandPalette,
                activeScreen,
                handleScreenChange,
            }}
        >
            {children}
        </KeybindsContext.Provider>
    );
};

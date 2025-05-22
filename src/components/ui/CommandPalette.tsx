import { FC, useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Command,
    Plus,
    Layout,
    FileCode,
    Play,
    ExternalLink,
    Flag,
    Terminal,
    Maximize2,
} from "lucide-react";
import { useEditor } from "../../hooks/useEditor";
import { useSettings } from "../../hooks/useSettings";
import { useRoblox } from "../../hooks/useRoblox";
import { useScript } from "../../hooks/useScript";
import { useFastFlags } from "../../hooks/useFastFlags";
import { CommandItem, CommandPaletteProps } from "../../types/commandPalette";
import { toast } from "react-hot-toast";
import { useConsoleVisibility } from "../../hooks/useConsoleVisibility";

export const CommandPalette: FC<CommandPaletteProps> = ({
    isOpen,
    onClose,
    onFloatToggle,
}) => {
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [isCmdPressed, setIsCmdPressed] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);
    const resultsContainerRef = useRef<HTMLDivElement>(null);
    const { createTab, setActiveTab, tabs, activeTab } = useEditor();
    const { settings, updateSettings } = useSettings();
    const { openRoblox } = useRoblox();
    const { executeScript } = useScript();
    const {
        state: { profiles, activeProfileId },
        activateProfile,
        deactivateProfile,
    } = useFastFlags();
    const { toggleConsoleVisibility } = useConsoleVisibility();

    const executeCommand = (action: () => any) => async () => {
        await Promise.resolve(action());
        setSearchQuery("");
        onClose();
    };

    const handleClearFlags = async () => {
        try {
            await deactivateProfile();
            toast.success("Fast flags cleared");
        } catch (error) {
            console.error("Failed to clear fast flags:", error);
            toast.error("Failed to clear fast flags");
        }
    };

    const commands: CommandItem[] = [
        {
            id: "new-tab",
            title: "New Tab",
            description: "Create a new editor tab",
            icon: <Plus size={16} className="stroke-[2.5]" />,
            action: executeCommand(() => createTab()),
        },
        {
            id: "toggle-zen",
            title: "Toggle Zen Mode",
            description: settings.interface.zenMode
                ? "Disable Zen Mode"
                : "Enable Zen Mode",
            icon: <Layout size={16} className="stroke-[2.5]" />,
            action: executeCommand(() => {
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
                    },
                );
            }),
        },
        {
            id: "toggle-console",
            title: "Toggle Console",
            description: settings.interface.showConsole
                ? "Hide Console"
                : "Show Console",
            icon: <Terminal size={16} className="stroke-[2.5]" />,
            action: executeCommand(toggleConsoleVisibility),
        },
        {
            id: "toggle-console-mode",
            title: "Toggle Console Mode",
            description: "Switch between docked and floating console",
            icon: <Maximize2 size={16} className="stroke-[2.5]" />,
            action: executeCommand(() => {
                if (settings.interface.showConsole) {
                    onFloatToggle();
                } else {
                    toast.error("Console is currently hidden");
                }
            }),
        },
        {
            id: "execute-script",
            title: "Execute Script",
            description: "Execute the current tab's script",
            icon: <Play size={16} className="stroke-[2.5]" />,
            action: executeCommand(async () => {
                const activeTabData = tabs.find((tab) => tab.id === activeTab);
                if (!activeTabData) {
                    toast.error("No active tab to execute");
                    return;
                }
                if (!activeTabData.content.trim()) {
                    toast.error("Cannot execute empty script");
                    return;
                }
                await executeScript();
            }),
        },
        {
            id: "open-roblox",
            title: "Open Roblox",
            description: "Open Roblox",
            icon: <ExternalLink size={16} className="stroke-[2.5]" />,
            action: executeCommand(() => openRoblox()),
        },
        {
            id: "fast-flags",
            title: "Fast Flags",
            description: activeProfileId
                ? `Current: ${
                      profiles.find((p) => p.id === activeProfileId)?.name ||
                      "None"
                  }`
                : "Switch fast flags profile",
            icon: (
                <Flag
                    size={16}
                    className={`stroke-[2.5] ${
                        activeProfileId ? "text-accent" : ""
                    }`}
                />
            ),
            action: () => {
                setSearchQuery(">flags ");
                if (inputRef.current) {
                    const len = inputRef.current.value.length;
                    inputRef.current.focus();
                    inputRef.current.setSelectionRange(len, len);
                }
            },
        },
    ];

    const getFilteredItems = () => {
        if (!searchQuery.startsWith(">") && !searchQuery.startsWith("/")) {
            return tabs
                .filter((tab) => {
                    const query = searchQuery.toLowerCase().trim();
                    if (!query) return true;
                    return tab.title.toLowerCase().includes(query);
                })
                .map((tab) => ({
                    id: tab.id,
                    title: tab.title,
                    description: `Switch to ${tab.title}`,
                    icon: <FileCode size={16} className="stroke-[2.5]" />,
                    action: executeCommand(() => setActiveTab(tab.id)),
                }));
        }

        const query = searchQuery.slice(1).toLowerCase().trim();
        const parts = query.split(" ");
        const command = parts[0];
        const param = parts.slice(1).join(" ");

        if (command === "flags" || command === "f") {
            if (!param) {
                return [
                    {
                        id: "fast-flags-none",
                        title: "None",
                        description: "Clear all fast flags",
                        icon: <Flag size={16} className="stroke-[2.5]" />,
                        action: executeCommand(handleClearFlags),
                    },
                    ...profiles.map((profile) => ({
                        id: `fast-flags-${profile.id}`,
                        title: profile.name,
                        description: `${
                            activeProfileId === profile.id
                                ? "Current profile"
                                : "Switch to this profile"
                        }`,
                        icon: (
                            <Flag
                                size={16}
                                className={`stroke-[2.5] ${
                                    activeProfileId === profile.id
                                        ? "text-accent"
                                        : ""
                                }`}
                            />
                        ),
                        action: executeCommand(async () => {
                            try {
                                await activateProfile(profile.id);
                                toast.success(
                                    `Activated profile: ${profile.name}`,
                                );
                            } catch (error) {
                                console.error(
                                    "Failed to activate profile:",
                                    error,
                                );
                                toast.error("Failed to activate profile");
                            }
                        }),
                    })),
                ];
            }

            if (
                param.toLowerCase() === "none" ||
                param.toLowerCase() === "clear"
            ) {
                return [
                    {
                        id: "fast-flags-none",
                        title: "Clear Fast Flags",
                        description: "Remove all fast flags",
                        icon: <Flag size={16} className="stroke-[2.5]" />,
                        action: handleClearFlags,
                    },
                ];
            }

            const matchingProfiles = profiles.filter((profile) =>
                profile.name.toLowerCase().includes(param),
            );

            if (matchingProfiles.length === 0) {
                return [
                    {
                        id: "fast-flags-no-match",
                        title: "No matching profiles",
                        description: `No profiles found matching "${param}"`,
                        icon: <Flag size={16} className="stroke-[2.5]" />,
                        action: () => {},
                    },
                ];
            }

            return matchingProfiles.map((profile) => ({
                id: `fast-flags-${profile.id}`,
                title: profile.name,
                description: `${
                    activeProfileId === profile.id
                        ? "Current profile"
                        : "Switch to this profile"
                }`,
                icon: (
                    <Flag
                        size={16}
                        className={`stroke-[2.5] ${
                            activeProfileId === profile.id ? "text-accent" : ""
                        }`}
                    />
                ),
                action: async () => {
                    try {
                        await activateProfile(profile.id);
                        toast.success(`Activated profile: ${profile.name}`);
                    } catch (error) {
                        console.error("Failed to activate profile:", error);
                        toast.error("Failed to activate profile");
                    }
                },
            }));
        }

        return commands.filter((command) => {
            if (!query) return true;
            return (
                command.title.toLowerCase().includes(query) ||
                command.description.toLowerCase().includes(query)
            );
        });
    };

    const filteredItems = getFilteredItems();

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    useEffect(() => {
        setSelectedIndex(0);
    }, [searchQuery]);

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (!isOpen) return;

            if (e.key === "Meta") {
                setIsCmdPressed(true);
                return;
            }

            switch (e.key) {
                case "Escape":
                    onClose();
                    break;
                case "ArrowDown":
                    e.preventDefault();
                    setSelectedIndex((prev) => {
                        const newIndex =
                            prev < filteredItems.length - 1 ? prev + 1 : prev;
                        const container = resultsContainerRef.current;
                        if (container) {
                            const items =
                                container.getElementsByTagName("button");
                            const selectedItem = items[newIndex];
                            if (selectedItem) {
                                selectedItem.scrollIntoView({
                                    block: "nearest",
                                });
                            }
                        }
                        return newIndex;
                    });
                    break;
                case "ArrowUp":
                    e.preventDefault();
                    setSelectedIndex((prev) => {
                        const newIndex = prev > 0 ? prev - 1 : prev;
                        const container = resultsContainerRef.current;
                        if (container) {
                            const items =
                                container.getElementsByTagName("button");
                            const selectedItem = items[newIndex];
                            if (selectedItem) {
                                selectedItem.scrollIntoView({
                                    block: "nearest",
                                });
                            }
                        }
                        return newIndex;
                    });
                    break;
                case "Enter":
                    e.preventDefault();
                    if (filteredItems[selectedIndex]) {
                        filteredItems[selectedIndex].action();
                    }
                    break;
            }
        };

        const handleKeyUp = (e: KeyboardEvent) => {
            if (e.key === "Meta") {
                setIsCmdPressed(false);
            }
        };

        window.addEventListener("keydown", handleKeyDown);
        window.addEventListener("keyup", handleKeyUp);
        return () => {
            window.removeEventListener("keydown", handleKeyDown);
            window.removeEventListener("keyup", handleKeyUp);
        };
    }, [isOpen, onClose, filteredItems, selectedIndex]);

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/50"
                        onClick={onClose}
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -20 }}
                        transition={{
                            type: "spring",
                            stiffness: 300,
                            damping: 30,
                        }}
                        className="fixed inset-x-0 top-[20%] z-50 flex items-start justify-center"
                    >
                        <div className="mx-auto w-full max-w-xl px-4">
                            <div className="select-none overflow-hidden rounded-xl border border-white/5 bg-ctp-mantle shadow-2xl">
                                <div className="flex items-center gap-3 border-b border-white/5 p-4">
                                    <Command
                                        size={20}
                                        className="text-white/50"
                                    />
                                    <input
                                        ref={inputRef}
                                        type="text"
                                        value={searchQuery}
                                        onChange={(e) =>
                                            setSearchQuery(e.target.value)
                                        }
                                        placeholder={
                                            searchQuery.startsWith(">") ||
                                            searchQuery.startsWith("/")
                                                ? "Type a command..."
                                                : "Search tabs or type > for commands..."
                                        }
                                        className="flex-1 border-none bg-transparent text-sm text-ctp-text outline-none placeholder:text-ctp-subtext0"
                                        autoComplete="off"
                                        spellCheck="false"
                                    />
                                    <div className="flex select-none items-center gap-1">
                                        <kbd className="rounded bg-white/5 px-2 py-1 text-xs font-medium text-ctp-subtext0">
                                            esc
                                        </kbd>
                                        <span className="text-xs text-ctp-subtext0">
                                            to close
                                        </span>
                                    </div>
                                </div>

                                <div className="max-h-[60vh] overflow-y-auto">
                                    {filteredItems.length === 0 ? (
                                        <div className="p-2">
                                            <div className="select-none px-2 py-1.5 text-xs text-ctp-subtext0">
                                                {searchQuery.startsWith(">") ||
                                                searchQuery.startsWith("/")
                                                    ? "No commands found"
                                                    : "No matching tabs found"}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="p-2">
                                            <div
                                                ref={resultsContainerRef}
                                                className="max-h-[calc(6*2.75rem)] overflow-y-auto"
                                            >
                                                {filteredItems.map(
                                                    (item, index) => (
                                                        <motion.button
                                                            key={item.id}
                                                            initial={{
                                                                opacity: 0,
                                                                y: 10,
                                                            }}
                                                            animate={{
                                                                opacity: 1,
                                                                y: 0,
                                                            }}
                                                            transition={{
                                                                delay:
                                                                    index *
                                                                    0.03,
                                                            }}
                                                            className={`flex w-full select-none items-center gap-3 rounded-lg px-2 py-2 text-left ${
                                                                selectedIndex ===
                                                                index
                                                                    ? "bg-white/10 text-white"
                                                                    : "text-ctp-subtext0 hover:bg-white/5 hover:text-white"
                                                            } `}
                                                            onClick={() => {
                                                                item.action();
                                                                onClose();
                                                            }}
                                                        >
                                                            <div className="flex h-5 w-5 items-center justify-center text-white/50">
                                                                {item.icon}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="truncate text-sm font-medium">
                                                                    {item.title}
                                                                </div>
                                                                <div className="truncate text-xs opacity-50">
                                                                    {
                                                                        item.description
                                                                    }
                                                                </div>
                                                            </div>
                                                            {selectedIndex ===
                                                                index && (
                                                                <div className="flex select-none items-center gap-1 text-xs">
                                                                    <kbd className="rounded bg-white/5 px-2 py-1">
                                                                        {!searchQuery.startsWith(
                                                                            ">",
                                                                        ) &&
                                                                        !searchQuery.startsWith(
                                                                            "/",
                                                                        ) &&
                                                                        isCmdPressed
                                                                            ? "⌘ + enter"
                                                                            : "enter"}
                                                                    </kbd>
                                                                    <span>
                                                                        {!searchQuery.startsWith(
                                                                            ">",
                                                                        ) &&
                                                                        !searchQuery.startsWith(
                                                                            "/",
                                                                        )
                                                                            ? isCmdPressed
                                                                                ? "to execute"
                                                                                : "to open"
                                                                            : "to run"}
                                                                    </span>
                                                                </div>
                                                            )}
                                                        </motion.button>
                                                    ),
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};

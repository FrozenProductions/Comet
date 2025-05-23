import { FC, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
    Code2,
    ChevronRight,
    Search,
    Keyboard,
    Settings as SettingsIcon,
    Github,
    Globe,
    Book,
    Settings2,
    RotateCcw,
    Folder,
    AlertTriangle,
    Download,
    RefreshCw,
} from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Slider } from "../ui/slider";
import { RadioGroup } from "../ui/radioGroup";
import { useSettings } from "../../hooks/useSettings";
import { useKeybinds } from "../../hooks/useKeybinds";
import { KeybindEditor } from "./keybindEditor";
import type { SettingsKey } from "../../types/settings";
import type { Keybind, KeybindAction } from "../../types/keybinds";
import { toast } from "react-hot-toast";
import { SETTINGS_SECTIONS } from "../../constants/settings";
import { Header } from "../ui/header";
import { Modal } from "../ui/modal";
import {
    KEYBIND_CATEGORIES,
    KEYBIND_CATEGORY_MAPPING,
} from "../../constants/keybinds";
import { invoke } from "@tauri-apps/api/tauri";
import { TechStackItem } from "./techStackItem";

const getKeybindTitle = (action: KeybindAction): string => {
    switch (action) {
        case "newTab":
            return "New Tab";
        case "closeTab":
            return "Close Tab";
        case "executeScript":
            return "Execute Script";
        case "toggleZenMode":
            return "Toggle Zen Mode";
        case "toggleCommandPalette":
            return "Command Palette";
        case "openRoblox":
            return "Open Roblox";
        case "openSettings":
            return "Open Settings";
        case "nextTab":
            return "Next Tab";
        case "previousTab":
            return "Previous Tab";
        case "switchTab":
            return "Switch to Tab";
        case "collapseConsole":
            return "Expand/Collapse Console";
        case "toggleConsole":
            return "Show/Hide Console";
        case "openEditor":
            return "Switch to Editor";
        case "openFastFlags":
            return "Switch to Fast Flags";
        case "openLibrary":
            return "Switch to Library";
        case "openAutoExecution":
            return "Switch to Auto Execution";
        default:
            return action;
    }
};

const KeybindSection: FC<{
    category: string;
    keybinds: Keybind[];
    onEditKeybind: (keybind: Keybind) => void;
}> = ({ category, keybinds, onEditKeybind }) => (
    <div className="space-y-4 rounded-xl bg-ctp-mantle p-4">
        <div className="flex items-start justify-between border-b border-ctp-surface0 pb-2">
            <div className="min-w-0 flex-1">
                <div className="truncate text-sm font-medium text-ctp-text">
                    {category}
                </div>
                <div className="select-none text-xs text-ctp-subtext0">
                    {category} keyboard shortcuts
                </div>
            </div>
        </div>
        <div className="space-y-3">
            {keybinds.map((keybind) => (
                <div
                    key={keybind.action}
                    className="flex items-center justify-between py-1.5"
                >
                    <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-ctp-text">
                            {getKeybindTitle(keybind.action)}
                        </div>
                        <div className="select-none text-xs text-ctp-subtext0">
                            {keybind.description}
                        </div>
                    </div>
                    <button
                        className="rounded bg-ctp-surface0 px-2 py-1 text-xs font-medium text-ctp-subtext0 transition-colors hover:bg-ctp-surface1"
                        onClick={() => onEditKeybind(keybind)}
                    >
                        {[
                            keybind.modifiers.cmd && "⌘",
                            keybind.modifiers.shift && "⇧",
                            keybind.modifiers.alt && "⌥",
                            keybind.modifiers.ctrl && "⌃",
                            keybind.key.toUpperCase(),
                        ]
                            .filter(Boolean)
                            .join(" ")}
                    </button>
                </div>
            ))}
        </div>
    </div>
);

export const Settings: FC = () => {
    const { settings, updateSettings } = useSettings();
    const { keybinds, updateKeybind } = useKeybinds();
    const [activeSection, setActiveSection] = useState("editor");
    const [searchQuery, setSearchQuery] = useState("");
    const [editingKeybind, setEditingKeybind] = useState<Keybind | null>(null);
    const [showZenModeConfirm, setShowZenModeConfirm] = useState(false);
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [updateCheck, setUpdateCheck] = useState<{
        loading: boolean;
        version: string | null;
        isNightly: boolean;
        hasChecked: boolean;
    }>({
        loading: false,
        version: null,
        isNightly: false,
        hasChecked: false,
    });

    const handleSliderChange = useCallback(
        (key: SettingsKey, subKey: string, value: number) => {
            const currentSettings = settings[key] as Record<string, unknown>;
            updateSettings({
                [key]: {
                    ...currentSettings,
                    [subKey]: value,
                },
            });
        },
        [settings, updateSettings],
    );

    const SettingGroup: FC<{
        title: string;
        description?: string;
        info?: string;
        children: React.ReactNode;
    }> = ({ title, description, children }) => (
        <div className="space-y-4 rounded-xl bg-ctp-mantle p-4">
            <div className="flex items-start justify-between border-b border-ctp-surface0 pb-2">
                <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-medium text-ctp-text">
                        {title}
                    </div>
                    {description && (
                        <div className="select-none text-xs text-ctp-subtext0">
                            {description}
                        </div>
                    )}
                </div>
            </div>
            <div className="space-y-3">{children}</div>
        </div>
    );

    const handleZenModeToggle = () => {
        if (!settings.interface.zenMode) {
            setShowZenModeConfirm(true);
        } else {
            updateSettings({
                interface: {
                    ...settings.interface,
                    zenMode: false,
                },
            });
            toast.success("Zen mode disabled", {
                id: "zen-mode-toast",
            });
        }
    };

    const confirmZenMode = () => {
        updateSettings({
            interface: {
                ...settings.interface,
                zenMode: true,
            },
        });
        setShowZenModeConfirm(false);
        toast.success("Zen mode enabled", {
            id: "zen-mode-toast",
        });
    };

    const renderSectionContent = () => {
        switch (activeSection) {
            case "editor":
                return (
                    <>
                        <div className="mb-4 space-y-2">
                            <h2 className="flex items-center gap-2 text-xl font-medium text-ctp-text">
                                <Code2 size={20} className="text-accent" />
                                Editor Settings
                            </h2>
                            <p className="-mt-1 select-none text-sm text-ctp-subtext0">
                                Customize your code editor preferences and
                                behavior
                            </p>
                        </div>

                        <div className="space-y-6">
                            <SettingGroup
                                title="Display"
                                description="Visual editor preferences"
                                info="These settings affect how code is displayed in the editor"
                            >
                                <Checkbox
                                    checked={settings.display.showLineNumbers}
                                    onChange={() => {
                                        updateSettings({
                                            display: {
                                                ...settings.display,
                                                showLineNumbers:
                                                    !settings.display
                                                        .showLineNumbers,
                                            },
                                        });
                                    }}
                                    label="Show line numbers"
                                    description="Display line numbers in the gutter"
                                />
                                <Checkbox
                                    checked={settings.display.wordWrap}
                                    onChange={() => {
                                        updateSettings({
                                            display: {
                                                ...settings.display,
                                                wordWrap:
                                                    !settings.display.wordWrap,
                                            },
                                        });
                                    }}
                                    label="Word wrap"
                                    description="Wrap long lines to fit editor width"
                                />
                            </SettingGroup>

                            <SettingGroup
                                title="Text"
                                description="Font and spacing preferences"
                                info="Customize how text appears in the editor"
                            >
                                <Slider
                                    value={settings.text.fontSize}
                                    onChange={(value) =>
                                        handleSliderChange(
                                            "text",
                                            "fontSize",
                                            value,
                                        )
                                    }
                                    min={8}
                                    max={32}
                                    label="Font size"
                                    description="Adjust the editor font size"
                                    unit="px"
                                />
                                <Slider
                                    value={settings.text.tabSize}
                                    onChange={(value) =>
                                        handleSliderChange(
                                            "text",
                                            "tabSize",
                                            value,
                                        )
                                    }
                                    min={2}
                                    max={8}
                                    label="Tab size"
                                    description="Number of spaces for indentation"
                                    unit=" spaces"
                                />
                                <Slider
                                    value={settings.text.lineHeight}
                                    onChange={(value) =>
                                        handleSliderChange(
                                            "text",
                                            "lineHeight",
                                            value,
                                        )
                                    }
                                    min={1}
                                    max={2}
                                    step={0.1}
                                    label="Line height"
                                    description="Space between lines"
                                    unit="x"
                                />
                            </SettingGroup>

                            <SettingGroup
                                title="Cursor"
                                description="Cursor appearance and behavior"
                                info="Customize how the cursor looks and behaves"
                            >
                                <RadioGroup
                                    value={settings.cursor.style}
                                    onChange={(value) => {
                                        updateSettings({
                                            cursor: {
                                                ...settings.cursor,
                                                style: value,
                                            },
                                        });
                                    }}
                                    options={[
                                        { value: "line", label: "Line" },
                                        { value: "block", label: "Block" },
                                        {
                                            value: "underline",
                                            label: "Underline",
                                        },
                                    ]}
                                    label="Cursor Style"
                                    description="Choose how the cursor appears"
                                />
                                <RadioGroup
                                    value={settings.cursor.blinking}
                                    onChange={(value) => {
                                        updateSettings({
                                            cursor: {
                                                ...settings.cursor,
                                                blinking: value,
                                            },
                                        });
                                    }}
                                    options={[
                                        { value: "blink", label: "Blink" },
                                        { value: "smooth", label: "Smooth" },
                                        { value: "phase", label: "Phase" },
                                        { value: "expand", label: "Expand" },
                                        { value: "solid", label: "Solid" },
                                    ]}
                                    label="Cursor Animation"
                                    description="Choose how the cursor animates"
                                />
                                <Checkbox
                                    checked={settings.cursor.smoothCaret}
                                    onChange={() => {
                                        updateSettings({
                                            cursor: {
                                                ...settings.cursor,
                                                smoothCaret:
                                                    !settings.cursor
                                                        .smoothCaret,
                                            },
                                        });
                                    }}
                                    label="Smooth Caret Movement"
                                    description="Enable smooth cursor animations when moving"
                                />
                            </SettingGroup>

                            <SettingGroup
                                title="IntelliSense"
                                description="Code completion and suggestions"
                                info="Configure how code suggestions appear in the editor"
                            >
                                <Checkbox
                                    checked={settings.intellisense.enabled}
                                    onChange={() => {
                                        updateSettings({
                                            intellisense: {
                                                ...settings.intellisense,
                                                enabled:
                                                    !settings.intellisense
                                                        .enabled,
                                            },
                                        });
                                    }}
                                    label="Enable IntelliSense"
                                    description="Show code suggestions while typing"
                                />
                                <RadioGroup
                                    value={
                                        settings.intellisense
                                            .acceptSuggestionKey
                                    }
                                    onChange={(value) => {
                                        updateSettings({
                                            intellisense: {
                                                ...settings.intellisense,
                                                acceptSuggestionKey: value as
                                                    | "Tab"
                                                    | "Enter",
                                            },
                                        });
                                    }}
                                    options={[
                                        { value: "Tab", label: "Tab" },
                                        { value: "Enter", label: "Enter" },
                                    ]}
                                    label="Accept Suggestion Key"
                                    description="Choose which key accepts the selected suggestion"
                                />
                                <Slider
                                    value={settings.intellisense.maxSuggestions}
                                    onChange={(value) =>
                                        handleSliderChange(
                                            "intellisense",
                                            "maxSuggestions",
                                            value,
                                        )
                                    }
                                    min={5}
                                    max={10}
                                    label="Maximum suggestions"
                                    description="Number of suggestions to show at once"
                                />
                            </SettingGroup>
                        </div>
                    </>
                );
            case "interface":
                return (
                    <>
                        <div className="mb-4 space-y-2">
                            <h2 className="flex items-center gap-2 text-xl font-medium text-ctp-text">
                                <SettingsIcon
                                    size={20}
                                    className="text-accent"
                                />
                                Interface Settings
                            </h2>
                            <p className="-mt-1 select-none text-sm text-ctp-subtext0">
                                Customize the application interface and
                                appearance
                            </p>
                        </div>

                        <div className="space-y-6">
                            <SettingGroup
                                title="Layout"
                                description="Interface layout preferences"
                            >
                                <Checkbox
                                    checked={settings.interface.zenMode}
                                    onChange={handleZenModeToggle}
                                    label="Zen Mode"
                                    description="Hide sidebar and tab bar for distraction-free coding"
                                />
                                <Checkbox
                                    checked={settings.interface.showConsole}
                                    onChange={() => {
                                        updateSettings({
                                            interface: {
                                                ...settings.interface,
                                                showConsole:
                                                    !settings.interface
                                                        .showConsole,
                                            },
                                        });
                                    }}
                                    label="Show Console"
                                    description="Display the Roblox console for logs and monitoring"
                                />
                            </SettingGroup>

                            <SettingGroup
                                title="Appearance"
                                description="Visual interface preferences"
                            >
                                <Checkbox
                                    checked={settings.interface.showTabBar}
                                    onChange={() => {
                                        updateSettings({
                                            interface: {
                                                ...settings.interface,
                                                showTabBar:
                                                    !settings.interface
                                                        .showTabBar,
                                            },
                                        });
                                    }}
                                    label="Compact Tab Bar"
                                    description="Show only the current file name in a compact view"
                                />
                            </SettingGroup>
                        </div>

                        <Modal
                            isOpen={showZenModeConfirm}
                            onClose={() => setShowZenModeConfirm(false)}
                            title="Enable Zen Mode"
                            description="Zen Mode will hide the sidebar and tab bar for a distraction-free coding experience. You can toggle it back using the command palette (⌘+P) or keyboard shortcut (⌘+⇧+K)."
                            onConfirm={confirmZenMode}
                            confirmText="Enable"
                        />
                    </>
                );
            case "keybinds":
                const categorizedKeybinds = keybinds.reduce<
                    Record<string, Keybind[]>
                >((acc, keybind) => {
                    if (keybind.action === "switchTab") return acc;
                    const category =
                        KEYBIND_CATEGORIES[
                            KEYBIND_CATEGORY_MAPPING[keybind.action]
                        ];
                    if (!acc[category]) acc[category] = [];
                    acc[category].push(keybind);
                    return acc;
                }, {});

                return (
                    <>
                        <div className="mb-4 space-y-2">
                            <h2 className="flex items-center gap-2 text-xl font-medium text-ctp-text">
                                <Keyboard size={20} className="text-accent" />
                                Keyboard Shortcuts
                            </h2>
                            <p className="-mt-1 select-none text-sm text-ctp-subtext0">
                                Customize keyboard shortcuts for various actions
                            </p>
                        </div>

                        <div className="space-y-6">
                            {Object.entries(categorizedKeybinds).map(
                                ([category, categoryKeybinds]) => (
                                    <KeybindSection
                                        key={category}
                                        category={category}
                                        keybinds={categoryKeybinds}
                                        onEditKeybind={setEditingKeybind}
                                    />
                                ),
                            )}
                        </div>

                        <AnimatePresence>
                            {editingKeybind && (
                                <KeybindEditor
                                    keybind={editingKeybind}
                                    isOpen={true}
                                    onClose={() => setEditingKeybind(null)}
                                    onSave={(action, updates) => {
                                        updateKeybind(action, updates);
                                        setEditingKeybind(null);
                                        toast.success(
                                            "Keybind updated successfully",
                                        );
                                    }}
                                />
                            )}
                        </AnimatePresence>
                    </>
                );
            case "application":
                return (
                    <>
                        <div className="mb-6 space-y-2">
                            <h2 className="flex items-center gap-2 text-xl font-medium text-ctp-text">
                                <Settings2 size={20} className="text-accent" />
                                Application Settings
                            </h2>
                            <p className="-mt-1 select-none text-sm text-ctp-subtext0">
                                Manage application settings and view information
                            </p>
                        </div>

                        <div className="space-y-8">
                            <SettingGroup
                                title="Application"
                                description="Application details"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg bg-ctp-surface0/50 p-4">
                                        <div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-ctp-text">
                                                    Version
                                                </div>
                                                <div className="select-none text-xs text-ctp-subtext0">
                                                    1.0.3-Public
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <a
                                                href="https://github.com/FrozenProductions/Comet"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
                                            >
                                                <Github
                                                    size={12}
                                                    className="stroke-[2.5]"
                                                />
                                                GitHub
                                            </a>
                                            <button
                                                disabled
                                                className="flex cursor-not-allowed items-center gap-1.5 rounded-md bg-accent/50 px-3 py-1.5 text-xs font-medium text-ctp-base/70"
                                            >
                                                <Globe
                                                    size={12}
                                                    className="stroke-[2.5]"
                                                />
                                                Website
                                            </button>
                                            <a
                                                href="https://github.com/FrozenProductions/Comet/blob/main/docs/documentation.md"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
                                            >
                                                <Book
                                                    size={12}
                                                    className="stroke-[2.5]"
                                                />
                                                Docs
                                            </a>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-4 rounded-lg bg-ctp-surface0/50 p-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1.5">
                                                <div className="flex items-center gap-2">
                                                    <div className="flex h-6 w-6 items-center justify-center rounded bg-accent/10">
                                                        <RefreshCw
                                                            size={14}
                                                            className="text-accent"
                                                        />
                                                    </div>
                                                    <div className="text-sm font-medium text-ctp-text">
                                                        Software Update
                                                    </div>
                                                </div>
                                                <div className="select-none text-xs text-ctp-subtext0">
                                                    Check if a new version of
                                                    Comet is available
                                                </div>
                                            </div>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        setUpdateCheck(
                                                            (prev) => ({
                                                                ...prev,
                                                                loading: true,
                                                                hasChecked:
                                                                    true,
                                                            }),
                                                        );
                                                        const newVersion =
                                                            await invoke<
                                                                string | null
                                                            >(
                                                                "check_for_updates",
                                                                {
                                                                    checkNightly:
                                                                        settings
                                                                            .interface
                                                                            .nightlyReleases ??
                                                                        false,
                                                                },
                                                            );

                                                        if (newVersion) {
                                                            const isNightly =
                                                                newVersion.includes(
                                                                    "-",
                                                                );
                                                            setUpdateCheck({
                                                                loading: false,
                                                                version:
                                                                    newVersion,
                                                                isNightly,
                                                                hasChecked:
                                                                    true,
                                                            });
                                                        } else {
                                                            setUpdateCheck({
                                                                loading: false,
                                                                version: null,
                                                                isNightly:
                                                                    false,
                                                                hasChecked:
                                                                    true,
                                                            });
                                                        }
                                                    } catch (error) {
                                                        console.error(
                                                            "Failed to check for updates:",
                                                            error,
                                                        );
                                                        setUpdateCheck({
                                                            loading: false,
                                                            version: null,
                                                            isNightly: false,
                                                            hasChecked: true,
                                                        });
                                                        toast.error(
                                                            "Failed to check for updates",
                                                        );
                                                    }
                                                }}
                                                disabled={updateCheck.loading}
                                                className="flex items-center gap-1.5 rounded-md border border-white/5 bg-white/5 px-3 py-1.5 text-xs font-medium text-ctp-text transition-all hover:border-accent/20 hover:bg-accent/5 hover:text-accent disabled:cursor-not-allowed disabled:opacity-50"
                                            >
                                                <RefreshCw
                                                    size={12}
                                                    className={`stroke-[2.5] transition-transform ${updateCheck.loading ? "animate-spin" : ""}`}
                                                />
                                                {updateCheck.loading
                                                    ? "Checking..."
                                                    : "Check for Updates"}
                                            </button>
                                        </div>

                                        <AnimatePresence mode="wait">
                                            {updateCheck.hasChecked &&
                                                !updateCheck.loading && (
                                                    <motion.div
                                                        initial={{
                                                            opacity: 0,
                                                            y: -10,
                                                        }}
                                                        animate={{
                                                            opacity: 1,
                                                            y: 0,
                                                        }}
                                                        exit={{
                                                            opacity: 0,
                                                            y: 10,
                                                        }}
                                                        transition={{
                                                            duration: 0.2,
                                                        }}
                                                        className={`relative overflow-hidden rounded-md border px-4 py-3 ${
                                                            updateCheck.version
                                                                ? updateCheck.isNightly
                                                                    ? "border-ctp-red/20 bg-gradient-to-r from-ctp-red/5 to-transparent"
                                                                    : "border-accent/20 bg-gradient-to-r from-accent/5 to-transparent"
                                                                : "border-ctp-green/20 bg-gradient-to-r from-ctp-green/5 to-transparent"
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${
                                                                    updateCheck.version
                                                                        ? updateCheck.isNightly
                                                                            ? "bg-ctp-red/10"
                                                                            : "bg-accent/10"
                                                                        : "bg-ctp-green/10"
                                                                }`}
                                                            >
                                                                {updateCheck.version ? (
                                                                    updateCheck.isNightly ? (
                                                                        <AlertTriangle
                                                                            size={
                                                                                12
                                                                            }
                                                                            className="text-ctp-red"
                                                                        />
                                                                    ) : (
                                                                        <Download
                                                                            size={
                                                                                12
                                                                            }
                                                                            className="text-accent"
                                                                        />
                                                                    )
                                                                ) : (
                                                                    <div className="h-2 w-2 rounded-full bg-ctp-green" />
                                                                )}
                                                            </div>
                                                            <div className="space-y-1">
                                                                <div className="flex items-center gap-2">
                                                                    <div
                                                                        className={`font-medium ${updateCheck.version ? (updateCheck.isNightly ? "text-ctp-red" : "text-accent") : ""}`}
                                                                    >
                                                                        {updateCheck.version ? (
                                                                            <>
                                                                                {updateCheck.isNightly
                                                                                    ? "Preview"
                                                                                    : "Update"}{" "}
                                                                                {
                                                                                    updateCheck.version
                                                                                }{" "}
                                                                                available
                                                                            </>
                                                                        ) : (
                                                                            "You're up to date!"
                                                                        )}
                                                                    </div>
                                                                    {updateCheck.version && (
                                                                        <div
                                                                            className={`inline-flex h-4 items-center rounded-full px-1.5 text-[10px] font-medium uppercase leading-none tracking-wide ${updateCheck.isNightly ? "bg-ctp-red/10 text-ctp-red" : "bg-accent/10 text-accent"}`}
                                                                        >
                                                                            {updateCheck.isNightly
                                                                                ? "Preview"
                                                                                : "Stable"}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                <div className="text-xs text-ctp-subtext0">
                                                                    {updateCheck.version
                                                                        ? updateCheck.isNightly
                                                                            ? "Development preview build • May contain bugs"
                                                                            : "Stable public release • Recommended update"
                                                                        : "Comet is running the latest version"}
                                                                </div>
                                                                {updateCheck.version && (
                                                                    <motion.div
                                                                        initial={{
                                                                            opacity: 0,
                                                                            y: -10,
                                                                        }}
                                                                        animate={{
                                                                            opacity: 1,
                                                                            y: 0,
                                                                        }}
                                                                        transition={{
                                                                            delay: 0.1,
                                                                        }}
                                                                    >
                                                                        <button
                                                                            onClick={async () => {
                                                                                try {
                                                                                    await invoke(
                                                                                        "download_and_install_update",
                                                                                    );
                                                                                } catch (error) {
                                                                                    toast.error(
                                                                                        "Failed to update Comet",
                                                                                    );
                                                                                    console.error(
                                                                                        "Failed to update:",
                                                                                        error,
                                                                                    );
                                                                                }
                                                                            }}
                                                                            className={`mt-2 flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all ${
                                                                                updateCheck.isNightly
                                                                                    ? "bg-ctp-red/10 text-ctp-red hover:bg-ctp-red/20"
                                                                                    : "bg-accent/10 text-accent hover:bg-accent/20"
                                                                            }`}
                                                                        >
                                                                            <div
                                                                                className={`flex h-[18px] w-[18px] items-center justify-center rounded ${
                                                                                    updateCheck.isNightly
                                                                                        ? "bg-ctp-red/10"
                                                                                        : "bg-accent/10"
                                                                                }`}
                                                                            >
                                                                                <Download
                                                                                    size={
                                                                                        12
                                                                                    }
                                                                                    className="stroke-[2.5]"
                                                                                />
                                                                            </div>
                                                                            Install
                                                                            Update
                                                                        </button>
                                                                    </motion.div>
                                                                )}
                                                            </div>
                                                        </div>
                                                    </motion.div>
                                                )}
                                        </AnimatePresence>
                                    </div>
                                </div>
                                <Checkbox
                                    checked={settings.interface.nightlyReleases}
                                    onChange={() => {
                                        updateSettings({
                                            interface: {
                                                ...settings.interface,
                                                nightlyReleases:
                                                    !settings.interface
                                                        .nightlyReleases,
                                            },
                                        });
                                    }}
                                    label="Check for nightly releases"
                                    description="Receive updates for development preview builds"
                                />
                            </SettingGroup>

                            <SettingGroup
                                title="Actions"
                                description="Application management actions"
                            >
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between rounded-lg bg-ctp-surface0/50 p-4">
                                        <div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-ctp-text">
                                                    Reset to Default
                                                </div>
                                                <div className="select-none text-xs text-ctp-subtext0">
                                                    This will reset all settings
                                                    to their default values
                                                </div>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() =>
                                                setShowResetConfirm(true)
                                            }
                                            className="flex items-center gap-1.5 rounded-md bg-ctp-red/10 px-3 py-1.5 text-xs font-medium text-ctp-red transition-colors hover:bg-ctp-red/20"
                                        >
                                            <RotateCcw
                                                size={12}
                                                className="stroke-[2.5]"
                                            />
                                            Reset Application Data
                                        </button>
                                    </div>

                                    <div className="flex items-center justify-between rounded-lg bg-ctp-surface0/50 p-4">
                                        <div>
                                            <div className="space-y-1">
                                                <div className="text-sm font-medium text-ctp-text">
                                                    Open Directories
                                                </div>
                                                <div className="select-none text-xs text-ctp-subtext0">
                                                    Access application
                                                    directories
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await invoke(
                                                            "open_comet_folder",
                                                        );
                                                    } catch (error) {
                                                        toast.error(
                                                            "Failed to open app directory",
                                                        );
                                                        console.error(
                                                            "Failed to open app directory",
                                                            error,
                                                        );
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
                                            >
                                                <Folder
                                                    size={12}
                                                    className="stroke-[2.5]"
                                                />
                                                App Directory
                                            </button>
                                            <button
                                                onClick={async () => {
                                                    try {
                                                        await invoke(
                                                            "open_hydrogen_folder",
                                                        );
                                                    } catch (error) {
                                                        toast.error(
                                                            "Failed to open Hydrogen directory",
                                                        );
                                                        console.error(
                                                            "Failed to open Hydrogen directory",
                                                            error,
                                                        );
                                                    }
                                                }}
                                                className="flex items-center gap-1.5 rounded-md bg-white/5 px-3 py-1.5 text-xs font-medium transition-colors hover:bg-white/10"
                                            >
                                                <Folder
                                                    size={12}
                                                    className="stroke-[2.5]"
                                                />
                                                Hydrogen Directory
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </SettingGroup>

                            <SettingGroup
                                title="Technology Stack"
                                description="Core technologies powering Comet"
                            >
                                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                                    <TechStackItem
                                        name="Tauri"
                                        description="Build fast and secure desktop apps with native performance"
                                        href="https://tauri.app"
                                        icon="/assets/tauri.svg"
                                    />
                                    <TechStackItem
                                        name="React"
                                        description="Create dynamic user interfaces with component-based architecture"
                                        href="https://react.dev"
                                        icon="/assets/react.svg"
                                    />
                                    <TechStackItem
                                        name="Vite"
                                        description="Modern build tool with lightning-fast hot module replacement"
                                        href="https://vitejs.dev"
                                        icon="/assets/vite.svg"
                                    />
                                    <TechStackItem
                                        name="TailwindCSS"
                                        description="Utility-first CSS framework for rapid and flexible styling"
                                        href="https://tailwindcss.com"
                                        icon="/assets/tailwind.svg"
                                    />
                                    <TechStackItem
                                        name="Framer Motion"
                                        description="Production-ready library for smooth animations and gestures"
                                        href="https://www.framer.com"
                                        icon="/assets/framer.svg"
                                        invertIcon
                                    />
                                    <TechStackItem
                                        name="Lucide Icons"
                                        description="Beautiful and consistent icon system with over 1000 icons"
                                        href="https://lucide.dev"
                                        icon="/assets/lucide.svg"
                                    />
                                </div>
                            </SettingGroup>

                            <SettingGroup
                                title="Credits"
                                description="Project contributors"
                            >
                                <div className="rounded-lg bg-ctp-surface0/50 p-4">
                                    <div className="space-y-4">
                                        <div>
                                            <div className="text-sm font-medium text-ctp-text">
                                                Frozen Productions
                                            </div>
                                            <div className="select-none text-xs text-ctp-subtext0">
                                                Comet Developer
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-ctp-text">
                                                xGladius
                                            </div>
                                            <div className="select-none text-xs text-ctp-subtext0">
                                                Hydrogen Developer
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-ctp-text">
                                                MaximumADHD
                                            </div>
                                            <div className="select-none text-xs text-ctp-subtext0">
                                                Roblox FFlag Tracking System
                                                Creator
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </SettingGroup>
                        </div>
                    </>
                );
            default:
                return null;
        }
    };

    return (
        <div className="flex h-full flex-col bg-ctp-base">
            <Header
                title="Settings"
                icon={<SettingsIcon size={16} className="text-accent" />}
                description="Changes are saved automatically"
            />

            <div className="flex flex-1 overflow-hidden">
                <div className="flex w-64 flex-col border-r border-white/5 bg-ctp-mantle">
                    <div className="p-2">
                        <div className="relative">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) =>
                                    setSearchQuery(e.target.value.toLowerCase())
                                }
                                placeholder="Search settings..."
                                className="h-9 w-full rounded-lg bg-white/5 pl-9 pr-3 text-sm text-ctp-text placeholder-ctp-subtext0 focus:outline-none focus:ring-2 focus:ring-accent/50"
                            />
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-accent"
                            />
                        </div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        {SETTINGS_SECTIONS.filter(
                            (section) =>
                                section.title
                                    .toLowerCase()
                                    .includes(searchQuery) ||
                                section.description
                                    .toLowerCase()
                                    .includes(searchQuery),
                        ).map((section) => (
                            <motion.button
                                key={section.id}
                                onClick={() => setActiveSection(section.id)}
                                className={`group relative w-full px-4 py-3 text-left transition-colors hover:bg-ctp-surface0 ${activeSection === section.id ? "bg-ctp-surface0" : ""} `}
                                transition={{
                                    type: "spring",
                                    stiffness: 500,
                                    damping: 30,
                                }}
                            >
                                <div className="flex items-center gap-3">
                                    <section.icon
                                        size={18}
                                        className={` ${
                                            activeSection === section.id
                                                ? "text-accent"
                                                : "text-ctp-subtext0"
                                        } transition-colors group-hover:text-accent`}
                                    />
                                    <div>
                                        <div className="text-sm font-medium text-ctp-text">
                                            {section.title}
                                        </div>
                                        <div className="select-none text-xs text-ctp-subtext0">
                                            {section.description}
                                        </div>
                                    </div>
                                    <ChevronRight
                                        size={16}
                                        className={`ml-auto opacity-0 transition-all group-hover:opacity-100 ${
                                            activeSection === section.id
                                                ? "text-accent opacity-100"
                                                : "text-ctp-subtext0"
                                        } `}
                                    />
                                </div>
                                {activeSection === section.id && (
                                    <motion.div
                                        layoutId="active-indicator"
                                        className="absolute bottom-0 left-0 top-0 w-0.5 bg-accent-gradient"
                                    />
                                )}
                            </motion.button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto">
                    <div className="mx-auto max-w-3xl space-y-8 p-8">
                        <AnimatePresence mode="wait">
                            <motion.div
                                key={activeSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.2 }}
                            >
                                {renderSectionContent()}
                            </motion.div>
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={showResetConfirm}
                onClose={() => setShowResetConfirm(false)}
                title="Reset Application Data"
                description="Are you sure you want to reset all application data to default values? This includes all settings, keybinds, and other stored preferences. This action cannot be undone."
                onConfirm={() => {
                    localStorage.clear();
                    window.location.reload();
                }}
                confirmText="Reset"
                confirmVariant="destructive"
            />
        </div>
    );
};

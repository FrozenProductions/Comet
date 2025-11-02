import {
    AlertTriangle,
    Book,
    Box,
    Folder,
    Github,
    Layers,
    RotateCcw,
    Settings2,
    Trash2,
    Users,
    Wrench,
} from "lucide-react";
import { type FC, useState } from "react";
import { toast } from "react-hot-toast";
import { useSettings } from "../../../hooks/core/useSettings";
import {
    openCometFolder,
    openExecutorFolder,
} from "../../../services/core/windowService";
import { toggleLoginItem } from "../../../services/system/loginItemsService";
import { uninstallApp } from "../../../services/system/uninstallService";
import { Checkbox } from "../../ui/input/checkbox";
import { Modal } from "../../ui/modal";
import { SettingGroup } from "../settingGroup";
import { TechStackItem } from "../techStackItem";

export const ApplicationSection: FC = () => {
    const { settings, updateSettings } = useSettings();
    const [showResetConfirm, setShowResetConfirm] = useState(false);
    const [showUninstallConfirm, setShowUninstallConfirm] = useState(false);

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
                    icon={<Box size={14} className="text-accent" />}
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-ctp-surface0/50 p-4">
                            <div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-ctp-text">
                                        Version
                                    </div>
                                    <div className="select-none text-xs text-ctp-subtext0">
                                        1.1.2-Public
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <a
                                    href="https://github.com/FrozenProductions/Comet"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10"
                                >
                                    <Github
                                        size={14}
                                        className="stroke-[2.5]"
                                    />
                                    GitHub
                                </a>
                                <a
                                    href="https://github.com/FrozenProductions/Comet/blob/main/docs/documentation.md"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10"
                                >
                                    <Book size={14} className="stroke-[2.5]" />
                                    Docs
                                </a>
                            </div>
                        </div>
                    </div>
                    <Checkbox
                        checked={settings.app.startAtLogin}
                        onChange={async () => {
                            try {
                                await toggleLoginItem(
                                    !settings.app.startAtLogin,
                                );
                                updateSettings({
                                    app: {
                                        ...settings.app,
                                        startAtLogin:
                                            !settings.app.startAtLogin,
                                    },
                                });
                            } catch (error) {
                                console.error(
                                    "Failed to toggle login item:",
                                    error,
                                );
                                toast.error(
                                    "Failed to update startup settings",
                                );
                            }
                        }}
                        label="Start at login"
                        description="Launch Comet automatically when you log in"
                    />
                </SettingGroup>

                <SettingGroup
                    title="Actions"
                    description="Application management actions"
                    icon={<Wrench size={14} className="text-accent" />}
                >
                    <div className="space-y-4">
                        <div className="flex items-center justify-between rounded-lg bg-ctp-surface0/50 p-4">
                            <div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-ctp-text">
                                        Reset to Default
                                    </div>
                                    <div className="select-none text-xs text-ctp-subtext0">
                                        This will reset all settings to their
                                        default values
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowResetConfirm(true)}
                                className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-ctp-red transition-colors hover:bg-white/10"
                            >
                                <RotateCcw size={14} className="stroke-[2.5]" />
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
                                        Access application directories
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            await openCometFolder();
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
                                    className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10"
                                >
                                    <Folder
                                        size={14}
                                        className="stroke-[2.5]"
                                    />
                                    App Directory
                                </button>
                                <button
                                    type="button"
                                    onClick={async () => {
                                        try {
                                            await openExecutorFolder();
                                        } catch (error) {
                                            toast.error(
                                                "Failed to open executor directory",
                                            );
                                            console.error(
                                                "Failed to open Executor directory",
                                                error,
                                            );
                                        }
                                    }}
                                    className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-accent transition-colors hover:bg-white/10"
                                >
                                    <Folder
                                        size={14}
                                        className="stroke-[2.5]"
                                    />
                                    Executor Directory
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center justify-between rounded-lg bg-ctp-surface0/50 p-4">
                            <div>
                                <div className="space-y-1">
                                    <div className="text-sm font-medium text-ctp-text">
                                        Uninstall Application
                                    </div>
                                    <div className="select-none text-xs text-ctp-subtext0">
                                        Remove Executor from your system
                                    </div>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => setShowUninstallConfirm(true)}
                                className="flex h-7 items-center justify-center gap-1.5 rounded-lg border border-ctp-surface2 bg-ctp-surface1 px-3 text-xs font-medium text-ctp-red transition-colors hover:bg-white/10"
                            >
                                <Trash2 size={14} className="stroke-[2.5]" />
                                Uninstall
                            </button>
                        </div>
                    </div>
                </SettingGroup>

                <SettingGroup
                    title="Technology Stack"
                    description="Core technologies powering Comet"
                    icon={<Layers size={14} className="text-accent" />}
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
                            name="Supabase"
                            description="Open source Firebase alternative with PostgreSQL database"
                            href="https://supabase.io"
                            icon="/assets/supabase.svg"
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
                    icon={<Users size={14} className="text-accent" />}
                >
                    <div className="rounded-lg bg-ctp-surface0/50 p-4">
                        <div className="space-y-4">
                            <div>
                                <div className="text-sm font-medium text-ctp-text">
                                    Frozen Productions
                                </div>
                                <div className="select-none text-xs text-ctp-subtext0">
                                    Comet(Application) Developer
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-ctp-text">
                                    xGladius
                                </div>
                                <div className="select-none text-xs text-ctp-subtext0">
                                    Executor Developer
                                </div>
                            </div>
                            <div>
                                <div className="text-sm font-medium text-ctp-text">
                                    MaximumADHD
                                </div>
                                <div className="select-none text-xs text-ctp-subtext0">
                                    Roblox FFlag Tracking System Creator
                                </div>
                            </div>
                        </div>
                    </div>
                </SettingGroup>
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

            <Modal
                isOpen={showUninstallConfirm}
                onClose={() => setShowUninstallConfirm(false)}
                title="Uninstall Executor"
                description="This will completely remove Executor, Roblox, and all associated data from your system. This action cannot be undone."
                onConfirm={async () => {
                    try {
                        await uninstallApp();
                        toast.success("Uninstalling Executor...");
                    } catch (error) {
                        toast.error("Failed to uninstall Executor");
                        console.error("Failed to uninstall:", error);
                        setShowUninstallConfirm(false);
                    }
                }}
                confirmText="Uninstall"
                confirmVariant="destructive"
            >
                <div className="rounded-lg border border-ctp-yellow/20 bg-ctp-yellow/5 p-3">
                    <div className="flex items-start gap-2">
                        <AlertTriangle
                            size={16}
                            className="mt-0.5 shrink-0 text-ctp-yellow"
                        />
                        <div className="space-y-1">
                            <div className="text-xs font-medium text-ctp-yellow">
                                Warning
                            </div>
                            <div className="text-xs text-ctp-subtext0">
                                This will permanently delete all application
                                data, executor files, Roblox installation,
                                scripts, settings, tabs, workspaces, and
                                execution history.
                            </div>
                        </div>
                    </div>
                </div>
            </Modal>
        </>
    );
};

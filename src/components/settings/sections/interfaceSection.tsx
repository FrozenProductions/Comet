import { FC, useState } from "react";
import { Settings as SettingsIcon, LayoutGrid, Palette } from "lucide-react";
import { Checkbox } from "../../ui/checkbox";
import { useSettings } from "../../../hooks/useSettings";
import { SettingGroup } from "../settingGroup";
import { Modal } from "../../ui/modal";
import { toast } from "react-hot-toast";

export const InterfaceSection: FC = () => {
    const { settings, updateSettings } = useSettings();
    const [showZenModeConfirm, setShowZenModeConfirm] = useState(false);

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

    return (
        <>
            <div className="mb-4 space-y-2">
                <h2 className="flex items-center gap-2 text-xl font-medium text-ctp-text">
                    <SettingsIcon size={20} className="text-accent" />
                    Interface Settings
                </h2>
                <p className="-mt-1 select-none text-sm text-ctp-subtext0">
                    Customize the application interface and appearance
                </p>
            </div>

            <div className="space-y-6">
                <SettingGroup
                    title="Layout"
                    description="Interface layout preferences"
                    icon={<LayoutGrid size={14} className="text-accent" />}
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
                                        !settings.interface.showConsole,
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
                    icon={<Palette size={14} className="text-accent" />}
                >
                    <Checkbox
                        checked={settings.interface.showTabBar}
                        onChange={() => {
                            updateSettings({
                                interface: {
                                    ...settings.interface,
                                    showTabBar: !settings.interface.showTabBar,
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
};

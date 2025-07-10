import {
	History,
	LayoutGrid,
	MessageSquare,
	Palette,
	Settings as SettingsIcon,
} from "lucide-react";
import { type FC, useState } from "react";
import { toast } from "react-hot-toast";
import { useSettings } from "../../../hooks/core/useSettings";
import type { ToastPosition } from "../../../types/ui/toast";
import { Checkbox } from "../../ui/checkbox";
import { Modal } from "../../ui/modal";
import { RadioGroup } from "../../ui/radioGroup";
import { Slider } from "../../ui/slider";
import { SettingGroup } from "../settingGroup";

const TOAST_VERTICAL_OPTIONS = [
	{ value: "top", label: "Top" },
	{ value: "bottom", label: "Bottom" },
];

const TOAST_HORIZONTAL_OPTIONS = [
	{ value: "left", label: "Left" },
	{ value: "center", label: "Center" },
	{ value: "right", label: "Right" },
];

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

	const currentPosition = settings.interface.toastPosition || "bottom-center";
	const [vertical, horizontal] = currentPosition.split("-") as [string, string];

	const handleToastPositionChange = (
		type: "vertical" | "horizontal",
		value: string,
	) => {
		const newVertical = type === "vertical" ? value : vertical;
		const newHorizontal = type === "horizontal" ? value : horizontal;
		const newPosition = `${newVertical}-${newHorizontal}` as ToastPosition;

		updateSettings({
			interface: {
				...settings.interface,
				toastPosition: newPosition,
			},
		});
		toast.success("Toast position updated");
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
									showConsole: !settings.interface.showConsole,
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
					<Checkbox
						checked={settings.interface.middleClickTabClose}
						onChange={() => {
							updateSettings({
								interface: {
									...settings.interface,
									middleClickTabClose: !settings.interface.middleClickTabClose,
								},
							});
						}}
						label="Middle-Click Tab Close"
						description="Allow closing tabs by clicking the middle mouse button"
					/>
					<RadioGroup
						value={settings.interface.modalScale}
						onChange={(value) => {
							updateSettings({
								interface: {
									...settings.interface,
									modalScale: value,
								},
							});
						}}
						options={[
							{ value: "small", label: "Small" },
							{ value: "default", label: "Default" },
							{ value: "large", label: "Large" },
						]}
						label="Modal Size"
						description="Adjust the size of modal windows and their content"
					/>
				</SettingGroup>

				<SettingGroup
					title="Recent Searches"
					description="Configure recent search history"
					icon={<History size={14} className="text-accent" />}
				>
					<Checkbox
						checked={settings.interface.recentSearches.enabled}
						onChange={() => {
							updateSettings({
								interface: {
									...settings.interface,
									recentSearches: {
										...settings.interface.recentSearches,
										enabled: !settings.interface.recentSearches.enabled,
									},
								},
							});
						}}
						label="Show Recent Searches"
						description="Display recent search history in the script library"
					/>
					<Slider
						value={settings.interface.recentSearches.maxItems}
						onChange={(value) => {
							updateSettings({
								interface: {
									...settings.interface,
									recentSearches: {
										...settings.interface.recentSearches,
										maxItems: value,
									},
								},
							});
						}}
						min={1}
						max={10}
						step={1}
						label="Maximum Recent Searches"
						description="Number of recent searches to remember"
					/>
				</SettingGroup>

				<SettingGroup
					title="Execution History"
					description="Configure execution history settings"
					icon={<History size={14} className="text-accent" />}
				>
					<Slider
						value={settings.interface.executionHistory?.maxItems ?? 100}
						onChange={(value) => {
							updateSettings({
								interface: {
									...settings.interface,
									executionHistory: {
										...settings.interface.executionHistory,
										maxItems: value,
									},
								},
							});
						}}
						min={10}
						max={500}
						step={10}
						label="Maximum History Items"
						description="Number of execution records to keep in history"
					/>
				</SettingGroup>

				<SettingGroup
					title="Notifications"
					description="Configure toast notifications"
					icon={<MessageSquare size={14} className="text-accent" />}
				>
					<div className="space-y-4">
						<RadioGroup
							value={vertical}
							onChange={(value) => handleToastPositionChange("vertical", value)}
							options={TOAST_VERTICAL_OPTIONS}
							label="Vertical Position"
							description="Choose vertical alignment for toast notifications"
						/>
						<RadioGroup
							value={horizontal}
							onChange={(value) =>
								handleToastPositionChange("horizontal", value)
							}
							options={TOAST_HORIZONTAL_OPTIONS}
							label="Horizontal Position"
							description="Choose horizontal alignment for toast notifications"
						/>
					</div>
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

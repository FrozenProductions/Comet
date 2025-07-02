import { type FC, useState } from "react";
import { Keyboard } from "lucide-react";
import { useKeybinds } from "../../../hooks/useKeybinds";
import { KeybindEditor } from "../keybindEditor";
import type { Keybind, KeybindAction } from "../../../types/keybinds";
import { toast } from "react-hot-toast";
import {
	KEYBIND_CATEGORIES,
	KEYBIND_CATEGORY_MAPPING,
} from "../../../constants/keybinds";
import { AnimatePresence } from "framer-motion";
import type { KeybindSectionProps } from "../../../types/settings";
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

const KeybindSection: FC<KeybindSectionProps> = ({
	category,
	keybinds,
	onEditKeybind,
}) => (
	<div className="space-y-4 rounded-xl bg-ctp-mantle p-4">
		<div className="flex items-start justify-between border-b border-ctp-surface0 pb-2">
			<div className="min-w-0 flex-1">
				<div className="flex items-center gap-2">
					<div className="flex h-6 w-6 items-center justify-center rounded bg-accent/10">
						<Keyboard size={14} className="text-accent" />
					</div>
					<div className="text-sm font-medium text-ctp-text">{category}</div>
				</div>
				<div className="mt-1.5 select-none text-xs text-ctp-subtext0">
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

export const KeybindsSection: FC = () => {
	const { keybinds, updateKeybind } = useKeybinds();
	const [editingKeybind, setEditingKeybind] = useState<Keybind | null>(null);

	const categorizedKeybinds = keybinds.reduce<Record<string, Keybind[]>>(
		(acc, keybind) => {
			if (keybind.action === "switchTab") return acc;
			const category =
				KEYBIND_CATEGORIES[KEYBIND_CATEGORY_MAPPING[keybind.action]];
			if (!acc[category]) acc[category] = [];
			acc[category].push(keybind);
			return acc;
		},
		{},
	);

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
							toast.success("Keybind updated successfully");
						}}
					/>
				)}
			</AnimatePresence>
		</>
	);
};

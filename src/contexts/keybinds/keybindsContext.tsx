import { invoke } from "@tauri-apps/api/tauri";
import React, { useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import { DEFAULT_KEYBINDS } from "../../constants/core/keybinds";
import { useEditor } from "../../hooks/core/useEditor";
import { useLocalStorage } from "../../hooks/core/useLocalStorage";
import { useSettings } from "../../hooks/core/useSettings";
import { useScript } from "../../hooks/execution/useScript";
import { useRoblox } from "../../hooks/roblox/useRoblox";
import { useConsoleVisibility } from "../../hooks/ui/useConsoleVisibility";
import type { Keybind, KeybindAction, Screen } from "../../types/core/keybinds";
import { KeybindsContext } from "./keybindsContextType";

export const KeybindsProvider: React.FC<{ children: React.ReactNode }> = ({
	children,
}) => {
	const { createTab, closeTab, activeTab, tabs, setActiveTab } = useEditor();
	const { settings, updateSettings } = useSettings();
	const { openRoblox } = useRoblox();
	const { executeScript } = useScript();
	const { toggleConsoleVisibility } = useConsoleVisibility();
	const [activeScreen, setActiveScreen] = useState<Screen>("Editor");
	const [keybinds, setKeybinds] = useLocalStorage<Keybind[]>(
		"keybinds",
		DEFAULT_KEYBINDS,
	);
	const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
	const [isConsoleOpen, setIsConsoleOpen] = useState(false);
	const [isKeybindEditorOpen, setIsKeybindEditorOpen] = useState(false);

	const numberBuffer = React.useRef("");
	const bufferTimeout = React.useRef<number>();

	const toggleCommandPalette = useCallback(() => {
		setIsCommandPaletteOpen((prev) => !prev);
	}, []);

	const handleScreenChange = useCallback((screen: Screen) => {
		setActiveScreen(screen);
	}, []);

	const handleKeybindAction = useCallback(
		(keybind: Keybind) => {
			switch (keybind.action) {
				case "hideWindow":
					invoke("hide_window");
					break;
				case "newTab":
					createTab();
					break;
				case "closeTab":
					if (activeTab) {
						closeTab(activeTab);
					}
					break;
				case "switchTab": {
					const targetIndex = keybind.data?.index;
					if (typeof targetIndex === "number" && tabs[targetIndex]) {
						setActiveTab(tabs[targetIndex].id);
					}
					break;
				}
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
						},
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
				case "openEditor":
					handleScreenChange("Editor");
					break;
				case "openFastFlags":
					handleScreenChange("FastFlags");
					break;
				case "openLibrary":
					handleScreenChange("Library");
					break;
				case "openAutoExecution":
					handleScreenChange("AutoExecution");
					break;
				case "collapseConsole":
					setIsConsoleOpen((prev) => !prev);
					break;
				case "toggleConsole":
					toggleConsoleVisibility();
					break;
			}
		},
		[
			createTab,
			closeTab,
			activeTab,
			tabs,
			setActiveTab,
			settings,
			updateSettings,
			executeScript,
			openRoblox,
			toggleCommandPalette,
			handleScreenChange,
			toggleConsoleVisibility,
		],
	);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (isKeybindEditorOpen) return;

			if (e.metaKey && !e.shiftKey && !e.altKey && !e.ctrlKey) {
				const num = parseInt(e.key);
				if (!Number.isNaN(num)) {
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
				const shiftMatch = keybind.modifiers.shift ? e.shiftKey : !e.shiftKey;
				const altMatch = keybind.modifiers.alt ? e.altKey : !e.altKey;
				const ctrlMatch = keybind.modifiers.ctrl ? e.ctrlKey : !e.ctrlKey;
				const keyMatch = e.key.toLowerCase() === keybind.key.toLowerCase();

				return cmdMatch && shiftMatch && altMatch && ctrlMatch && keyMatch;
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
	}, [keybinds, tabs, setActiveTab, isKeybindEditorOpen, handleKeybindAction]);

	const updateKeybind = useCallback(
		(action: KeybindAction, newKeybind: Partial<Keybind>) => {
			setKeybinds((prev) =>
				prev.map((kb) =>
					kb.action === action
						? {
								...kb,
								key: newKeybind.key || kb.key,
								modifiers: {
									...kb.modifiers,
									...newKeybind.modifiers,
								},
							}
						: kb,
				),
			);
		},
		[setKeybinds],
	);

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

import { type FC, useEffect, useState } from "react";
import { FastFlags } from "./components/fastFlags/fastFlags";
import { Library } from "./components/library";
import { Settings } from "./components/settings/settings";
import { Sidebar } from "./components/sidebar";
import { Topbar } from "./components/topbar";
import { CommandPalette } from "./components/ui/commandPalette";
import { Toaster } from "./components/ui/toast";
import { Workspace } from "./components/workspace/workspace";
import { EditorProvider } from "./contexts/editor/editorContext";
import { ExecuteProvider } from "./contexts/execute/executeContext";
import { FastFlagsProvider } from "./contexts/fastFlags/fastFlagsContext";
import { KeybindsProvider } from "./contexts/keybinds/keybindsContext";
import { SettingsProvider } from "./contexts/settings/settingsContext";
import { useSettings } from "./hooks/useSettings";
import "react-tooltip/dist/react-tooltip.css";
import { AutoExecute } from "./components/autoExecute/autoExecute";
import { HydrogenNotFound } from "./components/ui/hydrogenNotFound";
import { MessageModal } from "./components/ui/messageModal";
import { UpdateChecker } from "./components/updater";
import { APP_CONSTANTS } from "./constants/app";
import { ConsoleProvider } from "./contexts/console/consoleContext";
import { ExecutionHistoryProvider } from "./contexts/execution/executionHistoryContext";
import { SidebarProvider } from "./contexts/sidebar/sidebarContext";
import { WorkspaceProvider } from "./contexts/workspace/workspaceContext";
import { useConsole } from "./hooks/useConsole";
import { useKeybinds } from "./hooks/useKeybinds";
import { checkHydrogenInstallation } from "./services/hydrogenService";

const AppContent: FC = () => {
	const { settings } = useSettings();
	const {
		isCommandPaletteOpen,
		toggleCommandPalette,
		activeScreen,
		handleScreenChange,
	} = useKeybinds();
	const { isFloating, setIsFloating } = useConsole();

	const toggleFloating = () => {
		setIsFloating(!isFloating);
	};

	const renderScreen = () => {
		switch (activeScreen) {
			case "Editor":
				return <Workspace />;
			case "Settings":
				return <Settings />;
			case "Library":
				return <Library />;
			case "AutoExecution":
				return <AutoExecute />;
			case "FastFlags":
				return <FastFlags />;
			default:
				return null;
		}
	};

	if (!settings) {
		return null;
	}

	return (
		<div className="flex h-screen flex-col bg-ctp-base text-ctp-text">
			<Topbar />
			<div className="flex flex-1 overflow-hidden">
				{!settings.interface.zenMode && (
					<Sidebar
						activeScreen={activeScreen}
						onScreenChange={handleScreenChange}
					/>
				)}
				<main className="relative flex-1">{renderScreen()}</main>
			</div>
			<CommandPalette
				isOpen={isCommandPaletteOpen}
				onClose={toggleCommandPalette}
				onFloatToggle={toggleFloating}
			/>
		</div>
	);
};

const App: FC = () => {
	const [isHydrogenInstalled, setIsHydrogenInstalled] = useState<
		boolean | null
	>(null);

	useEffect(() => {
		const checkHydrogen = async () => {
			try {
				const isInstalled = await checkHydrogenInstallation();
				setIsHydrogenInstalled(isInstalled);
			} catch (error) {
				console.error("Failed to check Hydrogen installation:", error);
				setIsHydrogenInstalled(false);
			}
		};

		checkHydrogen();
	}, []);

	if (isHydrogenInstalled === false) {
		return <HydrogenNotFound />;
	}

	return (
		<ExecuteProvider>
			<SettingsProvider>
				<WorkspaceProvider>
					<ExecutionHistoryProvider>
						<EditorProvider>
							<ConsoleProvider>
								<FastFlagsProvider>
									<KeybindsProvider>
										<SidebarProvider>
											<AppContent />
											<MessageModal
												currentVersion={APP_CONSTANTS.currentVersion}
											/>
											<UpdateChecker />
											<Toaster />
										</SidebarProvider>
									</KeybindsProvider>
								</FastFlagsProvider>
							</ConsoleProvider>
						</EditorProvider>
					</ExecutionHistoryProvider>
				</WorkspaceProvider>
			</SettingsProvider>
		</ExecuteProvider>
	);
};

export default App;

import { FC, useState, useEffect } from "react";
import { Workspace } from "./components/workspace/workspace";
import { Settings } from "./components/settings/settings";
import { EditorProvider } from "./contexts/editorContext";
import { Topbar } from "./components/topbar";
import { Sidebar } from "./components/sidebar";
import { SettingsProvider } from "./contexts/settingsContext";
import { ExecuteProvider } from "./contexts/executeContext";
import { ConnectionProvider } from "./contexts/connectionContext";
import { KeybindsProvider, useKeybinds } from "./contexts/keybindsContext";
import { Toaster } from "./components/ui/toast";
import { Library } from "./components/library";
import { FastFlags } from "./components/fastFlags/fastFlags";
import { FastFlagsProvider } from "./contexts/fastFlagsContext";
import { useSettings } from "./contexts/settingsContext";
import { CommandPalette } from "./components/ui/commandPalette";
import "react-tooltip/dist/react-tooltip.css";
import { AutoExecute } from "./components/autoExecute/autoExecute";
import { ConsoleProvider, useConsole } from "./contexts/consoleContext";
import { invoke } from "@tauri-apps/api/tauri";
import { HydrogenNotFound } from "./components/ui/hydrogenNotFound";
import { WorkspaceProvider } from "./contexts/workspaceContext";
import { UpdateChecker } from "./components/updater";

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
        <div className="h-screen flex flex-col bg-ctp-base text-ctp-text">
            <Topbar />
            <div className="flex-1 flex overflow-hidden">
                {!settings.interface.zenMode && (
                    <Sidebar
                        activeScreen={activeScreen}
                        onScreenChange={handleScreenChange}
                    />
                )}
                <main className="flex-1 relative">{renderScreen()}</main>
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
                const isInstalled = await invoke("check_hydrogen_installation");
                setIsHydrogenInstalled(isInstalled as boolean);
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
        <ConnectionProvider>
            <ExecuteProvider>
                <SettingsProvider>
                    <WorkspaceProvider>
                        <EditorProvider>
                            <ConsoleProvider>
                                <FastFlagsProvider>
                                    <KeybindsProvider>
                                        <AppContent />
                                        <Toaster />
                                    </KeybindsProvider>
                                </FastFlagsProvider>
                            </ConsoleProvider>
                        </EditorProvider>
                    </WorkspaceProvider>
                </SettingsProvider>
            </ExecuteProvider>
            <UpdateChecker />
        </ConnectionProvider>
    );
};

export default App;

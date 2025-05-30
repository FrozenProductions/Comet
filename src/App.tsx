import { FC, useState, useEffect } from "react";
import { Workspace } from "./components/workspace/workspace";
import { Settings } from "./components/settings/settings";
import { EditorProvider } from "./contexts/editor/editorContext";
import { Topbar } from "./components/topbar";
import { Sidebar } from "./components/sidebar";
import { SettingsProvider } from "./contexts/settings/settingsContext";
import { ExecuteProvider } from "./contexts/execute/executeContext";
import { ConnectionProvider } from "./contexts/connection/connectionContext";
import { KeybindsProvider } from "./contexts/keybinds/keybindsContext";
import { Toaster } from "./components/ui/toast";
import { Library } from "./components/library";
import { FastFlags } from "./components/fastFlags/fastFlags";
import { FastFlagsProvider } from "./contexts/fastFlags/fastFlagsContext";
import { useSettings } from "./hooks/useSettings";
import { CommandPalette } from "./components/ui/commandPalette";
import "react-tooltip/dist/react-tooltip.css";
import { AutoExecute } from "./components/autoExecute/autoExecute";
import { ConsoleProvider } from "./contexts/console/consoleContext";
import { HydrogenNotFound } from "./components/ui/hydrogenNotFound";
import { WorkspaceProvider } from "./contexts/workspace/workspaceContext";
import { UpdateChecker } from "./components/updater";
import { useKeybinds } from "./hooks/useKeybinds";
import { useConsole } from "./hooks/useConsole";
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
        <ConnectionProvider>
            <ExecuteProvider>
                <SettingsProvider>
                    <WorkspaceProvider>
                        <EditorProvider>
                            <ConsoleProvider>
                                <FastFlagsProvider>
                                    <KeybindsProvider>
                                        <AppContent />
                                        <UpdateChecker />
                                        <Toaster />
                                    </KeybindsProvider>
                                </FastFlagsProvider>
                            </ConsoleProvider>
                        </EditorProvider>
                    </WorkspaceProvider>
                </SettingsProvider>
            </ExecuteProvider>
        </ConnectionProvider>
    );
};

export default App;

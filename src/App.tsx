import { FC } from "react";
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
import { ConsoleProvider } from "./contexts/consoleContext";

const AppContent: FC = () => {
    const { settings } = useSettings();
    const {
        isCommandPaletteOpen,
        toggleCommandPalette,
        activeScreen,
        handleScreenChange,
    } = useKeybinds();

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
            />
        </div>
    );
};

const App: FC = () => {
    return (
        <ConnectionProvider>
            <ExecuteProvider>
                <EditorProvider>
                    <SettingsProvider>
                        <KeybindsProvider>
                            <ConsoleProvider>
                                <FastFlagsProvider>
                                    <AppContent />
                                    <Toaster />
                                </FastFlagsProvider>
                            </ConsoleProvider>
                        </KeybindsProvider>
                    </SettingsProvider>
                </EditorProvider>
            </ExecuteProvider>
        </ConnectionProvider>
    );
};

export default App;

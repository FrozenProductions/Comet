import { FC } from "react";
import { Workspace } from "./components/Workspace/Workspace";
import { Settings } from "./components/settings/Settings";
import { EditorProvider } from "./contexts/EditorContext";
import { Topbar } from "./components/Topbar";
import { Sidebar } from "./components/Sidebar";
import { SettingsProvider } from "./contexts/SettingsContext";
import { ExecuteProvider } from "./contexts/ExecuteContext";
import { ConnectionProvider } from "./contexts/ConnectionContext";
import { KeybindsProvider, useKeybinds } from "./contexts/KeybindsContext";
import { Toaster } from "./components/ui/Toast";
import { Library } from "./components/Library";
import { FastFlags } from "./components/fastflags/FastFlags";
import { FastFlagsProvider } from "./contexts/FastFlagsContext";
import { useSettings } from "./contexts/SettingsContext";
import { CommandPalette } from "./components/ui/CommandPalette";
import "react-tooltip/dist/react-tooltip.css";
import { AutoExecute } from "./components/autoexecute/AutoExecute";

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
                            <FastFlagsProvider>
                                <AppContent />
                                <Toaster />
                            </FastFlagsProvider>
                        </KeybindsProvider>
                    </SettingsProvider>
                </EditorProvider>
            </ExecuteProvider>
        </ConnectionProvider>
    );
};

export default App;

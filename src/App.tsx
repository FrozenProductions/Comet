import { FC, useState } from "react";
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
import { Profile } from "./components/profile/Profile";
import { useSettings } from "./contexts/SettingsContext";
import { CommandPalette } from "./components/ui/CommandPalette";
import "react-tooltip/dist/react-tooltip.css";
import { AutoExecute } from "./components/autoexecute/AutoExecute";

type Screen = "Editor" | "Settings" | "Profile" | "Library" | "AutoExecution";

const AppContent: FC = () => {
    const [activeScreen, setActiveScreen] = useState<Screen>("Editor");
    const { settings } = useSettings();
    const { isCommandPaletteOpen, toggleCommandPalette } = useKeybinds();

    const handleScreenChange = (screen: Screen) => {
        setActiveScreen(screen);
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
            case "Profile":
                return <Profile />;
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
                <SettingsProvider>
                    <EditorProvider>
                        <KeybindsProvider>
                            <AppContent />
                            <Toaster />
                        </KeybindsProvider>
                    </EditorProvider>
                </SettingsProvider>
            </ExecuteProvider>
        </ConnectionProvider>
    );
};

export default App;

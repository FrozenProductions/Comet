import { type FC, useEffect, useState } from "react";
import { FastFlags } from "./components/fastFlags/fastFlags";
import { Library } from "./components/library";
import { Settings } from "./components/settings/settings";
import { Sidebar } from "./components/sidebar";
import { StatusBar } from "./components/statusBar";
import { Topbar } from "./components/topbar";
import { CommandPalette } from "./components/ui/commandPalette";
import { Toaster } from "./components/ui/toast";
import { Workspace } from "./components/workspace/workspace";
import { EditorProvider } from "./contexts/editor/editorContext";
import { ExecuteProvider } from "./contexts/execute/executeContext";
import { FastFlagsProvider } from "./contexts/fastFlags/fastFlagsContext";
import { KeybindsProvider } from "./contexts/keybinds/keybindsContext";
import { SettingsProvider } from "./contexts/settings/settingsContext";
import { useSettings } from "./hooks/core/useSettings";
import "react-tooltip/dist/react-tooltip.css";
import { listen } from "@tauri-apps/api/event";
import { AutoExecute } from "./components/autoExecute/autoExecute";
import { CometOffline } from "./components/ui/cometOffline";
import { ExecutorNotFound } from "./components/ui/executorNotFound";
import { MessageModal } from "./components/ui/messageModal";
import { UpdateChecker } from "./components/updater";
import { APP_CONSTANTS } from "./constants/core/app";
import { ConsoleProvider } from "./contexts/console/consoleContext";
import { ExecutionHistoryProvider } from "./contexts/execution/executionHistoryContext";
import { SidebarProvider } from "./contexts/sidebar/sidebarContext";
import { WorkspaceProvider } from "./contexts/workspace/workspaceContext";
import { useKeybinds } from "./hooks/core/useKeybinds";
import { useConsole } from "./hooks/ui/useConsole";
import { checkExecutorInstallation } from "./services/features/hydrogenService";
import type { StatusInfo } from "./types/system/status";

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

    // maybe make a better handler for that?
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
            <StatusBar />
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
    const [status, setStatus] = useState<StatusInfo>({
        online: true,
        message: "",
    });

    useEffect(() => {
        const checkExecutor = async () => {
            try {
                const isInstalled = await checkExecutorInstallation();
                setIsHydrogenInstalled(isInstalled);
            } catch (error) {
                console.error("Failed to check executor installation:", error);
                setIsHydrogenInstalled(false);
            }
        };

        checkExecutor();

        const unsubscribe = listen<StatusInfo>(
            "comet-status-update",
            (event) => {
                setStatus(event.payload);
            },
        );

        return () => {
            unsubscribe.then((fn) => fn());
        };
    }, []);

    if (isHydrogenInstalled === false) {
        return <ExecutorNotFound />;
    }

    if (!status.online) {
        return <CometOffline message={status.message} />;
    }

    return (
        <ExecuteProvider>
            <SettingsProvider>
                <WorkspaceProvider>
                    <ExecutionHistoryProvider>
                        <EditorProvider>
                            <ConsoleProvider>
                                <FastFlagsProvider>
                                    <SidebarProvider>
                                        <KeybindsProvider>
                                            <AppContent />
                                            <MessageModal
                                                currentVersion={
                                                    APP_CONSTANTS.currentVersion
                                                }
                                            />
                                            <UpdateChecker />
                                            <Toaster />
                                        </KeybindsProvider>
                                    </SidebarProvider>
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

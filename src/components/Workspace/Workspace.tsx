import { FC, useState } from "react";
import { useEditor } from "../../contexts/editorContext";
import { CodeEditor } from "./editor";
import { Tabbar } from "./tabBar";
import { useSettings } from "../../contexts/settingsContext";
import { RobloxConsole } from "../robloxConsole";
import { useRobloxConsole } from "../../hooks/useRobloxConsole";
import { useConsole } from "../../contexts/consoleContext";

export const Workspace: FC = () => {
    const {
        tabs,
        activeTab,
        createTab,
        closeTab,
        updateTab,
        setActiveTab,
        setTabs,
    } = useEditor();
    const { settings } = useSettings();
    const [isConsoleOpen, setIsConsoleOpen] = useState(false);
    const { isFloating, setIsFloating } = useConsole();
    const consoleState = useRobloxConsole();

    const handleTabChange = (content: string | undefined) => {
        if (!activeTab || !content) return;
        updateTab(activeTab, { content });
    };

    const handleTabReorder = (fromIndex: number, toIndex: number) => {
        const newTabs = [...tabs];
        const [movedTab] = newTabs.splice(fromIndex, 1);
        newTabs.splice(toIndex, 0, movedTab);
        setTabs(newTabs);
    };

    const renderConsole = () => (
        <RobloxConsole
            isOpen={isConsoleOpen}
            onToggle={() => setIsConsoleOpen(!isConsoleOpen)}
            isFloating={isFloating}
            onFloatToggle={() => setIsFloating(!isFloating)}
            consoleState={consoleState}
        />
    );

    return (
        <div className="h-full flex flex-col overflow-hidden">
            {!settings.interface.zenMode && (
                <div className="h-10 flex-shrink-0 flex items-stretch bg-ctp-mantle border-b border-white/5">
                    <div className="flex-1 min-w-0">
                        <Tabbar
                            tabs={tabs}
                            activeTab={activeTab}
                            onTabClick={setActiveTab}
                            onTabClose={closeTab}
                            onTabRename={(id, newTitle) =>
                                updateTab(id, { title: newTitle })
                            }
                            onNewTab={createTab}
                            onTabReorder={handleTabReorder}
                        />
                    </div>
                </div>
            )}
            <div className="flex-1 min-h-0 relative bg-ctp-base">
                <div className="absolute inset-0 overflow-auto">
                    {activeTab ? (
                        <CodeEditor
                            content={
                                tabs.find((tab) => tab.id === activeTab)
                                    ?.content ?? ""
                            }
                            language={
                                tabs.find((tab) => tab.id === activeTab)
                                    ?.language ?? "lua"
                            }
                            onChange={handleTabChange}
                        />
                    ) : (
                        <div className="flex-1 flex items-center justify-center">
                            <button
                                onClick={createTab}
                                className="px-4 py-2 rounded-lg bg-ctp-surface0 text-sm text-ctp-text hover:bg-ctp-surface1 transition-colors"
                            >
                                Create new tab
                            </button>
                        </div>
                    )}
                </div>
                {!isFloating && (
                    <div className="absolute bottom-0 inset-x-0 z-[100]">
                        {renderConsole()}
                    </div>
                )}
            </div>
            {isFloating && renderConsole()}
        </div>
    );
};

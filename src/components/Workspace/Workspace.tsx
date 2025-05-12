import { FC } from "react";
import { useEditor } from "../../contexts/EditorContext";
import { CodeEditor } from "./Editor";
import { Tabbar } from "./Tabbar";
import { useSettings } from "../../contexts/SettingsContext";

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

    return (
        <div className="h-full flex flex-col">
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
            <div className="flex-1 relative bg-ctp-base">
                {activeTab ? (
                    <CodeEditor
                        content={
                            tabs.find((tab) => tab.id === activeTab)?.content ??
                            ""
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
        </div>
    );
};

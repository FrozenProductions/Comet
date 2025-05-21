import { FC, ReactNode, useState, useCallback, useEffect } from "react";
import { nanoid } from "nanoid";
import { invoke } from "@tauri-apps/api/tauri";
import { EditorPosition, Tab } from "../../types/editor";
import type { ScriptExecutionOptions } from "../../types/script";
import { scriptService } from "../../services/scriptService";
import { SCRIPT_MESSAGES, SCRIPT_TOAST_IDS } from "../../constants/script";
import { toast } from "react-hot-toast";
import { useWorkspace } from "../../hooks/useWorkspace";
import { EditorContext } from "./editorContextType";

export const EditorProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const { activeWorkspace } = useWorkspace();
    const [currentPosition, setCurrentPosition] = useState<EditorPosition>({
        lineNumber: 1,
        column: 1,
    });
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    const executeScript = useCallback(
        async ({
            content,
            showToast = true,
            toastId = SCRIPT_TOAST_IDS.EXECUTE,
        }: ScriptExecutionOptions = {}) => {
            let scriptContent = content;

            if (!scriptContent) {
                if (!tabs.length || !activeTab) {
                    showToast && toast.error(SCRIPT_MESSAGES.NO_SCRIPT);
                    return { success: false, error: SCRIPT_MESSAGES.NO_SCRIPT };
                }
                const tab = tabs.find((t) => t.id === activeTab);
                if (!tab) {
                    showToast && toast.error(SCRIPT_MESSAGES.NO_SCRIPT);
                    return { success: false, error: SCRIPT_MESSAGES.NO_SCRIPT };
                }
                scriptContent = tab.content;
            }

            if (!scriptContent.trim()) {
                showToast && toast.error(SCRIPT_MESSAGES.EMPTY_SCRIPT);
                return { success: false, error: SCRIPT_MESSAGES.EMPTY_SCRIPT };
            }

            const result = await scriptService.executeScript(scriptContent);

            if (result.success) {
                showToast &&
                    toast.success(SCRIPT_MESSAGES.EXECUTION_SUCCESS, {
                        id: toastId,
                    });
            } else {
                showToast && toast.error(SCRIPT_MESSAGES.EXECUTION_ERROR);
                console.error(SCRIPT_MESSAGES.EXECUTION_ERROR, result.error);
            }

            return result;
        },
        [activeTab, tabs]
    );

    const executeTab = useCallback(
        async (id: string) => {
            const tab = tabs.find((t) => t.id === id);
            if (!tab) return;
            await executeScript({ content: tab.content });
        },
        [tabs, executeScript]
    );

    const createTab = useCallback(() => {
        return new Promise<string | null>((resolve) => {
            const id = nanoid();
            if (!activeWorkspace) {
                resolve(null);
                return;
            }

            const existingUntitled = tabs
                .map((tab) => {
                    const match = tab.title.match(/^untitled_(\d+)\.lua$/);
                    return match ? parseInt(match[1]) : 0;
                })
                .filter((num) => num > 0);

            const nextNumber =
                existingUntitled.length > 0
                    ? Math.max(...existingUntitled) + 1
                    : 1;

            const title = `untitled_${nextNumber}.lua`;
            const newTab: Tab = {
                id,
                title,
                content: "",
                language: "lua",
            };

            setTabs((prev) => {
                const newTabs = [...prev, newTab];
                return newTabs;
            });

            setActiveTab(id);

            setTimeout(() => {
                resolve(id);
            }, 0);
        });
    }, [tabs, activeWorkspace]);

    const createTabWithContent = useCallback(
        async (title: string, content: string, language: string = "lua") => {
            if (!activeWorkspace) {
                return null;
            }

            const id = nanoid();
            const newTab: Tab = {
                id,
                title,
                content,
                language,
            };

            try {
                await invoke("save_tab", {
                    workspaceId: activeWorkspace,
                    tab: newTab,
                });

                setTabs((prev) => [...prev, newTab]);
                setActiveTab(id);

                await invoke("save_tab_state", {
                    workspaceId: activeWorkspace,
                    activeTab: id,
                    tabOrder: [...tabs.map((tab) => tab.id), id],
                    tabs: [...tabs, newTab],
                });

                return id;
            } catch (error) {
                console.error("Failed to create tab with content:", error);
                return null;
            }
        },
        [activeWorkspace, tabs]
    );

    useEffect(() => {
        if (!isInitialized || !activeWorkspace) return;

        const saveTabs = async () => {
            try {
                for (const tab of tabs) {
                    await invoke("save_tab", {
                        workspaceId: activeWorkspace,
                        tab,
                    });
                }

                await invoke("save_tab_state", {
                    workspaceId: activeWorkspace,
                    activeTab,
                    tabOrder: tabs.map((tab) => tab.id),
                    tabs,
                });
            } catch (error) {
                console.error("Failed to save tabs:", error);
            }
        };

        const timeoutId = setTimeout(() => {
            if (tabs.length > 0) {
                saveTabs();
            }
        }, 500);

        return () => clearTimeout(timeoutId);
    }, [tabs, activeTab, isInitialized, activeWorkspace]);

    useEffect(() => {
        const loadSavedTabs = async () => {
            if (!activeWorkspace) {
                setTabs([]);
                setActiveTab(null);
                setIsInitialized(true);
                return;
            }

            setIsInitialized(false);
            try {
                const loadedTabs = await invoke<Tab[]>("load_tabs", {
                    workspaceId: activeWorkspace,
                });
                const tabState = await invoke<{
                    active_tab: string | null;
                    tab_order: string[];
                }>("get_tab_state", {
                    workspaceId: activeWorkspace,
                });

                if (loadedTabs.length === 0) {
                    const id = nanoid();
                    const newTab = {
                        id,
                        title: "untitled.lua",
                        content: "-- New File\n",
                        language: "lua",
                    };
                    setTabs([newTab]);
                    setActiveTab(id);
                } else {
                    const sortedTabs = [...loadedTabs].sort((a, b) => {
                        const aIndex = tabState.tab_order.indexOf(a.id);
                        const bIndex = tabState.tab_order.indexOf(b.id);
                        if (aIndex === -1) return 1;
                        if (bIndex === -1) return -1;
                        return aIndex - bIndex;
                    });

                    setTabs(sortedTabs);
                    setActiveTab(tabState.active_tab || sortedTabs[0].id);
                }
            } catch (error) {
                console.error("Failed to load tabs:", error);
                const id = nanoid();
                const newTab = {
                    id,
                    title: "untitled.lua",
                    content: "-- New File\n",
                    language: "lua",
                };
                setTabs([newTab]);
                setActiveTab(id);
            }
            setIsInitialized(true);
        };

        loadSavedTabs();
    }, [activeWorkspace]);

    const closeTab = useCallback(
        async (id: string) => {
            if (!activeWorkspace) return;

            try {
                const tab = tabs.find((t) => t.id === id);
                if (tab) {
                    await invoke("delete_tab", {
                        workspaceId: activeWorkspace,
                        title: tab.title,
                    });
                    setTabs((prev) => prev.filter((tab) => tab.id !== id));
                    if (activeTab === id) {
                        const remainingTabs = tabs.filter(
                            (tab) => tab.id !== id
                        );
                        setActiveTab(
                            remainingTabs.length > 0
                                ? remainingTabs[remainingTabs.length - 1].id
                                : null
                        );
                    }
                }
            } catch (error) {
                console.error("Failed to delete tab:", error);
            }
        },
        [activeTab, tabs, activeWorkspace]
    );

    const updateTab = useCallback(
        async (id: string, updates: Partial<Tab>) => {
            if (!activeWorkspace) return;

            try {
                const currentTab = tabs.find((tab) => tab.id === id);
                if (!currentTab) return;

                const updatedTab = {
                    ...currentTab,
                    ...updates,
                };

                await invoke("save_tab", {
                    workspaceId: activeWorkspace,
                    tab: updatedTab,
                });

                if (updates.title && updates.title !== currentTab.title) {
                    await invoke("rename_tab", {
                        workspaceId: activeWorkspace,
                        oldTitle: currentTab.title,
                        newTitle: updates.title,
                    });
                }

                setTabs((prev) => {
                    const tabIndex = prev.findIndex((tab) => tab.id === id);
                    if (tabIndex === -1) return prev;

                    const newTabs = [...prev];
                    newTabs[tabIndex] = updatedTab;
                    return newTabs;
                });

                await invoke("save_tab_state", {
                    workspaceId: activeWorkspace,
                    activeTab,
                    tabOrder: tabs.map((tab) => tab.id),
                    tabs,
                });
            } catch (error) {
                console.error("Failed to update tab:", error);
            }
        },
        [tabs, activeWorkspace, activeTab]
    );

    const loadTabs = useCallback(
        (newTabs: Tab[], activeTabId: string | null) => {
            setTabs(newTabs);
            setActiveTab(activeTabId);
        },
        []
    );

    const duplicateTab = useCallback(
        async (id: string) => {
            if (!activeWorkspace) return;

            const sourceTab = tabs.find((tab) => tab.id === id);
            if (!sourceTab) return;

            const baseName = sourceTab.title.replace(/\.lua$/, "");
            const existingCopies = tabs
                .map((tab) => {
                    const match = tab.title.match(
                        new RegExp(`^${baseName} copy( \\d+)?\.lua$`)
                    );
                    if (!match) return 0;
                    return match[1] ? parseInt(match[1].trim()) : 1;
                })
                .filter((num) => num >= 0);

            const copyNumber =
                existingCopies.length > 0 ? Math.max(...existingCopies) + 1 : 1;
            const newTitle =
                copyNumber === 1
                    ? `${baseName} copy.lua`
                    : `${baseName} copy ${copyNumber}.lua`;

            const newId = nanoid();
            const newTab: Tab = {
                id: newId,
                title: newTitle,
                content: sourceTab.content,
                language: sourceTab.language,
            };

            try {
                await invoke("save_tab", {
                    workspaceId: activeWorkspace,
                    tab: newTab,
                });
                setTabs((prev) => [...prev, newTab]);
                setActiveTab(newId);
            } catch (error) {
                console.error("Failed to duplicate tab:", error);
            }
        },
        [tabs, activeWorkspace]
    );

    const value = {
        currentPosition,
        currentFile,
        tabs,
        activeTab,
        setPosition: setCurrentPosition,
        setFile: setCurrentFile,
        createTab,
        createTabWithContent,
        closeTab,
        updateTab,
        setActiveTab,
        loadTabs,
        setTabs,
        duplicateTab,
        executeTab,
        executeScript,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

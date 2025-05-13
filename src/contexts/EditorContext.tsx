import {
    createContext,
    useContext,
    FC,
    ReactNode,
    useState,
    useCallback,
    useEffect,
} from "react";
import { nanoid } from "nanoid";
import { invoke } from "@tauri-apps/api/tauri";
import { EditorPosition } from "../types/editor";

interface Tab {
    id: string;
    title: string;
    content: string;
    language: string;
}

interface EditorState {
    currentPosition: EditorPosition;
    currentFile: string | null;
    tabs: Tab[];
    activeTab: string | null;
    setPosition: (position: EditorPosition) => void;
    setFile: (file: string | null) => void;
    createTab: () => string;
    closeTab: (id: string) => void;
    updateTab: (id: string, updates: Partial<Tab>) => void;
    setActiveTab: (id: string) => void;
    loadTabs: (newTabs: Tab[], activeTabId: string | null) => void;
    setTabs: (tabs: Tab[]) => void;
}

const EditorContext = createContext<EditorState | null>(null);

export const EditorProvider: FC<{ children: ReactNode }> = ({ children }) => {
    const [currentPosition, setCurrentPosition] = useState<EditorPosition>({
        lineNumber: 1,
        column: 1,
    });
    const [currentFile, setCurrentFile] = useState<string | null>(null);
    const [tabs, setTabs] = useState<Tab[]>([]);
    const [activeTab, setActiveTab] = useState<string | null>(null);
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const loadSavedTabs = async () => {
            try {
                const loadedTabs = await invoke<Tab[]>("load_tabs");
                const tabState = await invoke<{
                    active_tab: string | null;
                    tab_order: string[];
                }>("get_tab_state");

                setTabs(loadedTabs);
                setActiveTab(tabState.active_tab);
                setIsInitialized(true);
            } catch (error) {
                console.error("Failed to load tabs:", error);
                setIsInitialized(true);
            }
        };
        loadSavedTabs();
    }, []);

    useEffect(() => {
        if (!isInitialized) return;

        const saveTabs = async () => {
            try {
                for (const tab of tabs) {
                    await invoke("save_tab", { tab });
                }

                await invoke("save_tab_state", {
                    activeTab,
                    tabOrder: tabs.map((tab) => tab.id),
                });
            } catch (error) {
                console.error("Failed to save tabs:", error);
            }
        };

        if (tabs.length > 0) {
            saveTabs();
        }
    }, [tabs, activeTab, isInitialized]);

    const createTab = useCallback(() => {
        const id = nanoid();
        const existingUntitled = tabs
            .map((tab) => {
                const match = tab.title.match(/^untitled_(\d+)\.lua$/);
                return match ? parseInt(match[1]) : 0;
            })
            .filter((num) => num > 0);

        const nextNumber =
            existingUntitled.length > 0 ? Math.max(...existingUntitled) + 1 : 1;

        const title = `untitled_${nextNumber}.lua`;
        const newTab: Tab = {
            id,
            title,
            content: "-- New File\n",
            language: "lua",
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTab(id);
        return id;
    }, [tabs]);

    const closeTab = useCallback(
        async (id: string) => {
            try {
                const tab = tabs.find((t) => t.id === id);
                if (tab) {
                    await invoke("delete_tab", { title: tab.title });
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
        [activeTab, tabs]
    );

    const updateTab = useCallback(
        async (id: string, updates: Partial<Tab>) => {
            try {
                const currentTab = tabs.find((tab) => tab.id === id);
                if (!currentTab) return;

                if (updates.title && updates.title !== currentTab.title) {
                    await invoke("rename_tab", {
                        oldTitle: currentTab.title,
                        newTitle: updates.title,
                    });
                }

                setTabs((prev) => {
                    const tabIndex = prev.findIndex((tab) => tab.id === id);
                    if (tabIndex === -1) return prev;

                    const newTabs = [...prev];
                    newTabs[tabIndex] = { ...newTabs[tabIndex], ...updates };
                    return newTabs;
                });

                if (updates.content !== undefined) {
                    await invoke("save_tab", {
                        tab: {
                            ...currentTab,
                            ...updates,
                        },
                    });
                }
            } catch (error) {
                console.error("Failed to update tab:", error);
            }
        },
        [tabs]
    );

    const loadTabs = useCallback(
        (newTabs: Tab[], activeTabId: string | null) => {
            setTabs(newTabs);
            setActiveTab(activeTabId);
        },
        []
    );

    const value = {
        currentPosition,
        currentFile,
        tabs,
        activeTab,
        setPosition: setCurrentPosition,
        setFile: setCurrentFile,
        createTab,
        closeTab,
        updateTab,
        setActiveTab,
        loadTabs,
        setTabs,
    };

    return (
        <EditorContext.Provider value={value}>
            {children}
        </EditorContext.Provider>
    );
};

export const useEditor = () => {
    const context = useContext(EditorContext);
    if (!context) {
        throw new Error("useEditor must be used within an EditorProvider");
    }
    return context;
};

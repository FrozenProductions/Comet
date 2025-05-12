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

interface EditorPosition {
    lineNumber: number;
    column: number;
}

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
                const state = await invoke<{
                    tabs: Tab[];
                    active_tab: string | null;
                }>("load_tabs");
                setTabs(state.tabs);
                setActiveTab(state.active_tab);
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
                await invoke("save_tabs", { tabs, activeTab });
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
        const newTab: Tab = {
            id,
            title: "untitled.lua",
            content: "-- New File\n",
            language: "lua",
        };
        setTabs((prev) => [...prev, newTab]);
        setActiveTab(id);
        return id;
    }, []);

    const closeTab = useCallback(
        (id: string) => {
            setTabs((prev) => prev.filter((tab) => tab.id !== id));
            if (activeTab === id) {
                const remainingTabs = tabs.filter((tab) => tab.id !== id);
                setActiveTab(
                    remainingTabs.length > 0
                        ? remainingTabs[remainingTabs.length - 1].id
                        : null
                );
            }
        },
        [activeTab, tabs]
    );

    const updateTab = useCallback((id: string, updates: Partial<Tab>) => {
        setTabs((prev) => {
            const tabIndex = prev.findIndex((tab) => tab.id === id);

            if (tabIndex === -1) return prev;

            const newTabs = [...prev];
            newTabs[tabIndex] = { ...newTabs[tabIndex], ...updates };
            return newTabs;
        });
    }, []);

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

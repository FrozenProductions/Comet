import {
    createContext,
    useContext,
    FC,
    ReactNode,
    useState,
    useEffect,
} from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { toast } from "react-hot-toast";

export interface Workspace {
    id: string;
    name: string;
    path: string;
}

interface WorkspaceState {
    workspaces: Workspace[];
    activeWorkspace: string | null;
    isLoading: boolean;
    createWorkspace: (name: string) => Promise<void>;
    deleteWorkspace: (id: string) => Promise<void>;
    setActiveWorkspace: (id: string) => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceState | null>(null);

export const WorkspaceProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadWorkspaces();
    }, []);

    const loadWorkspaces = async () => {
        try {
            const state = await invoke<{
                workspaces: Workspace[];
                active_workspace: string | null;
            }>("load_workspaces");
            setWorkspaces(state.workspaces);
            setActiveWorkspace(state.active_workspace);
        } catch (error) {
            console.error("Failed to load workspaces:", error);
            toast.error("Failed to load workspaces");
        } finally {
            setIsLoading(false);
        }
    };

    const createWorkspace = async (name: string) => {
        try {
            const workspace = await invoke<Workspace>("create_workspace", {
                name,
            });
            setWorkspaces((prev) => [...prev, workspace]);
            toast.success("Workspace created successfully");
        } catch (error) {
            console.error("Failed to create workspace:", error);
            toast.error("Failed to create workspace");
            throw error;
        }
    };

    const deleteWorkspace = async (id: string) => {
        try {
            await invoke("delete_workspace", { workspaceId: id });
            setWorkspaces((prev) => prev.filter((w) => w.id !== id));
            toast.success("Workspace deleted successfully");
        } catch (error) {
            console.error("Failed to delete workspace:", error);
            toast.error("Failed to delete workspace");
            throw error;
        }
    };

    const setActive = async (id: string) => {
        try {
            await invoke("set_active_workspace", { workspaceId: id });
            setActiveWorkspace(id);
        } catch (error) {
            console.error("Failed to set active workspace:", error);
            toast.error("Failed to set active workspace");
            throw error;
        }
    };

    return (
        <WorkspaceContext.Provider
            value={{
                workspaces,
                activeWorkspace,
                isLoading,
                createWorkspace,
                deleteWorkspace,
                setActiveWorkspace: setActive,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
};

export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error("useWorkspace must be used within a WorkspaceProvider");
    }
    return context;
};

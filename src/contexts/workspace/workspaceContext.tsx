import { FC, ReactNode, useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/tauri";
import { toast } from "react-hot-toast";
import { WorkspaceContext, Workspace } from "./workspaceContextType";

export const WorkspaceProvider: FC<{ children: ReactNode }> = ({
    children,
}) => {
    const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
    const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

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

    useEffect(() => {
        loadWorkspaces();
    }, []);

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

    const renameWorkspace = async (id: string, newName: string) => {
        try {
            await invoke("rename_workspace", { workspaceId: id, newName });
            await loadWorkspaces();
            toast.success("Workspace renamed successfully");
        } catch (error) {
            console.error("Failed to rename workspace:", error);
            toast.error("Failed to rename workspace");
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
                renameWorkspace,
            }}
        >
            {children}
        </WorkspaceContext.Provider>
    );
};

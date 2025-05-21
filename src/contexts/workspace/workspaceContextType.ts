import { createContext } from "react";

export interface Workspace {
    id: string;
    name: string;
    path: string;
}

export interface WorkspaceState {
    workspaces: Workspace[];
    activeWorkspace: string | null;
    isLoading: boolean;
    createWorkspace: (name: string) => Promise<void>;
    deleteWorkspace: (id: string) => Promise<void>;
    setActiveWorkspace: (id: string) => Promise<void>;
}

export const WorkspaceContext = createContext<WorkspaceState | null>(null);

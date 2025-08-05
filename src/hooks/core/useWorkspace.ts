import { useContext } from "react";
import { WorkspaceContext } from "../../contexts/workspace/workspaceContextType";

/**
 * Hook for accessing workspace context
 * Must be used within a WorkspaceProvider component
 * Returns workspace context containing state and methods for workspace management
 */
export const useWorkspace = () => {
    const context = useContext(WorkspaceContext);
    if (!context) {
        throw new Error("useWorkspace must be used within a WorkspaceProvider");
    }
    return context;
};

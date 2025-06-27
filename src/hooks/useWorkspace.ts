import { useContext } from "react";
import { WorkspaceContext } from "../contexts/workspace/workspaceContextType";

export const useWorkspace = () => {
	const context = useContext(WorkspaceContext);
	if (!context) {
		throw new Error("useWorkspace must be used within a WorkspaceProvider");
	}
	return context;
};

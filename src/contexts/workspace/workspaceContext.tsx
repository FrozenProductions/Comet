import { type FC, type ReactNode, useCallback, useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import {
	createWorkspace as createWorkspaceService,
	deleteWorkspace as deleteWorkspaceService,
	loadWorkspaces as loadWorkspacesService,
	renameWorkspace as renameWorkspaceService,
	setActiveWorkspace as setActiveWorkspaceService,
} from "../../services/workspaceService";
import { type Workspace, WorkspaceContext } from "./workspaceContextType";

export const WorkspaceProvider: FC<{ children: ReactNode }> = ({
	children,
}) => {
	const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
	const [activeWorkspace, setActiveWorkspace] = useState<string | null>(null);
	const [isLoading, setIsLoading] = useState(true);

	const loadWorkspaces = useCallback(async () => {
		try {
			const state = await loadWorkspacesService();
			setWorkspaces(state.workspaces);
			setActiveWorkspace(state.active_workspace);
		} catch (error) {
			console.error("Failed to load workspaces:", error);
			toast.error("Failed to load workspaces");
		} finally {
			setIsLoading(false);
		}
	}, []);

	useEffect(() => {
		loadWorkspaces();
	}, [loadWorkspaces]);

	const createWorkspace = async (name: string) => {
		try {
			const workspace = await createWorkspaceService(name);
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
			await deleteWorkspaceService(id);
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
			await setActiveWorkspaceService(id);
			setActiveWorkspace(id);
		} catch (error) {
			console.error("Failed to set active workspace:", error);
			toast.error("Failed to set active workspace");
			throw error;
		}
	};

	const renameWorkspace = async (id: string, newName: string) => {
		try {
			await renameWorkspaceService(id, newName);
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

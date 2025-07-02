import { save } from "@tauri-apps/api/dialog";
import { invoke } from "@tauri-apps/api/tauri";
import type { Tab } from "../types/workspace";

/**
 * Exports a tab's content to a file on disk
 * @param tab The tab to export
 * @param workspaceId ID of the workspace containing the tab
 * @returns Promise resolving to true if export succeeded, false otherwise
 */
export async function exportTab(
	tab: Tab,
	workspaceId: string,
): Promise<boolean> {
	try {
		const filePath = await save({
			defaultPath: tab.title,
			filters: [{ name: "Lua Files", extensions: ["lua"] }],
		});

		if (!filePath) {
			return false;
		}

		await invoke("export_tab", {
			workspaceId,
			title: tab.title,
			content: tab.content,
			targetPath: filePath,
		});

		return true;
	} catch (error) {
		console.error("Failed to export tab:", error);
		return false;
	}
}

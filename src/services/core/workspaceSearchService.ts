import { invoke } from "@tauri-apps/api/tauri";
import type { SearchResult } from "../../types/ui/workspaceSearch";

/**
 * Searches for tabs in a workspace that match the given query
 * @param workspaceId The ID of the workspace to search in
 * @param query The search query string
 * @returns A promise that resolves to an array of search results
 */
async function searchTabs(
	workspaceId: string,
	query: string,
): Promise<SearchResult[]> {
	return invoke<SearchResult[]>("search_tabs", {
		workspaceId,
		query,
	});
}

/**
 * Retrieves the content of a specific tab in a workspace
 * @param workspaceId The ID of the workspace containing the tab
 * @param tabId The ID of the tab to retrieve content from
 * @returns A promise that resolves to an object containing the tab content
 */
async function getTabContent(
	workspaceId: string,
	tabId: string,
): Promise<{ content: string }> {
	return invoke<{ content: string }>("get_tab_content", {
		workspaceId,
		tabId,
	}).catch(() => ({ content: "" }));
}

/**
 * Searches for tabs and enriches results with context lines before and after matches
 * @param workspaceId The ID of the workspace to search in
 * @param query The search query string
 * @returns A promise that resolves to an array of search results with context
 */
export async function getResultsWithContext(
	workspaceId: string,
	query: string,
): Promise<SearchResult[]> {
	const searchResults = await searchTabs(workspaceId, query);

	return Promise.all(
		searchResults.map(async (result) => {
			const tab = await getTabContent(workspaceId, result.tab_id);

			if (!tab.content) return result;

			const lines = tab.content.split("\n");
			const contextBefore = lines.slice(
				Math.max(0, result.line_number - 3),
				result.line_number - 1,
			);
			const contextAfter = lines.slice(
				result.line_number,
				result.line_number + 2,
			);

			return {
				...result,
				context: {
					before: contextBefore,
					after: contextAfter,
				},
			};
		}),
	);
}

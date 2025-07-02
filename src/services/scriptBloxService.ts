import { invoke } from "@tauri-apps/api/tauri";
import type {
	ScriptDetailResponse,
	ScriptSearchParams,
	ScriptSearchResponse,
} from "../types/scriptBlox";

/**
 * Searches for scripts on ScriptBlox
 * @param params Search parameters for filtering scripts
 * @returns Promise with search results
 * @throws Error if the search fails or returns invalid data
 */
export const searchScripts = async (
	params: ScriptSearchParams,
): Promise<ScriptSearchResponse> => {
	try {
		const response = await invoke<string>("search_scripts", {
			params: {
				q: params.q,
				page: params.page || 1,
				max: params.max || 20,
				mode: params.mode,
				patched: params.patched,
				key: params.key,
				universal: params.universal,
				verified: params.verified,
				sortBy: params.sortBy || "updatedAt",
				order: params.order || "desc",
				strict: params.strict ?? true,
			},
		});
		try {
			const parsed = JSON.parse(response);
			return parsed;
		} catch (parseError) {
			console.error("Failed to parse response:", response);
			throw new Error(
				`Invalid API response: ${
					parseError instanceof Error
						? parseError.message
						: "Unknown parse error"
				}`,
			);
		}
	} catch (error) {
		console.error("Backend request failed:", error);
		throw error instanceof Error ? error : new Error(String(error));
	}
};

/**
 * Retrieves script content by its slug
 * @param slug The script's unique identifier
 * @returns Promise with script details and content
 * @throws Error if the script cannot be fetched or returns invalid data
 */
export const getScriptContent = async (
	slug: string,
): Promise<ScriptDetailResponse> => {
	try {
		const response = await invoke<string>("get_script_content", {
			slug,
		});

		try {
			const parsed = JSON.parse(response);
			return parsed;
		} catch (parseError) {
			console.error("Failed to parse script content response:", response);
			throw new Error(
				`Invalid API response: ${
					parseError instanceof Error
						? parseError.message
						: "Unknown parse error"
				}`,
			);
		}
	} catch (error) {
		console.error("Failed to fetch script content:", error);
		throw error instanceof Error ? error : new Error(String(error));
	}
};

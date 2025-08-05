import { invoke } from "@tauri-apps/api/tauri";
import type {
    RScriptSearchParams,
    RScriptSearchResponse,
} from "../../types/core/rScripts";

/**
 * Searches for scripts on RScripts
 * @param params Search parameters for filtering scripts
 * @returns Promise with search results
 * @throws Error if the search fails or returns invalid data
 */
export const searchScripts = async (
    params: RScriptSearchParams,
): Promise<RScriptSearchResponse> => {
    try {
        const response = await invoke<string>("search_rscripts", {
            params: {
                page: params.page || 1,
                orderBy: params.orderBy || "date",
                sort: params.sort || "desc",
                q: params.q || "",
            },
        });
        try {
            return JSON.parse(response);
        } catch (_error) {
            throw new Error("Failed to parse API response");
        }
    } catch (error) {
        throw new Error(`Failed to search scripts: ${error}`);
    }
};

/**
 * Gets the content of a specific script
 * @param scriptId The ID of the script to retrieve
 * @returns Promise with script details and content
 * @throws Error if the script content cannot be retrieved
 */
export const getScriptContent = async (scriptId: string): Promise<string> => {
    try {
        const response = await invoke<string>("get_rscript_content", {
            scriptId,
        });
        return response;
    } catch (error) {
        throw new Error(`Failed to get script content: ${error}`);
    }
};

import {
    ScriptSearchParams,
    ScriptSearchResponse,
    ScriptDetailResponse,
} from "../types/scriptblox";
import { invoke } from "@tauri-apps/api/tauri";

export class ScriptBloxService {
    static async searchScripts(
        params: ScriptSearchParams
    ): Promise<ScriptSearchResponse> {
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
                    }`
                );
            }
        } catch (error) {
            console.error("Backend request failed:", error);
            throw error instanceof Error ? error : new Error(String(error));
        }
    }

    static async getScriptContent(slug: string): Promise<ScriptDetailResponse> {
        try {
            const response = await invoke<string>("get_script_content", {
                slug,
            });

            try {
                const parsed = JSON.parse(response);
                return parsed;
            } catch (parseError) {
                console.error(
                    "Failed to parse script content response:",
                    response
                );
                throw new Error(
                    `Invalid API response: ${
                        parseError instanceof Error
                            ? parseError.message
                            : "Unknown parse error"
                    }`
                );
            }
        } catch (error) {
            console.error("Failed to fetch script content:", error);
            throw error instanceof Error ? error : new Error(String(error));
        }
    }
}

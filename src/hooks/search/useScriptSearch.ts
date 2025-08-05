import { useCallback, useState } from "react";
import { searchScripts as searchRScripts } from "../../services/core/rScriptsService";
import type { RScript, RScriptSearchParams } from "../../types/core/rScripts";

/**
 * Hook for searching and managing script results
 * Handles loading states, errors, and pagination
 * Returns script search results and methods to perform searches
 */
export const useScriptSearch = () => {
    const [scripts, setScripts] = useState<RScript[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isApiDown, setIsApiDown] = useState(false);
    const [totalPages, setTotalPages] = useState(0);

    const searchScripts = useCallback(async (params: RScriptSearchParams) => {
        try {
            setIsLoading(true);
            setError(null);
            setIsApiDown(false);

            const response = await searchRScripts(params);
            setScripts(response.scripts);
            setTotalPages(response.info.maxPages);
        } catch (error) {
            console.error("Failed to search scripts:", error);
            if (error instanceof Error) {
                if (error.message.includes("Network error")) {
                    setIsApiDown(true);
                } else {
                    setError(error.message);
                }
            } else {
                setError("An unknown error occurred");
            }
            setScripts([]);
            setTotalPages(0);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        scripts,
        isLoading,
        error,
        isApiDown,
        totalPages,
        searchScripts,
    };
};

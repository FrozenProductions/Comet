import { useState, useEffect } from "react";
import { useSettings } from "./useSettings";

const RECENT_SEARCHES_KEY = "comet-recent-searches" as const;

/**
 * Hook for managing recent search history. Handles storing, retrieving and updating
 * recent searches in localStorage. Respects user settings for max items and whether
 * feature is enabled.
 * @returns Object containing recent searches array and methods to manage them
 */
export const useRecentSearches = () => {
    const { settings } = useSettings();
    const [recentSearches, setRecentSearches] = useState<string[]>([]);

    useEffect(() => {
        const savedSearches = localStorage.getItem(RECENT_SEARCHES_KEY);
        if (savedSearches) {
            try {
                const parsed = JSON.parse(savedSearches);
                setRecentSearches(
                    parsed.slice(0, settings.interface.recentSearches.maxItems),
                );
            } catch {
                setRecentSearches([]);
            }
        }
    }, [settings.interface.recentSearches.maxItems]);

    const addRecentSearch = (search: string) => {
        if (!settings.interface.recentSearches.enabled || !search.trim())
            return;

        setRecentSearches((prev) => {
            const filtered = prev.filter((s) => s !== search);
            const updated = [search, ...filtered].slice(
                0,
                settings.interface.recentSearches.maxItems,
            );
            localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
            return updated;
        });
    };

    const clearRecentSearches = () => {
        setRecentSearches([]);
        localStorage.removeItem(RECENT_SEARCHES_KEY);
    };

    return {
        recentSearches: settings.interface.recentSearches.enabled
            ? recentSearches
            : [],
        addRecentSearch,
        clearRecentSearches,
    };
};

import { useCallback } from "react";
import { useLocalStorage } from "../core/useLocalStorage";
import { useSettings } from "../core/useSettings";

const RECENT_SEARCHES_KEY = "comet-recent-searches" as const;

/**
 * Hook for managing recent search history
 * @returns Object containing recent searches array and methods to manage them
 */
export const useRecentSearches = () => {
	const { settings } = useSettings();
	const [recentSearches, setRecentSearches] = useLocalStorage<string[]>(
		RECENT_SEARCHES_KEY,
		[],
	);

	const addRecentSearch = useCallback(
		(search: string) => {
			if (!settings.interface.recentSearches.enabled || !search.trim()) return;

			setRecentSearches((prev) => {
				const filtered = prev.filter((s) => s !== search);
				return [search, ...filtered].slice(
					0,
					settings.interface.recentSearches.maxItems,
				);
			});
		},
		[
			settings.interface.recentSearches.enabled,
			settings.interface.recentSearches.maxItems,
			setRecentSearches,
		],
	);

	const clearRecentSearches = useCallback(() => {
		setRecentSearches([]);
	}, [setRecentSearches]);

	return {
		recentSearches: settings.interface.recentSearches.enabled
			? recentSearches.slice(0, settings.interface.recentSearches.maxItems)
			: [],
		addRecentSearch,
		clearRecentSearches,
	};
};

import { useState, useCallback, useRef, useEffect } from "react";
import { ScriptSearchParams, ScriptSearchState } from "../types/scriptBlox";
import { searchScripts as searchScriptsService } from "../services/scriptBloxService";

/**
 * Hook for managing script search functionality with debounced API calls.
 * Handles searching scripts through ScriptBlox API, manages loading states,
 * error handling, and pagination. Includes built-in request cancellation
 * and API health detection.
 * @param debounceMs Delay in milliseconds before executing search after input changes
 * @returns Object containing search state and search function
 */
export const useScriptSearch = (debounceMs = 300) => {
	const [state, setState] = useState<ScriptSearchState>({
		scripts: [],
		isLoading: false,
		isSearching: false,
		error: null,
		isApiDown: false,
		totalPages: 0,
		currentPage: 1,
	});

	const searchTimeoutRef = useRef<NodeJS.Timeout>();
	const abortControllerRef = useRef<AbortController>();

	const isApiError = (error: unknown): boolean => {
		if (error instanceof Error) {
			const message = error.message.toLowerCase();
			return (
				message.includes("500") ||
				message.includes("internal server error") ||
				message.includes("failed to fetch") ||
				message.includes("network") ||
				message.includes("nginx")
			);
		}
		return false;
	};

	const searchScripts = useCallback(
		async (params: ScriptSearchParams) => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}

			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}

			setState((prev) => ({
				...prev,
				isSearching: true,
				error: null,
				isApiDown: false,
			}));

			searchTimeoutRef.current = setTimeout(async () => {
				try {
					abortControllerRef.current = new AbortController();
					setState((prev) => ({ ...prev, isLoading: true }));

					const response = await searchScriptsService(params);
					setState({
						scripts: response.result.scripts || [],
						isLoading: false,
						isSearching: false,
						error: null,
						isApiDown: false,
						totalPages: response.result.totalPages,
						currentPage: params.page || 1,
					});
				} catch (error) {
					if (error instanceof Error && error.name === "AbortError") {
						return;
					}

					const isDown = isApiError(error);
					setState((prev) => ({
						...prev,
						scripts: [],
						isLoading: false,
						isSearching: false,
						isApiDown: isDown,
						error: isDown
							? "The ScriptBlox API is currently unavailable. Please try again later."
							: error instanceof Error
								? error.message
								: "An error occurred while fetching scripts",
					}));
				}
			}, debounceMs);
		},
		[debounceMs],
	);

	useEffect(() => {
		return () => {
			if (searchTimeoutRef.current) {
				clearTimeout(searchTimeoutRef.current);
			}
			if (abortControllerRef.current) {
				abortControllerRef.current.abort();
			}
		};
	}, []);

	return {
		...state,
		searchScripts,
	};
};

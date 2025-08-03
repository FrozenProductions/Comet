import { invoke } from "@tauri-apps/api/tauri";
import type { Suggestion } from "../../types/core/editor";

/**
 * Service for managing code suggestions
 * Implements singleton pattern to ensure single instance
 */
class SuggestionService {
	private static instance: SuggestionService;
	private suggestions: Suggestion[] = [];
	private isLoading = false;

	private constructor() {}

	/**
	 * Gets the singleton instance of SuggestionService
	 * Creates new instance if one doesn't exist
	 */
	public static getInstance(): SuggestionService {
		if (!SuggestionService.instance) {
			SuggestionService.instance = new SuggestionService();
		}
		return SuggestionService.instance;
	}

	/**
	 * Loads code suggestions from backend if not already loaded
	 * Sets loading state while fetching
	 */
	public async loadSuggestions(): Promise<void> {
		if (this.suggestions.length > 0 || this.isLoading) return;

		this.isLoading = true;
		try {
			const suggestions = await invoke<Suggestion[]>("fetch_suggestions");
			this.suggestions = suggestions;
		} catch (error) {
			console.error("Failed to load suggestions:", error);
		} finally {
			this.isLoading = false;
		}
	}

	/**
	 * Returns the currently loaded suggestions
	 */
	public getSuggestions(): Suggestion[] {
		return this.suggestions;
	}
}

export const suggestionService = SuggestionService.getInstance();

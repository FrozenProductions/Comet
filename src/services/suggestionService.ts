import { invoke } from "@tauri-apps/api/tauri";
import type { Suggestion } from "../types/editor";

class SuggestionService {
	private static instance: SuggestionService;
	private suggestions: Suggestion[] = [];
	private isLoading = false;

	private constructor() {}

	public static getInstance(): SuggestionService {
		if (!SuggestionService.instance) {
			SuggestionService.instance = new SuggestionService();
		}
		return SuggestionService.instance;
	}

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

	public getSuggestions(): Suggestion[] {
		return this.suggestions;
	}
}

export const suggestionService = SuggestionService.getInstance();

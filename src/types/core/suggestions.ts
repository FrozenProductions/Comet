export interface SuggestionItem {
    label: string;
    detail: string;
    documentation: string;
}

export interface SuggestionsData {
    function: SuggestionItem[];
    property: SuggestionItem[];
    class: SuggestionItem[];
    method: SuggestionItem[];
}
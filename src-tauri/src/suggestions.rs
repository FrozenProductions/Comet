use serde::{Deserialize, Serialize};
use reqwest::Client;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct Suggestion {
    pub label: String,
    pub detail: String,
    pub documentation: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SuggestionResponse {
    #[serde(rename = "function")]
    pub functions: Vec<Suggestion>,
    pub property: Vec<Suggestion>,
    pub class: Vec<Suggestion>,
    pub method: Vec<Suggestion>,
}

#[derive(Debug, Serialize)]
pub struct TypedSuggestion {
    pub label: String,
    pub detail: String,
    pub documentation: String,
    #[serde(rename = "type")]
    pub suggestion_type: String,
}

#[tauri::command]
pub async fn fetch_suggestions() -> Result<Vec<TypedSuggestion>, String> {
    let client = Client::new();
    let response = client
        .get("https://www.comet-ui.fun/api/v1/suggestions")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let data: SuggestionResponse = response
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let mut suggestions = Vec::new();

    suggestions.extend(data.functions.into_iter().map(|s| TypedSuggestion {
        label: s.label,
        detail: s.detail,
        documentation: s.documentation,
        suggestion_type: "function".to_string(),
    }));

    suggestions.extend(data.property.into_iter().map(|s| TypedSuggestion {
        label: s.label,
        detail: s.detail,
        documentation: s.documentation,
        suggestion_type: "property".to_string(),
    }));

    suggestions.extend(data.class.into_iter().map(|s| TypedSuggestion {
        label: s.label,
        detail: s.detail,
        documentation: s.documentation,
        suggestion_type: "class".to_string(),
    }));

    suggestions.extend(data.method.into_iter().map(|s| TypedSuggestion {
        label: s.label,
        detail: s.detail,
        documentation: s.documentation,
        suggestion_type: "method".to_string(),
    }));

    Ok(suggestions)
} 
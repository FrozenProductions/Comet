use reqwest::Client;
use serde::Deserialize;
use serde_json::Value;
use tauri;

#[derive(Debug, Deserialize)]
pub struct RScriptSearchParams {
    pub page: Option<u32>,
    pub order_by: Option<String>,
    pub sort: Option<String>,
    pub q: Option<String>,
}

#[tauri::command]
pub async fn search_rscripts(params: RScriptSearchParams) -> Result<String, String> {
    let client = Client::new();
    let mut url =
        reqwest::Url::parse("https://rscripts.net/api/v2/scripts").map_err(|e| e.to_string())?;

    if let Some(page) = params.page {
        url.query_pairs_mut().append_pair("page", &page.to_string());
    }
    if let Some(order_by) = params.order_by {
        url.query_pairs_mut().append_pair("orderBy", &order_by);
    }
    if let Some(sort) = params.sort {
        url.query_pairs_mut().append_pair("sort", &sort);
    }
    if let Some(query) = params.q {
        url.query_pairs_mut().append_pair("q", &query);
    }

    let response = client
        .get(url)
        .header("Accept", "application/json")
        .header("Content-Type", "application/json")
        .header(
            "User-Agent",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        )
        .send()
        .await
        .map_err(|e| e.to_string())?;

    response.text().await.map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_rscript_content(script_id: String) -> Result<String, String> {
    let client = Client::new();

    let mut url =
        reqwest::Url::parse("https://rscripts.net/api/v2/script").map_err(|e| e.to_string())?;
    url.query_pairs_mut().append_pair("id", &script_id);

    let response = client
        .get(url)
        .header("Accept", "application/json")
        .header("Content-Type", "application/json")
        .header(
            "User-Agent",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        )
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let script_data = response.text().await.map_err(|e| e.to_string())?;

    let script_json: Value = serde_json::from_str(&script_data).map_err(|e| e.to_string())?;
    let raw_script_url = script_json
        .get("script")
        .and_then(|s| s.get(0))
        .and_then(|s| s.get("rawScript"))
        .and_then(|u| u.as_str())
        .ok_or_else(|| "Failed to get raw script URL".to_string())?;

    let raw_content = client
        .get(raw_script_url)
        .header(
            "User-Agent",
            "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
        )
        .send()
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;

    Ok(raw_content)
}

use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use serde_json::{Value, Map};

#[derive(Debug, Serialize, Deserialize)]
pub struct FastFlagsResponse {
    pub success: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub flags: Option<Map<String, Value>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub error: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FastFlagOption {
    pub label: String,
    pub value: String,
    pub description: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FastFlagDefinition {
    pub key: String,
    pub label: String,
    pub description: Option<String>,
    #[serde(rename = "type")]
    pub flag_type: String,
    pub default_value: Value,
    pub options: Option<Vec<FastFlagOption>>,
    pub min: Option<i64>,
    pub max: Option<i64>,
    pub step: Option<i64>,
    pub related_flags: Option<Value>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FastFlagCategory {
    pub id: String,
    pub label: String,
    pub description: Option<String>,
    pub flags: Vec<FastFlagDefinition>,
}

fn get_fast_flags_path() -> Result<PathBuf, String> {
    let path = PathBuf::from("/Applications/Roblox.app/Contents/MacOS/ClientSettings/ClientAppSettings.json");
    Ok(path)
}

fn ensure_client_settings_dir() -> Result<(), String> {
    let dir = PathBuf::from("/Applications/Roblox.app/Contents/MacOS/ClientSettings");
    if !dir.exists() {
        fs::create_dir_all(&dir)
            .map_err(|e| format!("Failed to create settings directory: {}", e))?;
    }
    Ok(())
}

#[tauri::command]
pub async fn save_fast_flags(flags: Map<String, Value>) -> FastFlagsResponse {
    match save_fast_flags_internal(flags).await {
        Ok(()) => {
            FastFlagsResponse {
                success: true,
                flags: None,
                error: None,
            }
        }
        Err(e) => {
            FastFlagsResponse {
                success: false,
                flags: None,
                error: Some(e.to_string()),
            }
        }
    }
}

async fn save_fast_flags_internal(flags: Map<String, Value>) -> Result<(), String> {
    let flags_path = get_fast_flags_path()?;

    ensure_client_settings_dir()?;

    let formatted_flags: Map<String, Value> = flags
        .into_iter()
        .filter_map(|(k, v)| {
            match v {
                Value::Null => None,
                Value::String(s) if s.is_empty() => None,
                Value::String(s) => {
                    let value = if s.eq_ignore_ascii_case("true") {
                        Value::Bool(true)
                    } else if s.eq_ignore_ascii_case("false") {
                        Value::Bool(false)
                    } else if let Ok(num) = s.parse::<i64>() {
                        Value::Number(num.into())
                    } else {
                        Value::String(s)
                    };
                    Some((k, value))
                }
                _ => Some((k, v)),
            }
        })
        .collect();

    let content = if formatted_flags.is_empty() {
        "{}".to_string()
    } else {
        serde_json::to_string_pretty(&formatted_flags)
            .map_err(|e| format!("Failed to serialize flags: {}", e))?
    };

    fs::write(&flags_path, content)
        .map_err(|e| format!("Failed to write flags file: {}", e))?;

    Ok(())
}

#[tauri::command]
pub async fn cleanup_fast_flags() -> FastFlagsResponse {
    let flags_path = match get_fast_flags_path() {
        Ok(path) => path,
        Err(e) => return FastFlagsResponse {
            success: false,
            flags: None,
            error: Some(e),
        },
    };

    match ensure_client_settings_dir() {
        Ok(_) => (),
        Err(e) => return FastFlagsResponse {
            success: false,
            flags: None,
            error: Some(e),
        },
    }

    match fs::write(&flags_path, "{}") {
        Ok(_) => FastFlagsResponse {
            success: true,
            flags: None,
            error: None,
        },
        Err(e) => FastFlagsResponse {
            success: false,
            flags: None,
            error: Some(format!("Failed to write flags file: {}", e)),
        },
    }
}

#[tauri::command]
pub async fn open_fast_flags_directory() -> Result<(), String> {
    let path = PathBuf::from("/Applications/Roblox.app/Contents/MacOS/ClientSettings");
    crate::open_directory(path)
}

#[tauri::command]
pub async fn get_fast_flag_categories() -> Result<Value, String> {
    let client = reqwest::Client::new();
    let response = client
        .get("https://www.comet-ui.fun/api/v1/fastflags")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err(format!("API error: {}", response.status()));
    }

    let categories: Value = response
        .json()
        .await
        .map_err(|e| e.to_string())?;

    Ok(categories)
} 
use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use serde_json::{Value, Map};
use crate::logging::LogEntry;
use tauri::Manager;

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
pub async fn save_fast_flags(app_handle: tauri::AppHandle, flags: Map<String, Value>) -> FastFlagsResponse {
    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Saving fast flags".to_string(),
        details: Some(serde_json::json!({
            "flag_count": flags.len()
        })),
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    match save_fast_flags_internal(flags).await {
        Ok(()) => {
            let log_entry = LogEntry {
                timestamp: chrono::Local::now().to_rfc3339(),
                level: "info".to_string(),
                message: "Fast flags saved successfully".to_string(),
                details: None,
            };
            if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
                if let Ok(logger) = logger.lock() {
                    let _ = logger.write_entry(log_entry);
                }
            }
            FastFlagsResponse {
                success: true,
                flags: None,
                error: None,
            }
        }
        Err(e) => {
            let log_entry = LogEntry {
                timestamp: chrono::Local::now().to_rfc3339(),
                level: "error".to_string(),
                message: "Failed to save fast flags".to_string(),
                details: Some(serde_json::json!({
                    "error": e
                })),
            };
            if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
                if let Ok(logger) = logger.lock() {
                    let _ = logger.write_entry(log_entry);
                }
            }
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
pub async fn cleanup_fast_flags(app_handle: tauri::AppHandle) -> FastFlagsResponse {
    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Cleaning up fast flags".to_string(),
        details: None,
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    let flags_path = match get_fast_flags_path() {
        Ok(path) => path,
        Err(e) => {
            let log_entry = LogEntry {
                timestamp: chrono::Local::now().to_rfc3339(),
                level: "error".to_string(),
                message: "Failed to get fast flags path".to_string(),
                details: Some(serde_json::json!({
                    "error": e
                })),
            };
            if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
                if let Ok(logger) = logger.lock() {
                    let _ = logger.write_entry(log_entry);
                }
            }
            return FastFlagsResponse {
                success: false,
                flags: None,
                error: Some(e),
            };
        }
    };

    match ensure_client_settings_dir() {
        Ok(_) => (),
        Err(e) => {
            let log_entry = LogEntry {
                timestamp: chrono::Local::now().to_rfc3339(),
                level: "error".to_string(),
                message: "Failed to ensure client settings directory".to_string(),
                details: Some(serde_json::json!({
                    "error": e
                })),
            };
            if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
                if let Ok(logger) = logger.lock() {
                    let _ = logger.write_entry(log_entry);
                }
            }
            return FastFlagsResponse {
                success: false,
                flags: None,
                error: Some(e),
            };
        }
    }

    match fs::write(&flags_path, "{}") {
        Ok(_) => {
            let log_entry = LogEntry {
                timestamp: chrono::Local::now().to_rfc3339(),
                level: "info".to_string(),
                message: "Fast flags cleaned up successfully".to_string(),
                details: None,
            };
            if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
                if let Ok(logger) = logger.lock() {
                    let _ = logger.write_entry(log_entry);
                }
            }
            FastFlagsResponse {
                success: true,
                flags: None,
                error: None,
            }
        }
        Err(e) => {
            let error_msg = format!("Failed to write flags file: {}", e);
            let log_entry = LogEntry {
                timestamp: chrono::Local::now().to_rfc3339(),
                level: "error".to_string(),
                message: error_msg.clone(),
                details: Some(serde_json::json!({
                    "path": flags_path.to_string_lossy()
                })),
            };
            if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
                if let Ok(logger) = logger.lock() {
                    let _ = logger.write_entry(log_entry);
                }
            }
            FastFlagsResponse {
                success: false,
                flags: None,
                error: Some(error_msg),
            }
        }
    }
}

#[tauri::command]
pub async fn open_fast_flags_directory() -> Result<(), String> {
    let path = PathBuf::from("/Applications/Roblox.app/Contents/MacOS/ClientSettings");
    crate::open_directory(path)
}

#[tauri::command]
pub async fn get_fast_flag_categories(app_handle: tauri::AppHandle) -> Result<Value, String> {
    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Fetching fast flag categories".to_string(),
        details: None,
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    let client = reqwest::Client::new();
    let response = client
        .get("https://www.comet-ui.fun/api/v1/fastflags")
        .send()
        .await
        .map_err(|e| {
            let error_msg = e.to_string();
            let log_entry = LogEntry {
                timestamp: chrono::Local::now().to_rfc3339(),
                level: "error".to_string(),
                message: "Failed to fetch fast flag categories".to_string(),
                details: Some(serde_json::json!({
                    "error": error_msg
                })),
            };
            if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
                if let Ok(logger) = logger.lock() {
                    let _ = logger.write_entry(log_entry);
                }
            }
            error_msg
        })?;

    if !response.status().is_success() {
        let error_msg = format!("API error: {}", response.status());
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: "API error when fetching fast flag categories".to_string(),
            details: Some(serde_json::json!({
                "status": response.status().as_u16(),
                "error": error_msg
            })),
        };
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            if let Ok(logger) = logger.lock() {
                let _ = logger.write_entry(log_entry);
            }
        }
        return Err(error_msg);
    }

    let categories: Value = response
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Successfully fetched fast flag categories".to_string(),
        details: None,
    };
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    Ok(categories)
} 
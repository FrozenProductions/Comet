use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::api::path::config_dir;
use crate::logging::LogEntry;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionRecord {
    pub id: String,
    pub timestamp: i64,
    pub content: String,
    pub success: bool,
    pub error: Option<String>,
}

fn get_comet_dir() -> PathBuf {
    let base_dir = config_dir().expect("Failed to get Application Support directory");
    let mut app_dir = base_dir;
    app_dir.push("com.comet.dev");
    fs::create_dir_all(&app_dir).expect("Failed to create directory");
    app_dir
}

fn get_execution_history_dir() -> PathBuf {
    let mut path = get_comet_dir();
    path.push("execution_history");
    fs::create_dir_all(&path).expect("Failed to create directory");
    path
}

fn get_execution_history_file() -> PathBuf {
    let mut path = get_execution_history_dir();
    path.push("history.json");
    path
}

#[tauri::command]
pub async fn load_execution_history(app_handle: tauri::AppHandle) -> Result<Vec<ExecutionRecord>, String> {
    let history_file = get_execution_history_file();
    
    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Loading execution history".to_string(),
        details: Some(serde_json::json!({
            "file_path": history_file.to_string_lossy()
        })),
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    if history_file.exists() {
        let content = fs::read_to_string(history_file).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        Ok(Vec::new())
    }
}

#[tauri::command]
pub async fn save_execution_record(app_handle: tauri::AppHandle, record: ExecutionRecord) -> Result<(), String> {
    let history_file = get_execution_history_file();
    let mut history = if history_file.exists() {
        let content = fs::read_to_string(&history_file).map_err(|e| e.to_string())?;
        serde_json::from_str::<Vec<ExecutionRecord>>(&content).unwrap_or_default()
    } else {
        Vec::new()
    };

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Saving execution record".to_string(),
        details: Some(serde_json::json!({
            "record_id": record.id,
            "success": record.success,
            "timestamp": record.timestamp
        })),
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    history.insert(0, record);

    if history.len() > 100 {
        history.truncate(100);
    }

    let content = serde_json::to_string_pretty(&history).map_err(|e| e.to_string())?;
    fs::write(history_file, content).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn clear_execution_history(app_handle: tauri::AppHandle) -> Result<(), String> {
    let history_file = get_execution_history_file();
    
    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Clearing execution history".to_string(),
        details: Some(serde_json::json!({
            "file_path": history_file.to_string_lossy()
        })),
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    if history_file.exists() {
        fs::write(history_file, "[]").map_err(|e| e.to_string())?;
    }

    Ok(())
} 
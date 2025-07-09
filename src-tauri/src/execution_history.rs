use std::fs;
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::api::path::config_dir;

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
pub async fn load_execution_history() -> Result<Vec<ExecutionRecord>, String> {
    let history_file = get_execution_history_file();
    
    if history_file.exists() {
        let content = fs::read_to_string(history_file).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        Ok(Vec::new())
    }
}

#[tauri::command]
pub async fn save_execution_record(record: ExecutionRecord, max_items: usize) -> Result<(), String> {
    let history_file = get_execution_history_file();
    let mut history = if history_file.exists() {
        let content = fs::read_to_string(&history_file).map_err(|e| e.to_string())?;
        serde_json::from_str::<Vec<ExecutionRecord>>(&content).unwrap_or_default()
    } else {
        Vec::new()
    };

    history.insert(0, record);

    if history.len() > max_items {
        history.truncate(max_items);
    }

    let content = serde_json::to_string_pretty(&history).map_err(|e| e.to_string())?;
    fs::write(history_file, content).map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
pub async fn clear_execution_history() -> Result<(), String> {
    let history_file = get_execution_history_file();
    
    if history_file.exists() {
        fs::write(history_file, "[]").map_err(|e| e.to_string())?;
    }

    Ok(())
} 
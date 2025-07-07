use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};
use crate::workspace::get_workspace_tabs_dir;
use crate::logging::LogEntry;
use sha2::{Sha256, Digest};
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tab {
    pub id: String,
    pub title: String,
    pub content: String,
    pub language: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabMetadata {
    pub id: String,
    pub title: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabState {
    pub active_tab: Option<String>,
    pub tab_order: Vec<String>,
    pub tab_metadata: Vec<TabMetadata>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct SearchResult {
    pub tab_id: String,
    pub title: String,
    pub line_number: usize,
    pub line_content: String,
    pub column_start: usize,
    pub column_end: usize,
}

fn get_state_file(workspace_id: &str) -> PathBuf {
    let mut path = get_workspace_tabs_dir(workspace_id);
    path.push("state.json");
    path
}

fn read_file_content(path: &Path) -> Result<String, String> {
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut content = String::new();
    file.read_to_string(&mut content).map_err(|e| e.to_string())?;
    Ok(content)
}

fn sanitize_filename(name: &str) -> String {
    let mut name = name.trim().to_string();
    
    if name.to_lowercase().ends_with(".lua") {
        name = name[..name.len() - 4].to_string();
    }

    let sanitized = name
        .chars()
        .map(|c| {
            if c.is_alphanumeric() || c == ' ' || c == '_' || c == '-' {
                c
            } else {
                '_'
            }
        })
        .collect::<String>();

    let sanitized = sanitized
        .split_whitespace()
        .collect::<Vec<&str>>()
        .join(" ");

    let mut sanitized = if sanitized.len() > 100 {
        sanitized.chars().take(100).collect::<String>().trim().to_string()
    } else {
        sanitized.trim().to_string()
    };

    if !sanitized.is_empty() {
        sanitized.push_str(".lua");
    } else {
        sanitized = "untitled.lua".to_string();
    }

    sanitized
}

fn get_tab_id_from_title(title: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(title.as_bytes());
    format!("{:x}", hasher.finalize())
}

#[tauri::command]
pub async fn save_tab(app_handle: tauri::AppHandle, workspace_id: String, tab: Tab) -> Result<(), String> {
    let tabs_dir = get_workspace_tabs_dir(&workspace_id);
    let filename = sanitize_filename(&tab.title);
    let file_path = tabs_dir.join(&filename);
    
    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: format!("Saving tab: {}", tab.title),
        details: Some(serde_json::json!({
            "workspace_id": workspace_id,
            "tab_id": tab.id,
            "file_path": file_path.to_string_lossy()
        })),
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    fs::write(&file_path, &tab.content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_tab(app_handle: tauri::AppHandle, workspace_id: String, title: String) -> Result<(), String> {
    let tabs_dir = get_workspace_tabs_dir(&workspace_id);
    let filename = sanitize_filename(&title);
    let file_path = tabs_dir.join(&filename);
    
    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: format!("Deleting tab: {}", title),
        details: Some(serde_json::json!({
            "workspace_id": workspace_id,
            "file_path": file_path.to_string_lossy()
        })),
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }
    
    if file_path.exists() {
        fs::remove_file(file_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn save_tab_state(app_handle: tauri::AppHandle, workspace_id: String, active_tab: Option<String>, tab_order: Vec<String>, tabs: Vec<Tab>) -> Result<(), String> {
    let state = TabState {
        active_tab: active_tab.clone(),
        tab_order: tab_order.clone(),
        tab_metadata: tabs.into_iter().map(|tab| TabMetadata {
            id: tab.id,
            title: tab.title,
        }).collect(),
    };

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Saving tab state".to_string(),
        details: Some(serde_json::json!({
            "workspace_id": workspace_id,
            "active_tab": active_tab,
            "tab_count": tab_order.len()
        })),
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    let state_file = get_state_file(&workspace_id);
    fs::write(state_file, serde_json::to_string_pretty(&state).unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load_tabs(workspace_id: String) -> Result<Vec<Tab>, String> {
    let tabs_dir = get_workspace_tabs_dir(&workspace_id);
    let state_file = get_state_file(&workspace_id);
    
    let mut tabs = Vec::new();
    let tab_state: Option<TabState> = if state_file.exists() {
        let content = fs::read_to_string(&state_file).ok();
        content.and_then(|c| serde_json::from_str(&c).ok())
    } else {
        None
    };

    if let Ok(entries) = fs::read_dir(&tabs_dir) {
        for entry in entries.flatten() {
            let path = entry.path();
            if path.is_file() && path.extension().map_or(false, |ext| ext == "lua") {
                if let Ok(content) = read_file_content(&path) {
                    let title = path.file_name()
                        .unwrap_or_default()
                        .to_string_lossy()
                        .into_owned();
                    
                    let id = if let Some(state) = &tab_state {
                        state.tab_metadata.iter()
                            .find(|meta| meta.title == title)
                            .map(|meta| meta.id.clone())
                            .unwrap_or_else(|| get_tab_id_from_title(&format!("{}_{}", workspace_id, title)))
                    } else {
                        get_tab_id_from_title(&format!("{}_{}", workspace_id, title))
                    };

                    tabs.push(Tab {
                        id,
                        title,
                        content,
                        language: "lua".to_string(),
                    });
                }
            }
        }
    }

    if let Some(state) = tab_state {
        tabs.sort_by_key(|tab| {
            state.tab_order.iter()
                .position(|id| id == &tab.id)
                .unwrap_or(usize::MAX)
        });
    }

    if tabs.is_empty() {
        let default_title = "untitled.lua";
        let id = get_tab_id_from_title(&format!("{}_{}", workspace_id, default_title));
        tabs.push(Tab {
            id,
            title: default_title.to_string(),
            content: "-- New File\n".to_string(),
            language: "lua".to_string(),
        });
    }

    Ok(tabs)
}

#[tauri::command]
pub async fn get_tab_state(workspace_id: String) -> Result<TabState, String> {
    let state_file = get_state_file(&workspace_id);
    
    if state_file.exists() {
        let content = fs::read_to_string(state_file).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        let default_title = "untitled.lua";
        let default_id = get_tab_id_from_title(&format!("{}_{}", workspace_id, default_title));
        Ok(TabState {
            active_tab: Some(default_id.clone()),
            tab_order: vec![default_id],
            tab_metadata: vec![TabMetadata {
                id: get_tab_id_from_title(&format!("{}_{}", workspace_id, default_title)),
                title: default_title.to_string(),
            }],
        })
    }
}

#[tauri::command]
pub async fn rename_tab(app_handle: tauri::AppHandle, workspace_id: String, old_title: String, new_title: String) -> Result<(), String> {
    let tabs_dir = get_workspace_tabs_dir(&workspace_id);
    let old_filename = sanitize_filename(&old_title);
    let new_filename = sanitize_filename(&new_title);
    let old_path = tabs_dir.join(&old_filename);
    let new_path = tabs_dir.join(&new_filename);

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: format!("Renaming tab: {} -> {}", old_title, new_title),
        details: Some(serde_json::json!({
            "workspace_id": workspace_id,
            "old_path": old_path.to_string_lossy(),
            "new_path": new_path.to_string_lossy()
        })),
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    if !old_path.exists() {
        return Err("Source file does not exist".to_string());
    }

    fs::rename(old_path, new_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn export_tab(app_handle: tauri::AppHandle, workspace_id: String, title: String, content: String, target_path: String) -> Result<(), String> {
    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: format!("Exporting tab: {} to {}", title, target_path),
        details: Some(serde_json::json!({
            "workspace_id": workspace_id,
            "title": title,
            "target_path": target_path
        })),
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    fs::write(target_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn search_tabs(workspace_id: String, query: String) -> Result<Vec<SearchResult>, String> {
    if query.trim().is_empty() {
        return Ok(Vec::new());
    }

    let tabs = load_tabs(workspace_id).await?;
    let mut results = Vec::new();
    let query = query.to_lowercase();

    for tab in tabs {
        for (line_idx, line) in tab.content.lines().enumerate() {
            let line_lower = line.to_lowercase();
            if let Some(column_start) = line_lower.find(&query) {
                results.push(SearchResult {
                    tab_id: tab.id.clone(),
                    title: tab.title.clone(),
                    line_number: line_idx + 1,
                    line_content: line.to_string(),
                    column_start,
                    column_end: column_start + query.len(),
                });
            }
        }
    }

    Ok(results)
} 
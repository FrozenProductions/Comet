use std::fs::{self, File};
use std::io::Read;
use std::path::Path;
use serde::{Deserialize, Serialize};
use dirs;
use crate::logging::LogEntry;
use tauri::Manager;

const VALID_EXTENSIONS: [&str; 3] = [".lua", ".luau", ".txt"];

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AutoExecuteFile {
    pub name: String,
    pub content: String,
    pub path: String,
}

fn read_file_content(path: &Path) -> Result<String, String> {
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut content = Vec::new();
    file.read_to_end(&mut content).map_err(|e| e.to_string())?;

    let content_clone = content.clone();
    String::from_utf8(content)
        .or_else::<String, _>(|_| {
            Ok(content_clone.iter().map(|&b| b as char).collect::<String>())
        })
        .map_err(|e| e.to_string())
}

fn is_valid_script_file(path: &Path) -> bool {
    if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
        if name.starts_with(".") || name == ".DS_Store" {
            return false;
        }
        return VALID_EXTENSIONS.iter().any(|ext| name.ends_with(ext));
    }
    false
}

fn ensure_valid_extension(name: &str) -> String {
    if VALID_EXTENSIONS.iter().any(|ext| name.ends_with(ext)) {
        name.to_string()
    } else {
        format!("{}.lua", name)
    }
}

#[tauri::command]
pub fn get_auto_execute_files(app_handle: tauri::AppHandle) -> Result<Vec<AutoExecuteFile>, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let auto_execute_dir = home.join("Hydrogen/autoexecute");

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Loading auto-execute files".to_string(),
        details: Some(serde_json::json!({
            "directory": auto_execute_dir.to_string_lossy()
        })),
    };
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    if !auto_execute_dir.exists() {
        fs::create_dir_all(&auto_execute_dir).map_err(|e| e.to_string())?;
    }

    let entries = fs::read_dir(&auto_execute_dir).map_err(|e| e.to_string())?;
    let mut files = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();
        
        if path.is_file() && is_valid_script_file(&path) {
            if let Ok(content) = read_file_content(&path) {
                files.push(AutoExecuteFile {
                    name: path.file_name()
                        .ok_or("Invalid filename")?
                        .to_string_lossy()
                        .into_owned(),
                    content,
                    path: path.to_string_lossy().into_owned(),
                });
            }
        }
    }
    files.sort_by(|a, b| a.name.to_lowercase().cmp(&b.name.to_lowercase()));

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Auto-execute files loaded".to_string(),
        details: Some(serde_json::json!({
            "file_count": files.len()
        })),
    };
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    Ok(files)
}

#[tauri::command]
pub fn save_auto_execute_file(app_handle: tauri::AppHandle, name: String, content: String) -> Result<(), String> {
    let file_name = ensure_valid_extension(&name);
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let file_path = home.join("Hydrogen/autoexecute").join(&file_name);

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: format!("Saving auto-execute file: {}", file_name),
        details: Some(serde_json::json!({
            "path": file_path.to_string_lossy()
        })),
    };
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    fs::write(&file_path, &content).map_err(|e| {
        let error_msg = e.to_string();
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: "Failed to save auto-execute file".to_string(),
            details: Some(serde_json::json!({
                "path": file_path.to_string_lossy(),
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
    Ok(())
}

#[tauri::command]
pub fn delete_auto_execute_file(app_handle: tauri::AppHandle, name: String) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let file_path = home.join("Hydrogen/autoexecute").join(&name);

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: format!("Deleting auto-execute file: {}", name),
        details: Some(serde_json::json!({
            "path": file_path.to_string_lossy()
        })),
    };
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    if !file_path.exists() {
        return Ok(());
    }

    fs::remove_file(&file_path).map_err(|e| {
        let error_msg = e.to_string();
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: "Failed to delete auto-execute file".to_string(),
            details: Some(serde_json::json!({
                "path": file_path.to_string_lossy(),
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
    Ok(())
}

#[tauri::command]
pub fn rename_auto_execute_file(app_handle: tauri::AppHandle, old_name: String, new_name: String) -> Result<(), String> {
    let new_file_name = ensure_valid_extension(&new_name);
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let old_path = home.join("Hydrogen/autoexecute").join(&old_name);
    let new_path = home.join("Hydrogen/autoexecute").join(&new_file_name);

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: format!("Renaming auto-execute file: {} -> {}", old_name, new_file_name),
        details: Some(serde_json::json!({
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
        let error_msg = "Source file does not exist".to_string();
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: error_msg.clone(),
            details: Some(serde_json::json!({
                "path": old_path.to_string_lossy()
            })),
        };
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            if let Ok(logger) = logger.lock() {
                let _ = logger.write_entry(log_entry);
            }
        }
        return Err(error_msg);
    }

    if new_path.exists() {
        let error_msg = "A file with that name already exists".to_string();
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: error_msg.clone(),
            details: Some(serde_json::json!({
                "path": new_path.to_string_lossy()
            })),
        };
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            if let Ok(logger) = logger.lock() {
                let _ = logger.write_entry(log_entry);
            }
        }
        return Err(error_msg);
    }

    fs::rename(&old_path, &new_path).map_err(|e| {
        let error_msg = e.to_string();
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: "Failed to rename auto-execute file".to_string(),
            details: Some(serde_json::json!({
                "old_path": old_path.to_string_lossy(),
                "new_path": new_path.to_string_lossy(),
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
    Ok(())
}

#[tauri::command]
pub fn open_auto_execute_directory(app_handle: tauri::AppHandle) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let auto_execute_dir = home.join("Hydrogen/autoexecute");

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Opening auto-execute directory".to_string(),
        details: Some(serde_json::json!({
            "path": auto_execute_dir.to_string_lossy()
        })),
    };
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    crate::open_directory(auto_execute_dir)
} 
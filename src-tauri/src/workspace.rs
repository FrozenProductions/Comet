use std::fs;
use std::path::{PathBuf};
use serde::{Deserialize, Serialize};
use tauri::api::path::config_dir;
use crate::logging::LogEntry;
use tauri::Manager;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub path: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkspaceState {
    pub active_workspace: Option<String>,
    pub workspaces: Vec<Workspace>,
}

fn get_workspaces_dir() -> PathBuf {
    let base_dir = config_dir().expect("Failed to get Application Support directory");
    let mut path = base_dir;
    path.push("com.comet.dev");
    path.push("workspaces");
    fs::create_dir_all(&path).expect("Failed to create directory");
    path
}

fn get_workspace_state_file() -> PathBuf {
    let mut path = get_workspaces_dir();
    path.push("state.json");
    path
}

pub fn get_workspace_tabs_dir(workspace_id: &str) -> PathBuf {
    let mut path = get_workspaces_dir();
    path.push(workspace_id);
    path.push("tabs");
    fs::create_dir_all(&path).expect("Failed to create directory");
    path
}

#[tauri::command]
pub async fn load_workspaces(app_handle: tauri::AppHandle) -> Result<WorkspaceState, String> {
    let state_file = get_workspace_state_file();
    
    if state_file.exists() {
        let content = fs::read_to_string(state_file).map_err(|e| e.to_string())?;
        let state: WorkspaceState = serde_json::from_str(&content).map_err(|e| e.to_string())?;
        
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "info".to_string(),
            message: format!("Loaded {} workspaces from state", state.workspaces.len()),
            details: Some(serde_json::json!({
                "active_workspace": state.active_workspace,
                "workspace_count": state.workspaces.len()
            })),
        };
        
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
        }
        
        Ok(state)
    } else {
        let default_workspace = Workspace {
            id: "default".to_string(),
            name: "Default".to_string(),
            path: get_workspace_tabs_dir("default").to_string_lossy().to_string(),
        };

        let state = WorkspaceState {
            active_workspace: Some("default".to_string()),
            workspaces: vec![default_workspace],
        };

        save_workspace_state(&state, &app_handle)?;
        Ok(state)
    }
}

#[tauri::command]
pub async fn create_workspace(app_handle: tauri::AppHandle, name: String) -> Result<Workspace, String> {
    let workspace_id = name.to_lowercase().replace(" ", "-");
    let workspace = Workspace {
        id: workspace_id.clone(),
        name: name.clone(),
        path: get_workspace_tabs_dir(&workspace_id).to_string_lossy().to_string(),
    };

    let mut state = load_workspaces(app_handle.clone()).await?;
    if state.workspaces.iter().any(|w| w.id == workspace_id) {
        let error_msg = format!("Workspace with name '{}' already exists", name);
        
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: error_msg.clone(),
            details: Some(serde_json::json!({
                "attempted_name": name,
                "attempted_id": workspace_id
            })),
        };
        
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
        }
        
        return Err(error_msg);
    }

    state.workspaces.push(workspace.clone());
    save_workspace_state(&state, &app_handle)?;

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: format!("Created new workspace: {}", name),
        details: Some(serde_json::json!({
            "workspace_id": workspace_id,
            "workspace_name": name,
            "workspace_path": workspace.path
        })),
    };
    
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
    }

    Ok(workspace)
}

#[tauri::command]
pub async fn delete_workspace(app_handle: tauri::AppHandle, workspace_id: String) -> Result<(), String> {
    let mut state = load_workspaces(app_handle.clone()).await?;
    
    if state.workspaces.len() <= 1 {
        let error_msg = "Cannot delete the last workspace".to_string();
        
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: error_msg.clone(),
            details: Some(serde_json::json!({
                "attempted_delete_id": workspace_id,
                "remaining_workspaces": state.workspaces.len()
            })),
        };
        
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
        }
        
        return Err(error_msg);
    }

    if let Some(active) = &state.active_workspace {
        if active == &workspace_id {
            let error_msg = "Cannot delete the active workspace".to_string();
            
            let log_entry = LogEntry {
                timestamp: chrono::Local::now().to_rfc3339(),
                level: "error".to_string(),
                message: error_msg.clone(),
                details: Some(serde_json::json!({
                    "attempted_delete_id": workspace_id,
                    "is_active": true
                })),
            };
            
            if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
                let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
            }
            
            return Err(error_msg);
        }
    }

    let mut workspace_path = get_workspaces_dir();
    workspace_path.push(&workspace_id);

    if workspace_path.exists() {
        fs::remove_dir_all(workspace_path).map_err(|e| e.to_string())?;
    }

    let workspace_name = state.workspaces.iter()
        .find(|w| w.id == workspace_id)
        .map(|w| w.name.clone())
        .unwrap_or_else(|| workspace_id.clone());

    state.workspaces.retain(|w| w.id != workspace_id);
    save_workspace_state(&state, &app_handle)?;

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: format!("Deleted workspace: {}", workspace_name),
        details: Some(serde_json::json!({
            "workspace_id": workspace_id,
            "workspace_name": workspace_name,
            "remaining_workspaces": state.workspaces.len()
        })),
    };
    
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
    }

    Ok(())
}

#[tauri::command]
pub async fn set_active_workspace(app_handle: tauri::AppHandle, workspace_id: String) -> Result<(), String> {
    let mut state = load_workspaces(app_handle.clone()).await?;
    
    if !state.workspaces.iter().any(|w| w.id == workspace_id) {
        let error_msg = format!("Workspace '{}' not found", workspace_id);
        
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: error_msg.clone(),
            details: Some(serde_json::json!({
                "attempted_workspace_id": workspace_id
            })),
        };
        
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
        }
        
        return Err(error_msg);
    }

    let previous_active = state.active_workspace.clone();
    state.active_workspace = Some(workspace_id.clone());
    save_workspace_state(&state, &app_handle)?;

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: format!("Changed active workspace to: {}", workspace_id),
        details: Some(serde_json::json!({
            "new_active_workspace": workspace_id,
            "previous_active_workspace": previous_active
        })),
    };
    
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
    }

    Ok(())
}

#[tauri::command]
pub async fn rename_workspace(app_handle: tauri::AppHandle, workspace_id: String, new_name: String) -> Result<(), String> {
    let mut state = load_workspaces(app_handle.clone()).await?;
    
    if state.workspaces.iter().any(|w| w.name.to_lowercase() == new_name.to_lowercase() && w.id != workspace_id) {
        let error_msg = format!("Workspace with name '{}' already exists", new_name);
        
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: error_msg.clone(),
            details: Some(serde_json::json!({
                "workspace_id": workspace_id,
                "attempted_new_name": new_name
            })),
        };
        
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
        }
        
        return Err(error_msg);
    }

    if let Some(workspace) = state.workspaces.iter_mut().find(|w| w.id == workspace_id) {
        let old_name = workspace.name.clone();
        workspace.name = new_name.clone();
        save_workspace_state(&state, &app_handle)?;

        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "info".to_string(),
            message: format!("Renamed workspace from '{}' to '{}'", old_name, new_name),
            details: Some(serde_json::json!({
                "workspace_id": workspace_id,
                "old_name": old_name,
                "new_name": new_name
            })),
        };
        
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
        }

        Ok(())
    } else {
        let error_msg = format!("Workspace '{}' not found", workspace_id);
        
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: error_msg.clone(),
            details: Some(serde_json::json!({
                "workspace_id": workspace_id,
                "attempted_new_name": new_name
            })),
        };
        
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
        }
        
        Err(error_msg)
    }
}

fn save_workspace_state(state: &WorkspaceState, app_handle: &tauri::AppHandle) -> Result<(), String> {
    let state_file = get_workspace_state_file();
    let content = serde_json::to_string_pretty(state).map_err(|e| e.to_string())?;
    fs::write(state_file, content).map_err(|e| e.to_string())?;

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Saved workspace state".to_string(),
        details: Some(serde_json::json!({
            "workspace_count": state.workspaces.len(),
            "active_workspace": state.active_workspace
        })),
    };
    
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        let _ = logger.lock().map_err(|e| e.to_string())?.write_entry(log_entry);
    }

    Ok(())
} 
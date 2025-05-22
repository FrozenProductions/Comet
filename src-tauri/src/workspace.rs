use std::fs;
use std::path::{PathBuf};
use serde::{Deserialize, Serialize};
use tauri::api::path::config_dir;

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
pub async fn load_workspaces() -> Result<WorkspaceState, String> {
    let state_file = get_workspace_state_file();
    
    if state_file.exists() {
        let content = fs::read_to_string(state_file).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
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

        save_workspace_state(&state)?;
        Ok(state)
    }
}

#[tauri::command]
pub async fn create_workspace(name: String) -> Result<Workspace, String> {
    let workspace_id = name.to_lowercase().replace(" ", "-");
    let workspace = Workspace {
        id: workspace_id.clone(),
        name,
        path: get_workspace_tabs_dir(&workspace_id).to_string_lossy().to_string(),
    };

    let mut state = load_workspaces().await?;
    if state.workspaces.iter().any(|w| w.id == workspace_id) {
        return Err("Workspace with this name already exists".to_string());
    }

    state.workspaces.push(workspace.clone());
    save_workspace_state(&state)?;

    Ok(workspace)
}

#[tauri::command]
pub async fn delete_workspace(workspace_id: String) -> Result<(), String> {
    let mut state = load_workspaces().await?;
    
    if state.workspaces.len() <= 1 {
        return Err("Cannot delete the last workspace".to_string());
    }

    if let Some(active) = &state.active_workspace {
        if active == &workspace_id {
            return Err("Cannot delete the active workspace".to_string());
        }
    }

    let mut workspace_path = get_workspaces_dir();
    workspace_path.push(&workspace_id);

    if workspace_path.exists() {
        fs::remove_dir_all(workspace_path).map_err(|e| e.to_string())?;
    }

    state.workspaces.retain(|w| w.id != workspace_id);
    save_workspace_state(&state)?;

    Ok(())
}

#[tauri::command]
pub async fn set_active_workspace(workspace_id: String) -> Result<(), String> {
    let mut state = load_workspaces().await?;
    
    if !state.workspaces.iter().any(|w| w.id == workspace_id) {
        return Err("Workspace not found".to_string());
    }

    state.active_workspace = Some(workspace_id);
    save_workspace_state(&state)?;

    Ok(())
}

#[tauri::command]
pub async fn rename_workspace(workspace_id: String, new_name: String) -> Result<(), String> {
    let mut state = load_workspaces().await?;
    
    if state.workspaces.iter().any(|w| w.name.to_lowercase() == new_name.to_lowercase() && w.id != workspace_id) {
        return Err("Workspace with this name already exists".to_string());
    }

    if let Some(workspace) = state.workspaces.iter_mut().find(|w| w.id == workspace_id) {
        workspace.name = new_name;
        save_workspace_state(&state)?;
        Ok(())
    } else {
        Err("Workspace not found".to_string())
    }
}

fn save_workspace_state(state: &WorkspaceState) -> Result<(), String> {
    let state_file = get_workspace_state_file();
    let content = serde_json::to_string_pretty(state).map_err(|e| e.to_string())?;
    fs::write(state_file, content).map_err(|e| e.to_string())
} 
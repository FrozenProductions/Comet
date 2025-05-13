use std::fs::{self, File};
use std::io::Read;
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Tab {
    pub id: String,
    pub title: String,
    pub content: String,
    pub language: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TabState {
    pub active_tab: Option<String>,
    pub tab_order: Vec<String>,
}

fn get_tabs_dir() -> PathBuf {
    let mut path = dirs::document_dir().expect("Failed to get Documents directory");
    path.push("Comet");
    path.push("tabs");
    fs::create_dir_all(&path).expect("Failed to create directory");
    path
}

fn get_state_file() -> PathBuf {
    let mut path = dirs::document_dir().expect("Failed to get Documents directory");
    path.push("Comet");
    path.push("tabs");
    fs::create_dir_all(&path).expect("Failed to create directory");
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
    let mut sanitized = name.replace(|c: char| !c.is_alphanumeric() && c != '.' && c != '_' && c != '-', "_");
    if !sanitized.ends_with(".lua") {
        sanitized.push_str(".lua");
    }
    sanitized
}

#[tauri::command]
pub async fn save_tab(tab: Tab) -> Result<(), String> {
    let tabs_dir = get_tabs_dir();
    let filename = sanitize_filename(&tab.title);
    let file_path = tabs_dir.join(&filename);
    fs::write(&file_path, &tab.content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn delete_tab(title: String) -> Result<(), String> {
    let tabs_dir = get_tabs_dir();
    let filename = sanitize_filename(&title);
    let file_path = tabs_dir.join(&filename);
    
    if file_path.exists() {
        fs::remove_file(file_path).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub async fn save_tab_state(active_tab: Option<String>, tab_order: Vec<String>) -> Result<(), String> {
    let state = TabState {
        active_tab,
        tab_order,
    };
    let state_file = get_state_file();
    fs::write(state_file, serde_json::to_string_pretty(&state).unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn load_tabs() -> Result<Vec<Tab>, String> {
    let tabs_dir = get_tabs_dir();
    let state_file = get_state_file();
    
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
                    tabs.push(Tab {
                        id: title.clone(),
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
        tabs.push(Tab {
            id: default_title.to_string(),
            title: default_title.to_string(),
            content: "-- New File\n".to_string(),
            language: "lua".to_string(),
        });
    }

    Ok(tabs)
}

#[tauri::command]
pub async fn get_tab_state() -> Result<TabState, String> {
    let state_file = get_state_file();
    
    if state_file.exists() {
        let content = fs::read_to_string(state_file).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        let default_title = "untitled.lua";
        Ok(TabState {
            active_tab: Some(default_title.to_string()),
            tab_order: vec![default_title.to_string()],
        })
    }
}

#[tauri::command]
pub async fn rename_tab(old_title: String, new_title: String) -> Result<(), String> {
    let tabs_dir = get_tabs_dir();
    let old_filename = sanitize_filename(&old_title);
    let new_filename = sanitize_filename(&new_title);
    let old_path = tabs_dir.join(&old_filename);
    let new_path = tabs_dir.join(&new_filename);

    if !old_path.exists() {
        return Err("Source file does not exist".to_string());
    }

    fs::rename(old_path, new_path).map_err(|e| e.to_string())?;
    Ok(())
} 
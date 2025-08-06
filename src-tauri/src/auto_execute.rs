use dirs;
use serde::{Deserialize, Serialize};
use std::fs::{self, File};
use std::io::Read;
use std::path::Path;
use std::path::PathBuf;
use tauri::api::path::config_dir;
use tauri::AppHandle;

const VALID_EXTENSIONS: [&str; 3] = [".lua", ".luau", ".txt"];

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct AutoExecuteFile {
    pub name: String,
    pub content: String,
    pub path: String,
}

fn get_auto_execute_dir_name(app_name: &str) -> String {
    if app_name.to_lowercase() == "comet" || app_name.to_lowercase() == "hydrogen" {
        "Hydrogen".to_string()
    } else {
        app_name.to_string()
    }
}

fn get_auto_execute_dir(app_handle: &AppHandle) -> Result<PathBuf, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let app_name = app_handle.package_info().name.clone();
    let dir_name = get_auto_execute_dir_name(&app_name);
    let auto_execute_dir = home.join(format!("{}/autoexecute", dir_name));
    Ok(auto_execute_dir)
}

fn get_comet_dir() -> PathBuf {
    let base_dir = config_dir().expect("Failed to get Application Support directory");
    let mut app_dir = base_dir;
    app_dir.push("com.comet.dev");
    fs::create_dir_all(&app_dir).expect("Failed to create directory");
    app_dir
}

fn get_scripts_dir() -> PathBuf {
    let base_dir = config_dir().expect("Failed to get Application Support directory");
    let mut app_dir = base_dir;
    app_dir.push("com.comet.dev");
    fs::create_dir_all(&app_dir).expect("Failed to create directory");
    app_dir
}

fn get_state_file() -> PathBuf {
    let mut path = get_comet_dir();
    path.push("auto_execute_disabled");
    path
}

fn read_file_content(path: &Path) -> Result<String, String> {
    let mut file = File::open(path).map_err(|e| e.to_string())?;
    let mut content = Vec::new();
    file.read_to_end(&mut content).map_err(|e| e.to_string())?;

    let content_clone = content.clone();
    String::from_utf8(content)
        .or_else::<String, _>(|_| Ok(content_clone.iter().map(|&b| b as char).collect::<String>()))
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

fn get_auto_execute_state() -> Result<bool, String> {
    Ok(!get_state_file().exists())
}

fn set_auto_execute_state(enabled: bool) -> Result<(), String> {
    let state_file = get_state_file();

    if !enabled {
        fs::write(&state_file, "").map_err(|e| e.to_string())?;
    } else if state_file.exists() {
        fs::remove_file(&state_file).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
pub fn get_auto_execute_files() -> Result<Vec<AutoExecuteFile>, String> {
    let scripts_dir = get_scripts_dir();

    if !scripts_dir.exists() {
        fs::create_dir_all(&scripts_dir).map_err(|e| e.to_string())?;
    }

    let entries = fs::read_dir(&scripts_dir).map_err(|e| e.to_string())?;
    let mut files = Vec::new();

    for entry in entries {
        let entry = entry.map_err(|e| e.to_string())?;
        let path = entry.path();

        if path.is_file() && is_valid_script_file(&path) {
            if let Ok(content) = read_file_content(&path) {
                files.push(AutoExecuteFile {
                    name: path
                        .file_name()
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

    Ok(files)
}

#[tauri::command]
pub fn save_auto_execute_file(
    app_handle: AppHandle,
    name: String,
    content: String,
) -> Result<(), String> {
    let file_name = ensure_valid_extension(&name);
    let scripts_dir = get_scripts_dir();
    let file_path = scripts_dir.join(&file_name);

    fs::write(&file_path, &content).map_err(|e| e.to_string())?;

    if get_auto_execute_state()? {
        let auto_execute_dir = get_auto_execute_dir(&app_handle)?;
        if !auto_execute_dir.exists() {
            fs::create_dir_all(&auto_execute_dir).map_err(|e| e.to_string())?;
        }
        let auto_execute_path = auto_execute_dir.join(&file_name);
        fs::copy(&file_path, &auto_execute_path).map_err(|e| e.to_string())?;
    }

    Ok(())
}

#[tauri::command]
pub fn delete_auto_execute_file(app_handle: AppHandle, name: String) -> Result<(), String> {
    let scripts_dir = get_scripts_dir();
    let file_path = scripts_dir.join(&name);

    if file_path.exists() {
        fs::remove_file(&file_path).map_err(|e| e.to_string())?;
    }

    if get_auto_execute_state()? {
        let auto_execute_dir = get_auto_execute_dir(&app_handle)?;
        let auto_execute_path = auto_execute_dir.join(&name);
        if auto_execute_path.exists() {
            fs::remove_file(&auto_execute_path).map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn rename_auto_execute_file(
    app_handle: AppHandle,
    old_name: String,
    new_name: String,
) -> Result<(), String> {
    let new_file_name = ensure_valid_extension(&new_name);
    let scripts_dir = get_scripts_dir();
    let old_path = scripts_dir.join(&old_name);
    let new_path = scripts_dir.join(&new_file_name);

    if !old_path.exists() {
        return Err("Source file does not exist".to_string());
    }

    if new_path.exists() {
        return Err("A file with that name already exists".to_string());
    }

    fs::rename(&old_path, &new_path).map_err(|e| e.to_string())?;

    if get_auto_execute_state()? {
        let auto_execute_dir = get_auto_execute_dir(&app_handle)?;
        let old_auto_execute_path = auto_execute_dir.join(&old_name);
        let new_auto_execute_path = auto_execute_dir.join(&new_file_name);

        if old_auto_execute_path.exists() {
            fs::rename(&old_auto_execute_path, &new_auto_execute_path)
                .map_err(|e| e.to_string())?;
        }
    }

    Ok(())
}

#[tauri::command]
pub fn is_auto_execute_enabled() -> Result<bool, String> {
    get_auto_execute_state()
}

#[tauri::command]
pub fn toggle_auto_execute(app_handle: AppHandle) -> Result<bool, String> {
    let auto_execute_dir = get_auto_execute_dir(&app_handle)?;
    let scripts_dir = get_scripts_dir();

    let currently_enabled = get_auto_execute_state()?;

    if currently_enabled {
        if auto_execute_dir.exists() {
            let entries = fs::read_dir(&auto_execute_dir).map_err(|e| e.to_string())?;
            for entry in entries {
                let entry = entry.map_err(|e| e.to_string())?;
                let path = entry.path();
                if path.is_file() && is_valid_script_file(&path) {
                    fs::remove_file(&path).map_err(|e| e.to_string())?;
                }
            }
        }
    } else {
        if !auto_execute_dir.exists() {
            fs::create_dir_all(&auto_execute_dir).map_err(|e| e.to_string())?;
        }

        let entries = fs::read_dir(&scripts_dir).map_err(|e| e.to_string())?;
        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path();

            if path.is_file() && is_valid_script_file(&path) {
                let file_name = path
                    .file_name()
                    .ok_or("Invalid filename")?
                    .to_string_lossy()
                    .into_owned();
                let auto_execute_path = auto_execute_dir.join(&file_name);
                fs::copy(&path, &auto_execute_path).map_err(|e| e.to_string())?;
            }
        }
    }

    let new_state = !currently_enabled;
    set_auto_execute_state(new_state)?;

    Ok(new_state)
}

#[tauri::command]
pub fn open_auto_execute_directory() -> Result<(), String> {
    let scripts_dir = get_scripts_dir();
    crate::open_directory(scripts_dir)
}

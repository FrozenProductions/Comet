use std::fs::{self, File};
use std::io::Read;
use std::path::Path;
use serde::{Deserialize, Serialize};
use dirs;

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
pub fn get_auto_execute_files() -> Result<Vec<AutoExecuteFile>, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let auto_execute_dir = home.join("Hydrogen/autoexecute");

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
    Ok(files)
}

#[tauri::command]
pub fn save_auto_execute_file(name: String, content: String) -> Result<(), String> {
    let file_name = ensure_valid_extension(&name);
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let file_path = home.join("Hydrogen/autoexecute").join(&file_name);
    fs::write(file_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn delete_auto_execute_file(name: String) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let file_path = home.join("Hydrogen/autoexecute").join(&name);

    if !file_path.exists() {
        return Ok(());
    }

    fs::remove_file(file_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn rename_auto_execute_file(old_name: String, new_name: String) -> Result<(), String> {
    let new_file_name = ensure_valid_extension(&new_name);
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let old_path = home.join("Hydrogen/autoexecute").join(&old_name);
    let new_path = home.join("Hydrogen/autoexecute").join(&new_file_name);

    if !old_path.exists() {
        return Err("Source file does not exist".to_string());
    }

    if new_path.exists() {
        return Err("A file with that name already exists".to_string());
    }

    fs::rename(old_path, new_path).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub fn open_auto_execute_directory() -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let auto_execute_dir = home.join("Hydrogen/autoexecute");
    crate::open_directory(auto_execute_dir)
} 
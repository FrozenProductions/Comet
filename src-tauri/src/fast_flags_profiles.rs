use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use serde_json::Map;
use crate::fast_flags::{save_fast_flags, FastFlagsResponse};
use tauri::api::path::config_dir;
use tauri::api::dialog;
use uuid;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FastFlagsProfile {
    pub id: String,
    pub name: String,
    pub flags: std::collections::HashMap<String, serde_json::Value>,
}

pub struct FastFlagsProfileManager {
    profiles_dir: PathBuf,
}

fn get_comet_dir() -> PathBuf {
    let base_dir = config_dir().expect("Failed to get Application Support directory");
    let mut app_dir = base_dir;
    app_dir.push("com.comet.dev");
    fs::create_dir_all(&app_dir).expect("Failed to create directory");
    app_dir
}

fn get_profiles_dir() -> PathBuf {
    let mut path = get_comet_dir();
    path.push("profiles");
    fs::create_dir_all(&path).expect("Failed to create directory");
    path
}

pub fn get_active_profile_file() -> PathBuf {
    let mut path = get_profiles_dir();
    path.push("active_profile.json");
    path
}

impl FastFlagsProfileManager {
    pub fn new(_app_handle: &tauri::AppHandle) -> Self {
        Self { 
            profiles_dir: get_profiles_dir()
        }
    }

    pub fn load_profiles(&self) -> Result<Vec<FastFlagsProfile>, String> {
        let settings_file = PathBuf::from("/Applications/Roblox.app/Contents/MacOS/ClientSettings/ClientAppSettings.json");
        
        if !settings_file.exists() {
            let _ = self.clear_active_profile();
        }

        let mut profiles = Vec::new();
        
        if let Ok(entries) = fs::read_dir(&self.profiles_dir) {
            for entry in entries {
                if let Ok(entry) = entry {
                    let path = entry.path();
                    if path.is_file() && path.extension().map_or(false, |ext| ext == "json") {
                        if path.file_name().map_or(false, |name| name == "active_profile.json") {
                            continue;
                        }
                        
                        if let Ok(content) = fs::read_to_string(&path) {
                            if let Ok(profile) = serde_json::from_str::<FastFlagsProfile>(&content) {
                                profiles.push(profile);
                            }
                        }
                    }
                }
            }
        }

        Ok(profiles)
    }

    pub async fn save_profile(&self, profile: FastFlagsProfile, app_handle: &tauri::AppHandle) -> Result<(), String> {
        let profile_path = self.profiles_dir.join(format!("{}.json", profile.id));
        let content = serde_json::to_string_pretty(&profile)
            .map_err(|e| format!("Failed to serialize profile: {}", e))?;
        
        fs::write(profile_path, content)
            .map_err(|e| format!("Failed to write profile: {}", e))?;

        if let Some(active_id) = self.get_active_profile_id()? {
            if active_id == profile.id {
                let flags_map: Map<String, serde_json::Value> = profile.flags.clone().into_iter().collect();
                match save_fast_flags(app_handle.clone(), flags_map).await {
                    FastFlagsResponse { success: true, .. } => Ok(()),
                    FastFlagsResponse { error: Some(err), .. } => Err(err),
                    _ => Err("Unknown error while saving flags".to_string()),
                }?;
            }
        }
        
        Ok(())
    }

    pub fn delete_profile(&self, profile_id: &str) -> Result<(), String> {
        let profile_path = self.profiles_dir.join(format!("{}.json", profile_id));
        
        if profile_path.exists() {
            fs::remove_file(profile_path)
                .map_err(|e| format!("Failed to delete profile: {}", e))?;
        }

        if let Some(active_id) = self.get_active_profile_id()? {
            if active_id == profile_id {
                self.clear_active_profile()?;
            }
        }
        
        Ok(())
    }

    pub async fn activate_profile(&self, app_handle: &tauri::AppHandle, profile_id: &str) -> Result<FastFlagsProfile, String> {
        let profile_path = self.profiles_dir.join(format!("{}.json", profile_id));
        
        if !profile_path.exists() {
            return Err("Profile not found".to_string());
        }

        let content = fs::read_to_string(profile_path)
            .map_err(|e| format!("Failed to read profile: {}", e))?;
            
        let profile: FastFlagsProfile = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse profile: {}", e))?;

        let flags_map: Map<String, serde_json::Value> = profile.flags.clone().into_iter().collect();

        let response = save_fast_flags(app_handle.clone(), flags_map).await;
        match response {
            FastFlagsResponse { success: true, .. } => {
                self.set_active_profile_id(profile_id)?;
                Ok(profile)
            },
            FastFlagsResponse { error: Some(err), .. } => Err(err),
            _ => Err("Unknown error while saving flags".to_string()),
        }
    }

    pub fn get_active_profile_id(&self) -> Result<Option<String>, String> {
        let settings_file = PathBuf::from("/Applications/Roblox.app/Contents/MacOS/ClientSettings/ClientAppSettings.json");
        
        if !settings_file.exists() {
            let _ = self.clear_active_profile();
            return Ok(None);
        }

        let active_file = get_active_profile_file();
        
        if !active_file.exists() {
            return Ok(None);
        }

        match fs::read_to_string(&active_file) {
            Ok(content) => {
                if content.trim().is_empty() {
                    return Ok(None);
                }
                match serde_json::from_str(&content) {
                    Ok(id) => Ok(Some(id)),
                    Err(_) => {
                        let _ = fs::remove_file(&active_file);
                        Ok(None)
                    }
                }
            },
            Err(_) => Ok(None)
        }
    }

    pub fn set_active_profile_id(&self, profile_id: &str) -> Result<(), String> {
        let content = serde_json::to_string(&profile_id)
            .map_err(|e| format!("Failed to serialize profile ID: {}", e))?;

        fs::write(get_active_profile_file(), content)
            .map_err(|e| format!("Failed to write active profile ID: {}", e))?;

        Ok(())
    }

    pub fn clear_active_profile(&self) -> Result<(), String> {
        let active_file = get_active_profile_file();
        
        if active_file.exists() {
            match fs::remove_file(&active_file) {
                Ok(_) => Ok(()),
                Err(_) => {
                    fs::write(&active_file, "").map_err(|e| format!("Failed to clear active profile: {}", e))
                }
            }
        } else {
            Ok(())
        }
    }

    pub fn export_profiles(&self) -> Result<Vec<FastFlagsProfile>, String> {
        self.load_profiles()
    }

    pub fn import_profiles(&self, profiles: Vec<FastFlagsProfile>) -> Result<(), String> {
        for profile in profiles {
            let profile_path = self.profiles_dir.join(format!("{}.json", profile.id));
            let content = serde_json::to_string_pretty(&profile)
                .map_err(|e| format!("Failed to serialize profile: {}", e))?;
            
            fs::write(profile_path, content)
                .map_err(|e| format!("Failed to write profile: {}", e))?;
        }
        Ok(())
    }
}

#[tauri::command]
pub async fn export_fast_flags_profiles(app_handle: tauri::AppHandle, selected_profile_id: Option<String>) -> Result<(), String> {
    let profile_manager = FastFlagsProfileManager::new(&app_handle);
    let profiles = profile_manager.export_profiles()?;
    
    if let Some(path) = dialog::blocking::FileDialogBuilder::new()
        .add_filter("Fast Flags", &["json"])
        .set_file_name("fast-flags.json")
        .save_file() {
            let content = if path.to_string_lossy().contains("profile") {
                serde_json::to_string_pretty(&profiles)
                    .map_err(|e| format!("Failed to serialize profiles: {}", e))?
            } else {
                let profile = if let Some(id) = selected_profile_id {
                    profiles.iter().find(|p| p.id == id)
                } else {
                    profiles.first()
                };

                if let Some(profile) = profile {
                    serde_json::to_string_pretty(&profile.flags)
                        .map_err(|e| format!("Failed to serialize flags: {}", e))?
                } else {
                    "{}".to_string()
                }
            };
            
            fs::write(path, content)
                .map_err(|e| format!("Failed to write file: {}", e))?;
    }
    
    Ok(())
}

#[tauri::command]
pub async fn import_fast_flags_profiles(app_handle: tauri::AppHandle) -> Result<(), String> {
    let profile_manager = FastFlagsProfileManager::new(&app_handle);
    
    let path = match dialog::blocking::FileDialogBuilder::new()
        .add_filter("Fast Flags", &["json"])
        .pick_file() {
            Some(path) => path,
            None => return Ok(())
        };
            
    let content = fs::read_to_string(&path)
        .map_err(|e| format!("Failed to read file: {}", e))?;
        
    let import_result = serde_json::from_str::<Vec<FastFlagsProfile>>(&content);
        
    let profiles = match import_result {
        Ok(profiles) => profiles,
        Err(_) => {
            let flags: std::collections::HashMap<String, serde_json::Value> = serde_json::from_str(&content)
                .map_err(|e| format!("Failed to parse JSON: {}", e))?;
                
            let mut profile_name = "Untitled".to_string();
            let mut counter = 1;
                
            while profile_manager.load_profiles()?.iter().any(|p| p.name == profile_name) {
                profile_name = format!("Untitled-{}", counter);
                counter += 1;
            }
                
            vec![FastFlagsProfile {
                id: uuid::Uuid::new_v4().to_string(),
                name: profile_name,
                flags,
            }]
        }
    };
        
    profile_manager.import_profiles(profiles)?;
    Ok(())
} 
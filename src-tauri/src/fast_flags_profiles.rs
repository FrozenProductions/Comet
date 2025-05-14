use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;
use tauri::api::path::app_data_dir;
use crate::fast_flags::{save_fast_flags, FastFlagsResponse};
use crate::active_profile::ActiveProfileManager;
use serde_json::Map;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct FastFlagsProfile {
    pub id: String,
    pub name: String,
    pub flags: std::collections::HashMap<String, serde_json::Value>,
}

pub struct FastFlagsProfileManager {
    profiles_dir: PathBuf,
}

impl FastFlagsProfileManager {
    pub fn new(app_handle: &tauri::AppHandle) -> Self {
        let mut profiles_dir = app_data_dir(&app_handle.config()).expect("Failed to get app dir");
        profiles_dir.push("profiles");
        
        if !profiles_dir.exists() {
            fs::create_dir_all(&profiles_dir).expect("Failed to create profiles directory");
        }

        Self { profiles_dir }
    }

    pub fn load_profiles(&self) -> Result<Vec<FastFlagsProfile>, String> {
        let mut profiles = Vec::new();
        
        if let Ok(entries) = fs::read_dir(&self.profiles_dir) {
            for entry in entries {
                if let Ok(entry) = entry {
                    if let Ok(content) = fs::read_to_string(entry.path()) {
                        if let Ok(profile) = serde_json::from_str::<FastFlagsProfile>(&content) {
                            profiles.push(profile);
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

        let active_manager = ActiveProfileManager::new(app_handle);
        if let Some(active_id) = active_manager.get_active_profile_id() {
            if active_id == profile.id {
                let flags_map: Map<String, serde_json::Value> = profile.flags.clone().into_iter().collect();
                match save_fast_flags(flags_map).await {
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
        
        Ok(())
    }

    pub async fn activate_profile(&self, profile_id: &str) -> Result<FastFlagsProfile, String> {
        let profile_path = self.profiles_dir.join(format!("{}.json", profile_id));
        
        if !profile_path.exists() {
            return Err("Profile not found".to_string());
        }

        let content = fs::read_to_string(profile_path)
            .map_err(|e| format!("Failed to read profile: {}", e))?;
            
        let profile: FastFlagsProfile = serde_json::from_str(&content)
            .map_err(|e| format!("Failed to parse profile: {}", e))?;

        let flags_map: Map<String, serde_json::Value> = profile.flags.clone().into_iter().collect();

        let response = save_fast_flags(flags_map).await;
        match response {
            FastFlagsResponse { success: true, .. } => Ok(profile),
            FastFlagsResponse { error: Some(err), .. } => Err(err),
            _ => Err("Unknown error while saving flags".to_string()),
        }
    }
} 
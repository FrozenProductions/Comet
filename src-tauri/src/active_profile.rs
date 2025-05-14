use std::fs;
use std::path::PathBuf;
use tauri::api::path::app_data_dir;

pub struct ActiveProfileManager {
    state_file: PathBuf,
}

impl ActiveProfileManager {
    pub fn new(app_handle: &tauri::AppHandle) -> Self {
        let mut state_file = app_data_dir(&app_handle.config()).expect("Failed to get app dir");
        state_file.push("active_profile.json");
        Self { state_file }
    }

    pub fn get_active_profile_id(&self) -> Option<String> {
        if !self.state_file.exists() {
            return None;
        }

        match fs::read_to_string(&self.state_file) {
            Ok(content) => serde_json::from_str(&content).ok(),
            Err(_) => None,
        }
    }

    pub fn set_active_profile_id(&self, profile_id: &str) -> Result<(), String> {
        let content = serde_json::to_string(&profile_id)
            .map_err(|e| format!("Failed to serialize profile ID: {}", e))?;

        fs::write(&self.state_file, content)
            .map_err(|e| format!("Failed to write active profile ID: {}", e))?;

        Ok(())
    }

    pub fn clear_active_profile(&self) -> Result<(), String> {
        if self.state_file.exists() {
            fs::remove_file(&self.state_file)
                .map_err(|e| format!("Failed to clear active profile: {}", e))?;
        }
        Ok(())
    }
} 
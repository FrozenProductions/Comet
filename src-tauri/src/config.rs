use serde::{Deserialize, Serialize};
use std::fs;
use std::path::PathBuf;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct NotificationConfig {
    pub title: String,
    pub disconnect: DisconnectConfig,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct DisconnectConfig {
    pub body: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct BrandConfig {
    pub product_name: String,
    pub icon_path: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct CometConfig {
    pub notifications: NotificationConfig,
    pub brands: std::collections::HashMap<String, BrandConfig>,
}

impl CometConfig {
    pub fn load() -> Result<Self, Box<dyn std::error::Error>> {
        let config_path = Self::get_config_path()?;
        let config_str = fs::read_to_string(config_path)?;
        let config: CometConfig = serde_json::from_str(&config_str)?;
        Ok(config)
    }

    fn get_config_path() -> Result<PathBuf, Box<dyn std::error::Error>> {
        let current_exe = std::env::current_exe()?;
        let exe_dir = current_exe
            .parent()
            .ok_or("Failed to get executable directory")?;
        let config_path = exe_dir.join(".comet").join("config").join("config.json");

        if !config_path.exists() {
            return Err("Config file not found".into());
        }

        Ok(config_path)
    }
}

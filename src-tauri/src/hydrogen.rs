use std::process::Command;
use serde::Serialize;
use std::fs;
use std::io::Write;
use dirs;
use crate::logging::LogEntry;
use tauri::Manager;

#[derive(Debug, Serialize, Clone)]
pub struct InstallProgress {
    state: String,
}

#[tauri::command]
pub fn check_hydrogen_installation(app_handle: tauri::AppHandle) -> bool {
    let path = std::path::Path::new("/Applications/Roblox.app/Contents/MacOS/RobloxPlayer.copy");
    let exists = path.exists();

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Checking Hydrogen installation".to_string(),
        details: Some(serde_json::json!({
            "path": path.to_string_lossy(),
            "exists": exists
        })),
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    exists
}

fn get_downloads_dir() -> std::path::PathBuf {
    dirs::download_dir().expect("Failed to get downloads directory")
}

#[tauri::command]
pub async fn install_hydrogen(window: tauri::Window) -> Result<(), String> {
    let app_handle = window.app_handle();
    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Starting Hydrogen installation".to_string(),
        details: None,
    };

    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    window.emit("hydrogen-progress", InstallProgress {
        state: "preparing".to_string(),
    }).unwrap();

    let script_path = get_downloads_dir().join("hydrogen_installer.sh");
    
    let script_content = String::from(r#"#!/bin/bash
set -e

curl -fsSL https://www.hydrogen.lat/install > /tmp/hydrogen_install.sh
chmod +x /tmp/hydrogen_install.sh

/tmp/hydrogen_install.sh > /dev/null 2>&1

rm -f /tmp/hydrogen_install.sh

rm -f "$0"
exit 0"#);

    let mut file = std::fs::File::create(&script_path).map_err(|e| {
        let error_msg = e.to_string();
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: "Failed to create installer script".to_string(),
            details: Some(serde_json::json!({
                "error": error_msg,
                "script_path": script_path.to_string_lossy()
            })),
        };
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            if let Ok(logger) = logger.lock() {
                let _ = logger.write_entry(log_entry);
            }
        }
        error_msg
    })?;
    file.write_all(script_content.as_bytes()).map_err(|e| e.to_string())?;

    let chmod_output = Command::new("chmod")
        .arg("+x")
        .arg(&script_path)
        .output()
        .map_err(|e| e.to_string())?;

    if !chmod_output.status.success() {
        let error = format!("Failed to make installer script executable: {}", String::from_utf8_lossy(&chmod_output.stderr));
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: error.clone(),
            details: Some(serde_json::json!({
                "script_path": script_path.to_string_lossy()
            })),
        };
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            if let Ok(logger) = logger.lock() {
                let _ = logger.write_entry(log_entry);
            }
        }
        let _ = fs::remove_file(&script_path);
        return Err(error);
    }

    window.emit("hydrogen-progress", InstallProgress {
        state: "installing".to_string(),
    }).unwrap();

    let script = format!(
        r#"osascript -e 'do shell script "bash \"{}\" 2>&1" with administrator privileges'"#,
        script_path.to_string_lossy()
    );

    let output = Command::new("bash")
        .arg("-c")
        .arg(&script)
        .output()
        .map_err(|e| e.to_string())?;

    if !output.status.success() {
        let error = String::from_utf8_lossy(&output.stderr);
        let error_msg = format!("Installation failed: {}", error);
        let log_entry = LogEntry {
            timestamp: chrono::Local::now().to_rfc3339(),
            level: "error".to_string(),
            message: error_msg.clone(),
            details: Some(serde_json::json!({
                "script_path": script_path.to_string_lossy(),
                "error": error.to_string()
            })),
        };
        if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
            if let Ok(logger) = logger.lock() {
                let _ = logger.write_entry(log_entry);
            }
        }
        window.emit("hydrogen-progress", InstallProgress {
            state: "error".to_string(),
        }).unwrap();
        
        let _ = fs::remove_file(&script_path);
        return Err(error_msg);
    }

    let _ = fs::remove_file(&script_path);

    let log_entry = LogEntry {
        timestamp: chrono::Local::now().to_rfc3339(),
        level: "info".to_string(),
        message: "Hydrogen installation completed successfully".to_string(),
        details: None,
    };
    if let Some(logger) = app_handle.try_state::<std::sync::Mutex<crate::logging::Logger>>() {
        if let Ok(logger) = logger.lock() {
            let _ = logger.write_entry(log_entry);
        }
    }

    window.emit("hydrogen-progress", InstallProgress {
        state: "completed".to_string(),
    }).unwrap();
    
    Ok(())
} 
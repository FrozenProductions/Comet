use std::process::Command;
use serde::Serialize;
use std::fs;
use std::io::Write;
use dirs;

#[derive(Debug, Serialize, Clone)]
pub struct InstallProgress {
    state: String,
}

#[tauri::command]
pub fn check_hydrogen_installation() -> bool {
    let path = std::path::Path::new("/Applications/Roblox.app/Contents/MacOS/RobloxPlayer.copy");
    path.exists()
}

fn get_downloads_dir() -> std::path::PathBuf {
    dirs::download_dir().expect("Failed to get downloads directory")
}

#[tauri::command]
pub async fn install_hydrogen(window: tauri::Window) -> Result<(), String> {
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

    let mut file = std::fs::File::create(&script_path).map_err(|e| e.to_string())?;
    file.write_all(script_content.as_bytes()).map_err(|e| e.to_string())?;

    let chmod_output = Command::new("chmod")
        .arg("+x")
        .arg(&script_path)
        .output()
        .map_err(|e| e.to_string())?;

    if !chmod_output.status.success() {
        let _ = fs::remove_file(&script_path);
        return Err(format!("Failed to make installer script executable: {}", String::from_utf8_lossy(&chmod_output.stderr)));
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
        window.emit("hydrogen-progress", InstallProgress {
            state: "error".to_string(),
        }).unwrap();
        
        let _ = fs::remove_file(&script_path);
        return Err(format!("Installation failed: {}", error));
    }

    let _ = fs::remove_file(&script_path);

    window.emit("hydrogen-progress", InstallProgress {
        state: "completed".to_string(),
    }).unwrap();
    
    Ok(())
} 
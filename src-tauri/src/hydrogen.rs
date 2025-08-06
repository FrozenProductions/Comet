use dirs;
use serde::Serialize;
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;
use tauri::Manager;

#[derive(Debug, Serialize, Clone)]
pub struct InstallProgress {
    state: String,
}

fn get_app_info(app_handle: &tauri::AppHandle) -> (String, String) {
    let app_name = app_handle.package_info().name.clone();
    let app_name_lower = app_name.to_lowercase();
    if app_name_lower == "comet" || app_name_lower == "hydrogen" {
        (
            "Hydrogen".to_string(),
            "https://www.hydrogen.lat/install".to_string(),
        )
    } else {
        (
            "Ronix".to_string(),
            "https://www.ronixmac.lol/install".to_string(),
        )
    }
}

fn get_dylib_path(app_name: &str) -> PathBuf {
    PathBuf::from(format!(
        "/Applications/{}.app/Contents/MacOS/{}.dylib",
        app_name, app_name
    ))
}

#[tauri::command]
pub fn check_executor_installation(app_handle: tauri::AppHandle) -> bool {
    let roblox_path =
        std::path::Path::new("/Applications/Roblox.app/Contents/MacOS/RobloxPlayer.copy");
    let (app_name, _) = get_app_info(&app_handle);
    let dylib_path = get_dylib_path(&app_name);

    roblox_path.exists() && dylib_path.exists()
}

fn get_downloads_dir() -> std::path::PathBuf {
    dirs::download_dir().expect("Failed to get downloads directory")
}

#[tauri::command]
pub async fn install_app(window: tauri::Window) -> Result<(), String> {
    let app_handle = window.app_handle();
    let (_app_name, install_url) = get_app_info(&app_handle);

    window
        .emit(
            "hydrogen-progress",
            InstallProgress {
                state: "preparing".to_string(),
            },
        )
        .unwrap();

    let script_path = get_downloads_dir().join("installer.sh");

    let script_content = format!(
        r#"#!/bin/bash
set -e

curl -fsSL {} > /tmp/install.sh
chmod +x /tmp/install.sh

/tmp/install.sh > /dev/null 2>&1

rm -f /tmp/install.sh

rm -f "$0"
exit 0"#,
        install_url
    );

    let mut file = std::fs::File::create(&script_path).map_err(|e| e.to_string())?;
    file.write_all(script_content.as_bytes())
        .map_err(|e| e.to_string())?;

    let chmod_output = Command::new("chmod")
        .arg("+x")
        .arg(&script_path)
        .output()
        .map_err(|e| e.to_string())?;

    if !chmod_output.status.success() {
        let error = format!(
            "Failed to make installer script executable: {}",
            String::from_utf8_lossy(&chmod_output.stderr)
        );
        let _ = fs::remove_file(&script_path);
        return Err(error);
    }

    window
        .emit(
            "hydrogen-progress",
            InstallProgress {
                state: "installing".to_string(),
            },
        )
        .unwrap();

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

        window
            .emit(
                "hydrogen-progress",
                InstallProgress {
                    state: "error".to_string(),
                },
            )
            .unwrap();

        let _ = fs::remove_file(&script_path);
        return Err(error_msg);
    }

    let _ = fs::remove_file(&script_path);

    window
        .emit(
            "hydrogen-progress",
            InstallProgress {
                state: "completed".to_string(),
            },
        )
        .unwrap();

    Ok(())
}

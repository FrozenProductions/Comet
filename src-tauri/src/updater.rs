use serde::{Deserialize, Serialize};
use std::process::Command;
use std::fs;
use std::path::PathBuf;
use semver::Version;
use dirs;
use tauri::Manager;

const CURRENT_VERSION: &str = "1.0.0";
const STATUS_URL: &str = "https://www.comet-ui.fun/api/v1/status";
const DOWNLOAD_URL: &str = "https://github.com/FrozenProductions/Comet/releases/download";
const APP_PATH: &str = "/Applications/Comet.app";

#[derive(Debug, Serialize, Deserialize)]
struct StatusResponse {
    status: String,
    version: String,
}

#[derive(Debug, Serialize, Clone)]
pub struct UpdateProgress {
    state: String,
    progress: Option<f32>,
    debug_message: Option<String>,
}

fn get_downloads_dir() -> PathBuf {
    dirs::download_dir().expect("Failed to get downloads directory")
}

fn debug_cmd_output(cmd: std::process::Output) -> String {
    format!(
        "status: {}, stdout: {}, stderr: {}",
        cmd.status,
        String::from_utf8_lossy(&cmd.stdout),
        String::from_utf8_lossy(&cmd.stderr)
    )
}

#[tauri::command]
pub async fn check_for_updates() -> Result<Option<String>, String> {
    let client = reqwest::Client::new();
    
    let response = client
        .get(STATUS_URL)
        .header("User-Agent", "Comet-App")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let status: StatusResponse = response
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let current = Version::parse(CURRENT_VERSION).unwrap();
    let latest = Version::parse(&status.version).map_err(|e| e.to_string())?;

    if latest > current {
        Ok(Some(status.version))
    } else {
        Ok(None)
    }
}

#[tauri::command]
pub async fn download_and_install_update(window: tauri::Window) -> Result<(), String> {
    let client = reqwest::Client::new();
    
    let status: StatusResponse = client
        .get(STATUS_URL)
        .header("User-Agent", "Comet-App")
        .send()
        .await
        .map_err(|e| e.to_string())?
        .json()
        .await
        .map_err(|e| e.to_string())?;

    let download_url = format!("{}/v{}/Comet_{}_universal.dmg", 
        DOWNLOAD_URL, 
        status.version,
        status.version
    );

    window.emit("update-progress", UpdateProgress {
        state: "downloading".to_string(),
        progress: Some(0.0),
        debug_message: Some(format!("Starting download from: {}", download_url)),
    }).unwrap();

    let response = client
        .get(&download_url)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    let total_size = response.content_length().unwrap_or(0);
    let mut downloaded: u64 = 0;
    let mut bytes = Vec::new();

    let mut stream = response.bytes_stream();
    use futures_util::StreamExt;
    while let Some(chunk) = stream.next().await {
        let chunk = chunk.map_err(|e| e.to_string())?;
        downloaded += chunk.len() as u64;
        bytes.extend_from_slice(&chunk);

        if total_size > 0 {
            let progress = (downloaded as f32 / total_size as f32) * 100.0;
            window.emit("update-progress", UpdateProgress {
                state: "downloading".to_string(),
                progress: Some(progress),
                debug_message: Some(format!("Downloaded: {}/{} bytes", downloaded, total_size)),
            }).unwrap();
        }
    }

    let dmg_path = get_downloads_dir().join(format!("Comet_{}_universal.dmg", status.version));
    fs::write(&dmg_path, bytes).map_err(|e| e.to_string())?;

    window.emit("update-progress", UpdateProgress {
        state: "installing".to_string(),
        progress: None,
        debug_message: Some("Starting installation process".to_string()),
    }).unwrap();

    if PathBuf::from(APP_PATH).exists() {
        let quit_output = Command::new("pkill")
            .arg("-f")
            .arg("Comet.app")
            .output()
            .map_err(|e| e.to_string())?;
        
        window.emit("update-progress", UpdateProgress {
            state: "installing".to_string(),
            progress: None,
            debug_message: Some(format!("Quit app result: {}", debug_cmd_output(quit_output))),
        }).unwrap();
    }

    let mount_output = Command::new("hdiutil")
        .arg("attach")
        .arg(&dmg_path)
        .output()
        .map_err(|e| e.to_string())?;

    window.emit("update-progress", UpdateProgress {
        state: "installing".to_string(),
        progress: None,
        debug_message: Some(format!("Mount DMG result: {}", debug_cmd_output(mount_output))),
    }).unwrap();

    let install_output = Command::new("osascript")
        .arg("-e")
        .arg(format!(
            "do shell script \"\\
            /usr/bin/ditto -rsrc /Volumes/Comet/Comet.app {} && \\
            chown -R root:wheel {} && \\
            chmod -R 755 {} && \\
            /System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f {}\\
            \" with administrator privileges",
            APP_PATH, APP_PATH, APP_PATH, APP_PATH
        ))
        .output()
        .map_err(|e| e.to_string())?;

    window.emit("update-progress", UpdateProgress {
        state: "installing".to_string(),
        progress: None,
        debug_message: Some(format!("Install app result: {}", debug_cmd_output(install_output))),
    }).unwrap();

    let unmount_output = Command::new("hdiutil")
        .arg("detach")
        .arg("/Volumes/Comet")
        .arg("-force")
        .output()
        .map_err(|e| e.to_string())?;

    window.emit("update-progress", UpdateProgress {
        state: "installing".to_string(),
        progress: None,
        debug_message: Some(format!("Unmount DMG result: {}", debug_cmd_output(unmount_output))),
    }).unwrap();

    fs::remove_file(&dmg_path).map_err(|e| e.to_string())?;

    window.emit("update-progress", UpdateProgress {
        state: "completed".to_string(),
        progress: None,
        debug_message: Some("Installation completed successfully".to_string()),
    }).unwrap();

    Command::new("open")
        .arg("-n")
        .arg(APP_PATH)
        .spawn()
        .map_err(|e| e.to_string())?;

    window.app_handle().exit(0);
    Ok(())
} 
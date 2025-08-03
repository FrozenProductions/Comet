use dirs;
use semver::Version;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::process::Command;
use tauri::Manager;

const CURRENT_VERSION: &str = "1.1.1";
const STATUS_URL: &str = "https://www.comet-ui.fun/api/v1/status";
const DOWNLOAD_URL: &str = "https://github.com/FrozenProductions/Comet/releases/download";
const APP_PATH: &str = "/Applications/Comet.app";

#[derive(Debug, Serialize, Deserialize)]
pub struct StatusInfo {
    pub online: bool,
    pub message: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct StatusResponse {
    status: StatusInfo,
    version: String,
    prerelease: Option<String>,
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

#[tauri::command]
pub fn is_official_app(app_handle: tauri::AppHandle) -> bool {
    let app_name = app_handle.package_info().name.clone();
    app_name == "Comet"
}

#[tauri::command]
pub async fn check_for_updates(
    app_handle: tauri::AppHandle,
    check_nightly: bool,
) -> Result<Option<String>, String> {
    if !is_official_app(app_handle.clone()) {
        return Ok(None);
    }

    let client = reqwest::Client::new();

    let response = client
        .get(STATUS_URL)
        .header("User-Agent", "Comet-App")
        .send()
        .await
        .map_err(|e| format!("Failed to fetch status: {}", e))?;

    let status = response
        .json::<StatusResponse>()
        .await
        .map_err(|e| format!("Failed to parse JSON response: {}", e))?;

    let current = Version::parse(CURRENT_VERSION).unwrap();
    let stable = Version::parse(&status.version).map_err(|e| e.to_string())?;

    if stable > current {
        return Ok(Some(status.version));
    }

    if check_nightly {
        if let Some(ref prerelease) = status.prerelease {
            let latest = Version::parse(&prerelease).map_err(|e| e.to_string())?;
            if latest > current {
                return Ok(Some(prerelease.clone()));
            }
        }
    }

    Ok(None)
}

#[tauri::command]
pub async fn check_comet_status(window: tauri::Window) -> Result<StatusInfo, String> {
    let client = reqwest::Client::new();
    let response = client
        .get(STATUS_URL)
        .header("User-Agent", "Comet-App")
        .send()
        .await
        .map_err(|e| format!("Failed to fetch status: {}", e))?;

    let status = response
        .json::<StatusResponse>()
        .await
        .map_err(|e| format!("Failed to parse JSON response: {}", e))?;

    window
        .emit("comet-status-update", &status.status)
        .unwrap_or_default();
    Ok(status.status)
}

#[tauri::command]
pub async fn download_and_install_update(
    window: tauri::Window,
    check_nightly: bool,
) -> Result<(), String> {
    let app_handle = window.app_handle();

    let app_name = app_handle.package_info().name.clone();
    if app_name != "Comet" {
        window
            .emit(
                "update-progress",
                UpdateProgress {
                    state: "completed".to_string(),
                    progress: None,
                    debug_message: Some(format!("Updates not available for {}", app_name)),
                },
            )
            .unwrap();

        return Ok(());
    }

    window
        .emit(
            "update-progress",
            UpdateProgress {
                state: "preparing".to_string(),
                progress: None,
                debug_message: None,
            },
        )
        .unwrap();

    let client = reqwest::Client::new();

    let status = client
        .get(STATUS_URL)
        .header("User-Agent", "Comet-App")
        .send()
        .await
        .map_err(|e| format!("Failed to fetch status: {}", e))?
        .json::<StatusResponse>()
        .await
        .map_err(|e| format!("Failed to parse JSON response: {}", e))?;

    let current = Version::parse(CURRENT_VERSION).unwrap();
    let _stable = Version::parse(&status.version).map_err(|e| e.to_string())?;

    let version_to_use = if check_nightly {
        if let Some(ref prerelease) = status.prerelease {
            let nightly = Version::parse(prerelease).map_err(|e| e.to_string())?;
            if nightly > current {
                prerelease.clone()
            } else {
                status.version
            }
        } else {
            status.version
        }
    } else {
        status.version
    };

    let download_url = format!(
        "{}/v{}/Comet_1.0.0_universal.dmg",
        DOWNLOAD_URL, version_to_use
    );
    let dmg_path = get_downloads_dir().join("Comet_1.0.0_universal.dmg");
    let script_path = get_downloads_dir().join("comet_installer.sh");

    window
        .emit(
            "update-progress",
            UpdateProgress {
                state: "downloading".to_string(),
                progress: Some(0.0),
                debug_message: None,
            },
        )
        .unwrap();

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
            window
                .emit(
                    "update-progress",
                    UpdateProgress {
                        state: "downloading".to_string(),
                        progress: Some(progress),
                        debug_message: None,
                    },
                )
                .unwrap();
        }
    }

    fs::write(&dmg_path, bytes).map_err(|e| e.to_string())?;

    window
        .emit(
            "update-progress",
            UpdateProgress {
                state: "preparing".to_string(),
                progress: None,
                debug_message: None,
            },
        )
        .unwrap();

    let script_content = String::from("#!/bin/bash
set -e

parent_pid=") + &std::process::id().to_string() + &String::from("
while ps -p $parent_pid > /dev/null; do
    sleep 1
done

if [ -d \"/Volumes/Comet\" ]; then
    hdiutil detach \"/Volumes/Comet\" -force || true
fi

hdiutil attach \"") + &dmg_path.display().to_string() + &String::from("\" -nobrowse
if [ ! -d \"/Volumes/Comet\" ]; then
    exit 1
fi

if [ -d \"") + APP_PATH + &String::from("\" ]; then
    rm -rf \"") + APP_PATH + &String::from("\"
fi

cp -R \"/Volumes/Comet/Comet.app\" \"") + APP_PATH + &String::from("\"
if [ ! -d \"") + APP_PATH + &String::from("\" ]; then
    exit 1
fi

chmod -R 777 \"") + APP_PATH + &String::from("\"

/System/Library/Frameworks/CoreServices.framework/Frameworks/LaunchServices.framework/Support/lsregister -f \"") + APP_PATH + &String::from("\"

hdiutil detach \"/Volumes/Comet\" -force

rm -f \"") + &dmg_path.display().to_string() + &String::from("\"

rm -f \"$0\"

open -n \"") + APP_PATH + &String::from("\"

exit 0");

    let mut file = std::fs::File::create(&script_path).map_err(|e| e.to_string())?;
    file.write_all(script_content.as_bytes())
        .map_err(|e| e.to_string())?;

    let chmod_output = Command::new("chmod")
        .arg("+x")
        .arg(&script_path)
        .output()
        .map_err(|e| e.to_string())?;

    if !chmod_output.status.success() {
        let _ = fs::remove_file(&script_path);
        let _ = fs::remove_file(&dmg_path);
        return Err(format!(
            "Failed to make installer script executable: {}",
            String::from_utf8_lossy(&chmod_output.stderr)
        ));
    }

    window
        .emit(
            "update-progress",
            UpdateProgress {
                state: "installing".to_string(),
                progress: None,
                debug_message: None,
            },
        )
        .unwrap();

    let _installer_process = Command::new("bash")
        .arg(&script_path)
        .spawn()
        .map_err(|e| {
            let _ = fs::remove_file(&script_path);
            let _ = fs::remove_file(&dmg_path);
            e.to_string()
        })?;

    window
        .emit(
            "update-progress",
            UpdateProgress {
                state: "completed".to_string(),
                progress: None,
                debug_message: None,
            },
        )
        .unwrap();

    std::thread::sleep(std::time::Duration::from_secs(2));
    window.app_handle().exit(0);
    Ok(())
}

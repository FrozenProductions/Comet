use std::fs::{self, File};
use std::path::PathBuf;
use std::process::Command;

const TEST_FILE_NAME: &str = ".comet_test_permissions";

#[derive(Debug, Clone, serde::Serialize)]
pub struct PathPermissionStatus {
    path: String,
    has_permission: bool,
}

#[derive(Debug, Clone, serde::Serialize)]
pub struct PermissionsCheckResult {
    paths: Vec<PathPermissionStatus>,
    all_permitted: bool,
}

fn expand_path(path: &str) -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    let path = path.replace("~", home.to_str()?);
    Some(PathBuf::from(path))
}

fn check_directory_permissions(path: &PathBuf) -> bool {
    if !path.exists() {
        if let Err(_) = fs::create_dir_all(path) {
            return false;
        }
        return true;
    }

    let test_file_path = path.join(TEST_FILE_NAME);
    match File::create(&test_file_path) {
        Ok(_) => {
            let _ = fs::remove_file(&test_file_path);
            true
        }
        Err(_) => false,
    }
}

fn fix_permissions(path: &PathBuf) -> bool {
    Command::new("chmod")
        .arg("-R")
        .arg("777")
        .arg(path)
        .status()
        .map_or(false, |status| status.success())
}

#[tauri::command]
pub async fn check_permissions(window: tauri::Window) -> Result<PermissionsCheckResult, String> {
    let paths = vec![
        "~/Library/Application Support/com.comet.dev",
        "~/Hydrogen",
        "~/Applications/Roblox.app/Contents/MacOS/ClientSettings",
    ];

    let mut results = Vec::new();
    let mut all_permitted = true;

    for path_str in paths {
        let path = expand_path(path_str).ok_or_else(|| "Failed to expand path".to_string())?;
        let has_permission = check_directory_permissions(&path);

        if !has_permission {
            all_permitted = false;
        }

        results.push(PathPermissionStatus {
            path: path_str.to_string(),
            has_permission,
        });
    }

    if !all_permitted {
        window
            .emit("show-permissions-modal", &results)
            .unwrap_or_default();
    }

    Ok(PermissionsCheckResult {
        paths: results,
        all_permitted,
    })
}

#[tauri::command]
pub async fn fix_path_permissions(path: String) -> Result<bool, String> {
    let expanded_path = expand_path(&path).ok_or_else(|| "Failed to expand path".to_string())?;
    Ok(fix_permissions(&expanded_path))
}

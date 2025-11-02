use std::path::PathBuf;
use std::process::Command;
use std::thread;
use tauri::command;

#[command]
pub async fn uninstall_app(
    app_handle: tauri::AppHandle
) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let app_name = app_handle.package_info().name.clone();
    
    let executor_dir_name = if app_name.to_lowercase() == "comet" || app_name.to_lowercase() == "hydrogen" {
        "Hydrogen".to_string()
    } else {
        app_name.clone()
    };

    let mut paths_to_remove: Vec<PathBuf> = vec![];

    paths_to_remove.push(home.join(&executor_dir_name));
    paths_to_remove.push(home.join(format!(".{}", executor_dir_name.to_lowercase())));
    
    paths_to_remove.push("/Applications/Roblox.app".into());
    
    paths_to_remove.push(home.join("Library/Application Support/Roblox"));
    paths_to_remove.push(home.join("Library/Caches/com.roblox.RobloxStudio"));
    paths_to_remove.push(home.join("Library/Caches/com.roblox.Roblox"));
    paths_to_remove.push(home.join("Library/Logs/Roblox"));
    paths_to_remove.push(home.join("Library/Preferences/com.roblox.Roblox.plist"));
    paths_to_remove.push(home.join("Library/Preferences/com.roblox.RobloxStudio.plist"));
    
    paths_to_remove.push(format!("/Applications/{}.app", executor_dir_name).into());

    let status = Command::new("osascript")
        .args(&["-e", "do shell script \"echo test\" with administrator privileges"])
        .output()
        .map_err(|e| e.to_string())?;

    if !status.status.success() {
        return Err("Failed to obtain administrator privileges".to_string());
    }

    thread::spawn(move || {
        for path in paths_to_remove {
            if path.exists() {
                if path.starts_with("/Applications") {
                    let _ = Command::new("osascript")
                        .args(&[
                            "-e",
                            &format!(
                                "do shell script \"rm -rf '{}'\" with administrator privileges",
                                path.display()
                            ),
                        ])
                        .output();
                } else {
                    let _ = std::fs::remove_dir_all(&path);
                }
            }
        }
        
        std::process::exit(0);
    });

    Ok(())
}
#[tauri::command]
pub fn check_hydrogen_installation() -> bool {
    // TODO: Better way to check if Hydrogen is installed
    let path = std::path::Path::new("/Applications/Roblox.app/Contents/MacOS/RobloxPlayer.copy");
    path.exists()
} 
#[tauri::command]
pub fn is_official_app(app_handle: tauri::AppHandle) -> bool {
    let app_name = app_handle.package_info().name.clone();
    app_name == "Comet"
}

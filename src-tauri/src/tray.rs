use serde::{Deserialize, Serialize};
use std::collections::HashMap;
use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CustomTrayScript {
    pub id: String,
    pub name: String,
    pub content: String,
    pub order: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TrayConfig {
    pub enabled: bool,
    pub show_scripts: bool,
    pub show_last_script: bool,
    pub custom_scripts: Vec<CustomTrayScript>,
}

impl Default for TrayConfig {
    fn default() -> Self {
        Self {
            enabled: true,
            show_scripts: true,
            show_last_script: true,
            custom_scripts: Vec::new(),
        }
    }
}

fn create_header(id: &str, title: &str) -> CustomMenuItem {
    let header_id = format!("header_{}", id);
    CustomMenuItem::new(header_id, format!("• {} •", title)).disabled()
}

pub fn create_tray_menu(
    scripts: Option<HashMap<String, super::ScriptConfig>>,
    config: &TrayConfig,
) -> SystemTrayMenu {
    if !config.enabled {
        return SystemTrayMenu::new();
    }

    let header_window = create_header("window", "Window Controls");
    let open = CustomMenuItem::new("open".to_string(), "Show Window");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide Window");

    let mut tray_menu = SystemTrayMenu::new()
        .add_item(header_window)
        .add_item(open)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator);

    if !config.custom_scripts.is_empty() {
        let header_custom = create_header("custom", "Custom Scripts");
        tray_menu = tray_menu.add_item(header_custom);

        let mut sorted_scripts = config.custom_scripts.clone();
        sorted_scripts.sort_by_key(|script| script.order);

        for script in sorted_scripts {
            let menu_item = CustomMenuItem::new(
                format!("custom_{}", script.id),
                format!("Execute {}", script.name),
            );
            tray_menu = tray_menu.add_item(menu_item);
        }

        tray_menu = tray_menu.add_native_item(SystemTrayMenuItem::Separator);
    }

    if config.show_scripts || config.show_last_script {
        let header_scripts = create_header("scripts", "Scripts");
        tray_menu = tray_menu.add_item(header_scripts);

        if config.show_scripts {
            if let Some(scripts) = scripts {
                for (key, config) in scripts {
                    let display_name = config
                        .display_name
                        .unwrap_or_else(|| super::format_script_name(&key));
                    let menu_item = CustomMenuItem::new(
                        format!("execute_{}", key),
                        format!("Execute {}", display_name),
                    );
                    tray_menu = tray_menu.add_item(menu_item);
                }
            } else {
                let failed_item =
                    CustomMenuItem::new("failed_fetch".to_string(), "Failed to fetch scripts")
                        .disabled();
                tray_menu = tray_menu.add_item(failed_item);
            }
        }

        if config.show_last_script {
            tray_menu = tray_menu.add_item(CustomMenuItem::new(
                "last_script".to_string(),
                "Execute Last Script",
            ));
        }

        tray_menu = tray_menu.add_native_item(SystemTrayMenuItem::Separator);
    }

    let header_app = create_header("app", "App Controls");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit App");
    tray_menu = tray_menu.add_item(header_app).add_item(quit);

    tray_menu
}

pub fn handle_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => {
            if id.starts_with("header_") {
                return;
            }

            match id.as_str() {
                "open" => {
                    if let Some(window) = app.get_window("main") {
                        window.show().unwrap();
                        window.set_focus().unwrap();
                    }
                }
                "hide" => {
                    if let Some(window) = app.get_window("main") {
                        window.hide().unwrap();
                    }
                }
                id if id.starts_with("execute_") => {
                    let script_key = id.strip_prefix("execute_").unwrap().to_string();
                    tauri::async_runtime::spawn(async move {
                        let _ = super::execute_script_by_key(&script_key).await;
                    });
                }
                id if id.starts_with("custom_") => {
                    let script_id = id.strip_prefix("custom_").unwrap().to_string();

                    if let Ok(config) = get_tray_config(app.app_handle()) {
                        if let Some(script) =
                            config.custom_scripts.iter().find(|s| s.id == script_id)
                        {
                            let content = script.content.clone();
                            tauri::async_runtime::spawn(async move {
                                let _ = super::execute_script(content).await;
                            });
                        }
                    }
                }
                "last_script" => {
                    tauri::async_runtime::spawn(async {
                        let _ = super::execute_last_script().await;
                    });
                }
                "quit" => {
                    app.exit(0);
                }
                _ => {}
            }
        }
        _ => {}
    }
}

#[tauri::command]
pub fn get_tray_config(app_handle: tauri::AppHandle) -> Result<TrayConfig, String> {
    let path = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Failed to get app data directory".to_string())?
        .join("tray_config.json");

    if !path.exists() {
        return Ok(TrayConfig::default());
    }

    let content =
        std::fs::read_to_string(path).map_err(|e| format!("Failed to read tray config: {}", e))?;

    serde_json::from_str(&content).map_err(|e| format!("Failed to parse tray config: {}", e))
}

#[tauri::command]
pub fn save_tray_config(app_handle: tauri::AppHandle, config: TrayConfig) -> Result<(), String> {
    let app_data_dir = app_handle
        .path_resolver()
        .app_data_dir()
        .ok_or_else(|| "Failed to get app data directory".to_string())?;

    if !app_data_dir.exists() {
        std::fs::create_dir_all(&app_data_dir)
            .map_err(|e| format!("Failed to create app data directory: {}", e))?;
    }

    let path = app_data_dir.join("tray_config.json");
    let content = serde_json::to_string_pretty(&config)
        .map_err(|e| format!("Failed to serialize tray config: {}", e))?;

    std::fs::write(path, content).map_err(|e| format!("Failed to write tray config: {}", e))?;

    let scripts = match tauri::async_runtime::block_on(super::fetch_script_configs()) {
        Ok(configs) => Some(configs.scripts),
        Err(_) => None,
    };

    if config.enabled {
        let menu = create_tray_menu(scripts, &config);
        app_handle.tray_handle().set_menu(menu).unwrap();
    } else {
        app_handle
            .tray_handle()
            .set_menu(SystemTrayMenu::new())
            .unwrap();
    }

    Ok(())
}

#[tauri::command]
pub fn update_tray_menu(app_handle: tauri::AppHandle) -> Result<(), String> {
    let config = get_tray_config(app_handle.clone())?;

    let scripts = match tauri::async_runtime::block_on(super::fetch_script_configs()) {
        Ok(configs) => Some(configs.scripts),
        Err(_) => None,
    };

    if config.enabled {
        let menu = create_tray_menu(scripts, &config);
        app_handle.tray_handle().set_menu(menu).unwrap();
    } else {
        app_handle
            .tray_handle()
            .set_menu(SystemTrayMenu::new())
            .unwrap();
    }

    Ok(())
}

#[tauri::command]
pub fn add_custom_tray_script(
    app_handle: tauri::AppHandle,
    name: String,
    content: String,
) -> Result<(), String> {
    let mut config = get_tray_config(app_handle.clone())?;

    let id = format!("{}", uuid::Uuid::new_v4().as_simple());

    let next_order = config
        .custom_scripts
        .iter()
        .map(|script| script.order)
        .max()
        .unwrap_or(0)
        + 1;

    config.custom_scripts.push(CustomTrayScript {
        id,
        name,
        content,
        order: next_order,
    });

    save_tray_config(app_handle, config)
}

#[tauri::command]
pub fn update_custom_tray_script(
    app_handle: tauri::AppHandle,
    id: String,
    name: Option<String>,
    content: Option<String>,
    order: Option<usize>,
) -> Result<(), String> {
    let mut config = get_tray_config(app_handle.clone())?;

    if let Some(script) = config.custom_scripts.iter_mut().find(|s| s.id == id) {
        if let Some(name) = name {
            script.name = name;
        }
        if let Some(content) = content {
            script.content = content;
        }
        if let Some(order) = order {
            script.order = order;
        }

        save_tray_config(app_handle, config)
    } else {
        Err(format!("Script with ID {} not found", id))
    }
}

#[tauri::command]
pub fn remove_custom_tray_script(app_handle: tauri::AppHandle, id: String) -> Result<(), String> {
    let mut config = get_tray_config(app_handle.clone())?;

    let initial_len = config.custom_scripts.len();
    config.custom_scripts.retain(|s| s.id != id);

    if config.custom_scripts.len() < initial_len {
        save_tray_config(app_handle, config)
    } else {
        Err(format!("Script with ID {} not found", id))
    }
}

#[tauri::command]
pub fn reorder_custom_tray_scripts(
    app_handle: tauri::AppHandle,
    ids: Vec<String>,
) -> Result<(), String> {
    let mut config = get_tray_config(app_handle.clone())?;

    for id in &ids {
        if !config.custom_scripts.iter().any(|s| &s.id == id) {
            return Err(format!("Script with ID {} not found", id));
        }
    }

    for (index, id) in ids.iter().enumerate() {
        if let Some(script) = config.custom_scripts.iter_mut().find(|s| s.id == *id) {
            script.order = index;
        }
    }

    save_tray_config(app_handle, config)
}

#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dirs;
use reqwest::blocking::Client as BlockingClient;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::fs;
use std::path::PathBuf;
use std::process::Command;
use std::sync::atomic::Ordering;
use std::sync::{Arc, Mutex};
use std::thread;
use std::time::Duration;
use tauri::{Manager, State, SystemTray, SystemTrayMenu, Window, WindowEvent};

const HOST: &str = "127.0.0.1";
const MIN_PORT: u16 = 6969;
const MAX_PORT: u16 = 7069;
const CHECK_INTERVAL: Duration = Duration::from_millis(2500);

#[derive(Debug, Clone, serde::Serialize)]
struct ConnectionStatus {
    is_connected: bool,
    port: Option<u16>,
    current_port: u16,
    is_connecting: bool,
}

#[derive(Debug, Serialize, Deserialize)]
struct VersionMessage {
    message: String,
    nfu: bool,
    image_url: String,
}

#[derive(Debug, Serialize, Deserialize)]
struct VersionMessages {
    messages: std::collections::HashMap<String, VersionMessage>,
}

#[tauri::command]
async fn fetch_version_messages() -> Result<VersionMessages, String> {
    let client = reqwest::Client::new();
    let response = client
        .get("https://comet-ui.fun/api/v1/messages")
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if !response.status().is_success() {
        return Err("Failed to fetch messages".to_string());
    }

    response
        .json::<VersionMessages>()
        .await
        .map_err(|e| e.to_string())
}

#[derive(Debug)]
struct ConnectionManager {
    client: BlockingClient,
    port: Option<u16>,
}

#[derive(Debug)]
struct WindowState {
    is_focused: Arc<Mutex<bool>>,
}

impl WindowState {
    fn new() -> Self {
        Self {
            is_focused: Arc::new(Mutex::new(false)),
        }
    }
}

impl ConnectionManager {
    fn new() -> Self {
        Self {
            client: BlockingClient::builder()
                .timeout(Duration::from_secs(1))
                .build()
                .unwrap(),
            port: None,
        }
    }

    fn is_connected(&mut self) -> bool {
        if let Some(port) = self.port {
            if self.check_connection(port) {
                return true;
            }
            self.port = None;
        }
        false
    }

    fn check_connection(&self, port: u16) -> bool {
        let url = format!("http://{}:{}/secret", HOST, port);
        match self.client.get(&url).send() {
            Ok(response) => {
                if let Ok(text) = response.text() {
                    return text == "0xdeadbeef";
                }
            }
            Err(_) => {}
        }
        false
    }

    fn connect(&mut self, port: u16) -> bool {
        if self.check_connection(port) {
            self.port = Some(port);
            return true;
        }
        false
    }

    fn send(&mut self, script: &str) -> bool {
        if let Some(port) = self.port {
            let url = format!("http://{}:{}/execute", HOST, port);
            match self
                .client
                .post(&url)
                .header("Content-Type", "text/plain")
                .body(script.to_string())
                .send()
            {
                Ok(response) => return response.status().is_success(),
                Err(_) => {
                    self.port = None;
                }
            }
        }
        false
    }
}

#[derive(Clone)]
struct AppState {
    connection: Arc<Mutex<ConnectionManager>>,
    status: Arc<Mutex<ConnectionStatus>>,
    flag_validator: Arc<FlagValidator>,
}

impl AppState {
    fn new() -> Self {
        Self {
            connection: Arc::new(Mutex::new(ConnectionManager::new())),
            status: Arc::new(Mutex::new(ConnectionStatus {
                is_connected: false,
                port: None,
                current_port: MIN_PORT,
                is_connecting: false,
            })),
            flag_validator: Arc::new(FlagValidator::new()),
        }
    }

    fn update_status(&self, window: Option<&Window>, is_connected: bool, port: Option<u16>) {
        if let Ok(mut status) = self.status.lock() {
            status.is_connected = is_connected;
            status.port = port;
            status.current_port = port.unwrap_or(status.current_port);
            if let Some(window) = window {
                window
                    .emit("connection-update", &*status)
                    .unwrap_or_default();
            }
        }
    }

    fn set_current_port(&self, window: Option<&Window>, port: u16) {
        if let Ok(mut conn) = self.connection.lock() {
            conn.port = None;
        }

        if let Ok(mut status) = self.status.lock() {
            status.is_connected = false;
            status.port = None;
            status.current_port = port;
            if let Some(window) = window {
                window
                    .emit("connection-update", &*status)
                    .unwrap_or_default();
            }
        }
    }
}

#[tauri::command]
fn get_connection_status(state: State<AppState>) -> ConnectionStatus {
    state.status.lock().unwrap().clone()
}

#[tauri::command]
async fn send_script(script: String, state: State<'_, AppState>) -> Result<bool, String> {
    let mut conn = state.connection.lock().map_err(|e| e.to_string())?;
    let success = conn.send(&script);
    if !success {
        state.update_status(None, false, None);
    }
    Ok(success)
}

#[tauri::command]
async fn change_setting(
    key: String,
    value: String,
    state: State<'_, AppState>,
) -> Result<bool, String> {
    let content = format!("{} {}", key, value);
    let mut conn = state.connection.lock().map_err(|e| e.to_string())?;
    let success = conn.send(&content);
    if !success {
        state.update_status(None, false, None);
    }
    Ok(success)
}

#[tauri::command]
async fn refresh_connection(
    state: State<'_, AppState>,
    window: Window,
) -> Result<ConnectionStatus, String> {
    let current_port = {
        let status = state.status.lock().map_err(|e| e.to_string())?;
        status.current_port
    };

    let mut conn = state.connection.lock().map_err(|e| e.to_string())?;
    if conn.connect(current_port) {
        state.update_status(Some(&window), true, Some(current_port));
    } else {
        state.update_status(Some(&window), false, None);
    }

    Ok(state.status.lock().map_err(|e| e.to_string())?.clone())
}

#[tauri::command]
async fn increment_port(
    state: State<'_, AppState>,
    window: Window,
) -> Result<ConnectionStatus, String> {
    let current_port = {
        let status = state.status.lock().map_err(|e| e.to_string())?;
        status.current_port
    };

    let next_port = if current_port >= MAX_PORT {
        MIN_PORT
    } else {
        current_port + 1
    };

    state.set_current_port(Some(&window), next_port);
    Ok(state.status.lock().map_err(|e| e.to_string())?.clone())
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct Tab {
    id: String,
    title: String,
    content: String,
    language: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct TabState {
    tabs: Vec<Tab>,
    active_tab: Option<String>,
}

#[tauri::command]
fn close_window(window: tauri::Window) {
    window.close().unwrap();
}

#[tauri::command]
fn minimize_window(window: tauri::Window) {
    window.minimize().unwrap();
}

#[tauri::command]
fn toggle_maximize_window(window: tauri::Window) {
    if window.is_maximized().unwrap() {
        window.unmaximize().unwrap();
    } else {
        window.maximize().unwrap();
    }
}

#[tauri::command]
fn hide_window(window: Window) {
    window.hide().unwrap();
}

#[derive(Debug, thiserror::Error)]
pub enum ExecuteError {
    #[error("Failed to connect to server: {0}")]
    ConnectionError(String),
    #[error("Failed to execute script: {0}")]
    ExecutionError(String),
}

impl serde::Serialize for ExecuteError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::ser::Serializer,
    {
        serializer.serialize_str(self.to_string().as_ref())
    }
}

#[tauri::command]
async fn execute_script(script: String) -> Result<String, String> {
    let client = reqwest::Client::builder()
        .timeout(Duration::from_secs(5))
        .build()
        .map_err(|e| e.to_string())?;

    let mut last_error = String::new();
    let mut server_port = None;

    for port in MIN_PORT..=MAX_PORT {
        let url = format!("http://{}:{}/secret", HOST, port);
        match client.get(&url).send().await {
            Ok(response) => {
                if let Ok(text) = response.text().await {
                    if text == "0xdeadbeef" {
                        server_port = Some(port);
                        break;
                    }
                }
            }
            Err(e) => {
                last_error = e.to_string();
            }
        }
    }

    let port = server_port.ok_or_else(|| {
        format!(
            "Could not locate HTTP server on ports {}-{}. Last error: {}",
            MIN_PORT, MAX_PORT, last_error
        )
    })?;

    let url = format!("http://{}:{}/execute", HOST, port);
    let response = client
        .post(&url)
        .header("Content-Type", "text/plain")
        .body(script)
        .send()
        .await
        .map_err(|e| e.to_string())?;

    if response.status().is_success() {
        response.text().await.map_err(|e| e.to_string())
    } else {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        Err(format!("HTTP {}: {}", status, text))
    }
}

mod auto_execute;
mod config;
mod execution_history;
mod fast_flags;
mod fast_flags_profiles;
mod flag_validator;
mod hydrogen;
mod login_items;
mod roblox_logs;
mod rscripts;
mod suggestions;
mod tabs;
mod tray;
mod updater;
mod workspace;

use fast_flags_profiles::{FastFlagsProfile, FastFlagsProfileManager};
use flag_validator::FlagValidator;
use suggestions::fetch_suggestions;

#[tauri::command]
async fn open_roblox() -> Result<(), String> {
    Command::new("open")
        .arg("-a")
        .arg("Roblox")
        .spawn()
        .map_err(|e| e.to_string())?;

    Ok(())
}

#[tauri::command]
async fn load_fast_flags_profiles(
    app_handle: tauri::AppHandle,
) -> Result<(Vec<FastFlagsProfile>, Option<String>), String> {
    let settings_file = std::path::PathBuf::from(
        "/Applications/Roblox.app/Contents/MacOS/ClientSettings/ClientAppSettings.json",
    );
    let profile_manager = FastFlagsProfileManager::new(&app_handle);

    if !settings_file.exists() {
        let _ = profile_manager.clear_active_profile();
    }

    let profiles = profile_manager.load_profiles()?;
    let active_id = profile_manager.get_active_profile_id()?;
    Ok((profiles, active_id))
}

#[tauri::command]
async fn save_fast_flags_profile(
    app_handle: tauri::AppHandle,
    profile: FastFlagsProfile,
) -> Result<(), String> {
    let profile_manager = FastFlagsProfileManager::new(&app_handle);
    profile_manager.save_profile(profile, &app_handle).await
}

#[tauri::command]
async fn delete_fast_flags_profile(
    app_handle: tauri::AppHandle,
    profile_id: String,
) -> Result<(), String> {
    let profile_manager = FastFlagsProfileManager::new(&app_handle);
    profile_manager.delete_profile(&profile_id)
}

#[tauri::command]
async fn activate_fast_flags_profile(
    app_handle: tauri::AppHandle,
    profile_id: String,
) -> Result<FastFlagsProfile, String> {
    let profile_manager = FastFlagsProfileManager::new(&app_handle);
    profile_manager
        .activate_profile(&app_handle, &profile_id)
        .await
}

#[tauri::command]
async fn validate_flags(
    flags: Vec<String>,
    state: State<'_, AppState>,
) -> Result<Vec<String>, String> {
    state.flag_validator.validate_flags(&flags).await
}

#[tauri::command]
async fn refresh_flag_validation_cache(state: State<'_, AppState>) -> Result<(), String> {
    state.flag_validator.refresh_cache().await;
    Ok(())
}

pub fn open_directory(path: PathBuf) -> Result<(), String> {
    if !path.exists() {
        fs::create_dir_all(&path).map_err(|e| format!("Failed to create directory: {}", e))?;
    }

    Command::new("open")
        .arg(path)
        .spawn()
        .map_err(|e| format!("Failed to open directory: {}", e))?;

    Ok(())
}

#[tauri::command]
async fn open_hydrogen_folder() -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let hydrogen_dir = home.join("Hydrogen");
    open_directory(hydrogen_dir)
}

#[tauri::command]
async fn open_comet_folder() -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let app_dir = home.join("Library/Application Support/com.comet.dev");
    open_directory(app_dir)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ScriptConfig {
    fetch: Option<bool>,
    url: Option<String>,
    execute: Option<bool>,
    #[serde(default)]
    content: Option<String>,
    display_name: Option<String>,
}

impl ScriptConfig {
    fn from_value(value: Value) -> Result<Self, String> {
        let fetch = value.get("fetch").and_then(|v| v.as_bool());
        let url = value.get("url").and_then(|v| v.as_str()).map(String::from);
        let execute = value.get("execute").and_then(|v| v.as_bool());
        let content = value.get("content").and_then(|v| {
            if v.is_string() {
                v.as_str().map(String::from)
            } else {
                Some(v.to_string())
            }
        });
        let display_name = value
            .get("display_name")
            .and_then(|v| v.as_str())
            .map(String::from);

        Ok(ScriptConfig {
            fetch,
            url,
            execute,
            content,
            display_name,
        })
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
struct ScriptsResponse {
    scripts: std::collections::HashMap<String, ScriptConfig>,
}

fn format_script_name(key: &str) -> String {
    key.split('_')
        .map(|word| {
            let mut chars = word.chars();
            match chars.next() {
                None => String::new(),
                Some(first) => {
                    let first_upper = first.to_uppercase().collect::<String>();
                    first_upper + &chars.as_str().to_lowercase()
                }
            }
        })
        .collect::<Vec<String>>()
        .join(" ")
}

fn create_fallback_config(key: &str) -> Option<ScriptConfig> {
    match key {
        "infinite_yield" => Some(ScriptConfig {
            fetch: Some(true),
            url: Some("https://raw.githubusercontent.com/EdgeIY/infiniteyield/refs/heads/master/source".to_string()),
            execute: None,
            content: None,
            display_name: Some("Infinite Yield".to_string()),
        }),
        "hydroxide" => Some(ScriptConfig {
            fetch: None,
            url: None,
            execute: Some(true),
            content: Some(r#"local owner = "Upbolt"
local branch = "revision"

local function webImport(file)
    return loadstring(game:HttpGetAsync(("https://raw.githubusercontent.com/%s/Hydroxide/%s/%s.lua"):format(owner, branch, file)), file .. '.lua')()
end

webImport("init")
webImport("ui/main")"#.to_string()),
            display_name: Some("Hydroxide".to_string()),
        }),
        "dex_explorer" => Some(ScriptConfig {
            fetch: Some(true),
            url: Some("https://cdn.wearedevs.net/scripts/Dex%20Explorer.txt".to_string()),
            execute: None,
            content: None,
            display_name: Some("DEX Explorer".to_string()),
        }),
        _ => None,
    }
}

async fn fetch_script_configs() -> Result<ScriptsResponse, String> {
    let client = reqwest::Client::new();
    match client
        .get("https://www.comet-ui.fun/api/v1/scripts")
        .send()
        .await
    {
        Ok(response) => {
            if !response.status().is_success() {
                return Err("Failed to fetch script configs".to_string());
            }

            let text = response.text().await.map_err(|e| e.to_string())?;

            let json: Value = serde_json::from_str(&text)
                .map_err(|e| format!("Failed to parse script configs: {}", e))?;

            let scripts_obj = json
                .get("scripts")
                .and_then(|v| v.as_object())
                .ok_or("Invalid scripts object")?;

            let mut scripts = std::collections::HashMap::new();

            for (key, value) in scripts_obj {
                if let Ok(config) = ScriptConfig::from_value(value.clone()) {
                    scripts.insert(key.clone(), config);
                }
            }

            let mut scripts_response = ScriptsResponse { scripts };

            for (key, config) in scripts_response.scripts.iter_mut() {
                if config.display_name.is_none() {
                    config.display_name = Some(format_script_name(key));
                }
            }

            Ok(scripts_response)
        }
        Err(_) => {
            let mut scripts = std::collections::HashMap::new();
            let fallback_keys = ["infinite_yield", "hydroxide", "dex_explorer"];

            for key in fallback_keys.iter() {
                if let Some(config) = create_fallback_config(key) {
                    scripts.insert(key.to_string(), config);
                }
            }

            Ok(ScriptsResponse { scripts })
        }
    }
}

async fn execute_script_by_key(key: &str) -> Result<String, String> {
    let configs = fetch_script_configs().await?;
    let config = configs
        .scripts
        .get(key)
        .ok_or_else(|| format!("{} config not found", format_script_name(key)))?;

    if let Some(true) = config.fetch {
        let url = config
            .url
            .as_ref()
            .ok_or_else(|| format!("{} URL not found", format_script_name(key)))?;
        let script = reqwest::get(url)
            .await
            .map_err(|e| e.to_string())?
            .text()
            .await
            .map_err(|e| e.to_string())?;
        execute_script(script).await
    } else if let Some(true) = config.execute {
        let content = config
            .content
            .as_ref()
            .ok_or_else(|| format!("{} content not found", format_script_name(key)))?;
        execute_script(content.to_string()).await
    } else {
        Err(format!("Invalid {} config", format_script_name(key)))
    }
}

#[tauri::command]
async fn execute_last_script() -> Result<String, String> {
    let script_path = tauri::api::path::local_data_dir()
        .ok_or("Could not find local data directory")?
        .join("com.comet.dev")
        .join("last_script.txt");

    if !script_path.exists() {
        return Err("No last script found".to_string());
    }

    let content = std::fs::read_to_string(&script_path)
        .map_err(|e| format!("Failed to read last script: {}", e))?;

    execute_script(content).await
}

#[tauri::command]
async fn save_last_script(script: String) -> Result<(), String> {
    let script_path = tauri::api::path::local_data_dir()
        .ok_or("Could not find local data directory")?
        .join("com.comet.dev");

    std::fs::create_dir_all(&script_path)
        .map_err(|e| format!("Failed to create directory: {}", e))?;

    let script_file = script_path.join("last_script.txt");
    std::fs::write(&script_file, script).map_err(|e| {
        println!("Failed to write script file: {}", e);
        format!("Failed to save last script: {}", e)
    })?;
    Ok(())
}

#[tauri::command]
async fn is_login_item_enabled() -> Result<bool, String> {
    login_items::is_login_item_enabled()
}

#[tauri::command]
async fn toggle_login_item(enabled: bool) -> Result<(), String> {
    login_items::toggle_login_item(enabled)
}

#[tauri::command]
fn get_app_name(app_handle: tauri::AppHandle) -> String {
    let app_name = app_handle.package_info().name.clone();
    if app_name.to_lowercase() == "comet" || app_name.to_lowercase() == "hydrogen" {
        "Hydrogen".to_string()
    } else {
        app_name
    }
}

fn main() {
    let app_state = AppState::new();
    let state_clone = app_state.clone();
    let window_state = WindowState::new();

    tauri::Builder::default()
        .manage(app_state)
        .manage(window_state)
        .system_tray(SystemTray::new().with_menu(SystemTrayMenu::new()))
        .on_system_tray_event(tray::handle_tray_event)
        .on_window_event(|event| {
            if let WindowEvent::CloseRequested { api, .. } = event.event() {
                event.window().hide().unwrap();
                api.prevent_close();
            }

            if let WindowEvent::Focused(focused) = event.event() {
                let state: State<WindowState> = event.window().state();
                *state.is_focused.lock().unwrap() = *focused;
            }
        })
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            let state = app.state::<AppState>();

            let app_handle = app.app_handle();
            let tray_config = match tray::get_tray_config(app_handle.clone()) {
                Ok(config) => config,
                Err(_) => tray::TrayConfig::default(),
            };

            if tray_config.enabled {
                let _ = tray::update_tray_menu(app_handle);
            } else {
                app.tray_handle().set_menu(SystemTrayMenu::new()).unwrap();
            }

            let window_clone = window.clone();
            tauri::async_runtime::spawn(async move {
                loop {
                    if let Err(e) = updater::check_comet_status(window_clone.clone()).await {
                        eprintln!("Failed to check Comet status: {}", e);
                    }
                    thread::sleep(Duration::from_secs(60));
                }
            });

            tauri::async_runtime::spawn(async move {
                roblox_logs::WATCHING.store(true, Ordering::SeqCst);
                if let Some(log_path) = roblox_logs::find_latest_log_file() {
                    if let Err(e) = roblox_logs::watch_log_file(window, log_path) {
                        eprintln!("Error watching log file: {}", e);
                    }
                }
            });

            tauri::async_runtime::spawn(async move {
                loop {
                    let mut should_try_connect = false;
                    {
                        let mut conn = state_clone.connection.lock().unwrap();
                        if !conn.is_connected() {
                            should_try_connect = true;
                            state_clone.update_status(None, false, None);
                        }
                    }

                    if should_try_connect {
                        let current_port = state_clone.status.lock().unwrap().current_port;
                        let mut conn = state_clone.connection.lock().unwrap();
                        if conn.connect(current_port) {
                            state_clone.update_status(None, true, Some(current_port));
                        }
                    }

                    thread::sleep(CHECK_INTERVAL);
                }
            });

            let flag_validator = state.flag_validator.clone();
            tauri::async_runtime::spawn(async move {
                flag_validator.refresh_cache().await;
            });

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_connection_status,
            send_script,
            change_setting,
            refresh_connection,
            increment_port,
            tabs::save_tab,
            tabs::delete_tab,
            tabs::save_tab_state,
            tabs::load_tabs,
            tabs::get_tab_state,
            tabs::rename_tab,
            close_window,
            minimize_window,
            toggle_maximize_window,
            execute_script,
            execute_last_script,
            save_last_script,
            auto_execute::get_auto_execute_files,
            auto_execute::save_auto_execute_file,
            auto_execute::delete_auto_execute_file,
            auto_execute::rename_auto_execute_file,
            auto_execute::open_auto_execute_directory,
            auto_execute::is_auto_execute_enabled,
            auto_execute::toggle_auto_execute,
            open_roblox,
            load_fast_flags_profiles,
            save_fast_flags_profile,
            delete_fast_flags_profile,
            activate_fast_flags_profile,
            validate_flags,
            refresh_flag_validation_cache,
            fast_flags::cleanup_fast_flags,
            fast_flags::open_fast_flags_directory,
            roblox_logs::start_log_watcher,
            roblox_logs::stop_log_watcher,
            hydrogen::check_executor_installation,
            hydrogen::install_app,
            workspace::load_workspaces,
            workspace::create_workspace,
            workspace::delete_workspace,
            workspace::set_active_workspace,
            workspace::rename_workspace,
            updater::check_for_updates,
            updater::download_and_install_update,
            updater::is_official_app,
            updater::check_comet_status,
            open_hydrogen_folder,
            open_comet_folder,
            fast_flags_profiles::export_fast_flags_profiles,
            fast_flags_profiles::import_fast_flags_profiles,
            hide_window,
            fast_flags::save_fast_flags,
            fast_flags::get_fast_flag_categories,
            fetch_version_messages,
            fetch_suggestions,
            execution_history::load_execution_history,
            execution_history::save_execution_record,
            execution_history::clear_execution_history,
            tabs::export_tab,
            tabs::search_tabs,
            rscripts::search_rscripts,
            rscripts::get_rscript_content,
            tray::get_tray_config,
            tray::save_tray_config,
            tray::update_tray_menu,
            tray::add_custom_tray_script,
            tray::update_custom_tray_script,
            tray::remove_custom_tray_script,
            tray::reorder_custom_tray_scripts,
            is_login_item_enabled,
            toggle_login_item,
            get_app_name,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

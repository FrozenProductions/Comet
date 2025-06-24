#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use std::time::Duration;
use tauri::{State, Manager, Window, CustomMenuItem, SystemTray, SystemTrayMenu, SystemTrayMenuItem, SystemTrayEvent, WindowEvent};
use std::thread;
use serde::{Serialize, Deserialize};
use reqwest::blocking::Client as BlockingClient;
use std::process::Command;
use std::fs;
use std::path::PathBuf;
use dirs;

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
                    return text == "0xdeadbeef"
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
            match self.client.post(&url)
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
                window.emit("connection-update", &*status).unwrap_or_default();
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
                window.emit("connection-update", &*status).unwrap_or_default();
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
async fn change_setting(key: String, value: String, state: State<'_, AppState>) -> Result<bool, String> {
    let content = format!("{} {}", key, value);
    let mut conn = state.connection.lock().map_err(|e| e.to_string())?;
    let success = conn.send(&content);
    if !success {
        state.update_status(None, false, None);
    }
    Ok(success)
}

#[tauri::command]
async fn refresh_connection(state: State<'_, AppState>, window: Window) -> Result<ConnectionStatus, String> {
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
async fn increment_port(state: State<'_, AppState>, window: Window) -> Result<ConnectionStatus, String> {
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
    ExecutionError(String)
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
        format!("Could not locate HTTP server on ports {}-{}. Last error: {}", MIN_PORT, MAX_PORT, last_error)
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

#[derive(Debug, Serialize, Deserialize)]
pub struct ScriptSearchParams {
    q: String,
    page: Option<u32>,
    max: Option<u32>,
    mode: Option<String>,
    patched: Option<u8>,
    key: Option<u8>,
    universal: Option<u8>,
    verified: Option<u8>,
    #[serde(rename = "sortBy")]
    sort_by: Option<String>,
    order: Option<String>,
    strict: Option<bool>,
}

#[tauri::command]
async fn search_scripts(params: ScriptSearchParams) -> Result<String, String> {
    let client = reqwest::Client::new();
    let mut url = reqwest::Url::parse("https://scriptblox.com/api/script/search").map_err(|e| {
        e.to_string()
    })?;

    url.query_pairs_mut().append_pair("q", &params.q);

    if let Some(page) = params.page {
        url.query_pairs_mut().append_pair("page", &page.to_string());
    }
    if let Some(max) = params.max {
        url.query_pairs_mut().append_pair("max", &max.to_string());
    }
    if let Some(mode) = params.mode {
        url.query_pairs_mut().append_pair("mode", &mode);
    }
    if let Some(patched) = params.patched {
        url.query_pairs_mut().append_pair("patched", &patched.to_string());
    }
    if let Some(key) = params.key {
        url.query_pairs_mut().append_pair("key", &key.to_string());
    }
    if let Some(universal) = params.universal {
        url.query_pairs_mut().append_pair("universal", &universal.to_string());
    }
    if let Some(verified) = params.verified {
        url.query_pairs_mut().append_pair("verified", &verified.to_string());
    }
    if let Some(sort_by) = params.sort_by {
        url.query_pairs_mut().append_pair("sortBy", &sort_by);
    }
    if let Some(order) = params.order {
        url.query_pairs_mut().append_pair("order", &order);
    }
    if let Some(strict) = params.strict {
        url.query_pairs_mut().append_pair("strict", &strict.to_string());
    }

    let response = match client
        .get(url)
        .header("Accept", "application/json")
        .header("User-Agent", "Tauri App")
        .send()
        .await
    {
        Ok(resp) => resp,
        Err(e) => {
            if e.is_timeout() {
                return Err("Request timed out".to_string());
            }
            if e.is_connect() {
                return Err("Connection failed".to_string());
            }
            if let Some(status) = e.status() {
                return Err(format!("HTTP error: {}", status));
            }
            return Err(format!("Network error: {}", e));
        }
    };

    let status = response.status();
    let response_text = response.text().await.map_err(|e| {
        format!("Failed to read response: {}", e)
    })?;

    if !status.is_success() {
        return Err(format!("API error: {} - {}", status, response_text));
    }
    Ok(response_text)
}

#[tauri::command]
async fn get_script_content(slug: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!("https://scriptblox.com/api/script/{}", slug);

    let response = match client
        .get(&url)
        .header("Accept", "application/json")
        .header("User-Agent", "Tauri App")
        .send()
        .await
    {
        Ok(resp) => resp,
        Err(e) => {
            return Err(format!("Network error: {}", e));
        }
    };

    let status = response.status();
    let response_text = response.text().await.map_err(|e| {
        format!("Failed to read response: {}", e)
    })?;

    if !status.is_success() {
        return Err(format!("API error: {} - {}", status, response_text));
    }
    
    Ok(response_text)
}

mod auto_execute;
mod tabs;
mod fast_flags;
mod fast_flags_profiles;
mod flag_validator;
mod roblox_logs;
mod hydrogen;
mod workspace;
mod updater;

use fast_flags_profiles::{FastFlagsProfile, FastFlagsProfileManager};
use flag_validator::FlagValidator;

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
async fn load_fast_flags_profiles(app_handle: tauri::AppHandle) -> Result<(Vec<FastFlagsProfile>, Option<String>), String> {
    let profile_manager = FastFlagsProfileManager::new(&app_handle);
    let profiles = profile_manager.load_profiles()?;
    let active_id = profile_manager.get_active_profile_id()?;
    Ok((profiles, active_id))
}

#[tauri::command]
async fn save_fast_flags_profile(app_handle: tauri::AppHandle, profile: FastFlagsProfile) -> Result<(), String> {
    let profile_manager = FastFlagsProfileManager::new(&app_handle);
    profile_manager.save_profile(profile, &app_handle).await
}

#[tauri::command]
async fn delete_fast_flags_profile(app_handle: tauri::AppHandle, profile_id: String) -> Result<(), String> {
    let profile_manager = FastFlagsProfileManager::new(&app_handle);
    profile_manager.delete_profile(&profile_id)
}

#[tauri::command]
async fn activate_fast_flags_profile(app_handle: tauri::AppHandle, profile_id: String) -> Result<FastFlagsProfile, String> {
    let profile_manager = FastFlagsProfileManager::new(&app_handle);
    profile_manager.activate_profile(&profile_id).await
}

#[tauri::command]
async fn validate_flags(flags: Vec<String>, state: State<'_, AppState>) -> Result<Vec<String>, String> {
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

fn create_tray_menu() -> SystemTray {
    let open = CustomMenuItem::new("open".to_string(), "Show");
    let hide = CustomMenuItem::new("hide".to_string(), "Hide");
    let infinite_yield = CustomMenuItem::new("infinite_yield".to_string(), "Execute Infinite Yield");
    let hydroxide = CustomMenuItem::new("hydroxide".to_string(), "Execute Hydroxide");
    let dex = CustomMenuItem::new("dex".to_string(), "Execute DEX Explorer");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");

    let tray_menu = SystemTrayMenu::new()
        .add_item(open)
        .add_item(hide)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(infinite_yield)
        .add_item(hydroxide)
        .add_item(dex)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);

    SystemTray::new().with_menu(tray_menu)
}

async fn execute_infinite_yield() -> Result<String, String> {
    let script_url = "https://raw.githubusercontent.com/EdgeIY/infiniteyield/refs/heads/master/source";
    let script = reqwest::get(script_url)
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;
    
    execute_script(script).await
}

async fn execute_hydroxide() -> Result<String, String> {
    let script = r#"local owner = "Upbolt"
local branch = "revision"

local function webImport(file)
    return loadstring(game:HttpGetAsync(("https://raw.githubusercontent.com/%s/Hydroxide/%s/%s.lua"):format(owner, branch, file)), file .. '.lua')()
end

webImport("init")
webImport("ui/main")"#;
    
    execute_script(script.to_string()).await
}

async fn execute_dex() -> Result<String, String> {
    let script_url = "https://cdn.wearedevs.net/scripts/Dex%20Explorer.txt";
    let script = reqwest::get(script_url)
        .await
        .map_err(|e| e.to_string())?
        .text()
        .await
        .map_err(|e| e.to_string())?;
    
    execute_script(script).await
}

fn handle_tray_event(app: &tauri::AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
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
            "infinite_yield" => {
                tauri::async_runtime::spawn(async {
                    match execute_infinite_yield().await {
                        Ok(_) => println!("Successfully executed Infinite Yield"),
                        Err(e) => eprintln!("Failed to execute Infinite Yield: {}", e),
                    }
                });
            }
            "hydroxide" => {
                tauri::async_runtime::spawn(async {
                    match execute_hydroxide().await {
                        Ok(_) => println!("Successfully executed Hydroxide"),
                        Err(e) => eprintln!("Failed to execute Hydroxide: {}", e),
                    }
                });
            }
            "dex" => {
                tauri::async_runtime::spawn(async {
                    match execute_dex().await {
                        Ok(_) => println!("Successfully executed DEX Explorer"),
                        Err(e) => eprintln!("Failed to execute DEX Explorer: {}", e),
                    }
                });
            }
            "quit" => {
                app.exit(0);
            }
            _ => {}
        },
        _ => {}
    }
}

#[derive(Debug, Serialize, Deserialize)]
struct VersionMessage {
    message: String,
    nfu: bool,
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

fn main() {
    let app_state = AppState::new();
    let state_clone = app_state.clone();
    let window_state = WindowState::new();

    tauri::Builder::default()
        .manage(app_state)
        .manage(window_state)
        .system_tray(create_tray_menu())
        .on_system_tray_event(handle_tray_event)
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
            
            tauri::async_runtime::spawn(async move {
                loop {
                    let mut should_try_connect = false;
                    {
                        let mut conn = state_clone.connection.lock().unwrap();
                        if !conn.is_connected() {
                            should_try_connect = true;
                            state_clone.update_status(Some(&window), false, None);
                        }
                    }

                    if should_try_connect {
                        let current_port = state_clone.status.lock().unwrap().current_port;
                        let mut conn = state_clone.connection.lock().unwrap();
                        if conn.connect(current_port) {
                            state_clone.update_status(Some(&window), true, Some(current_port));
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
            search_scripts,
            get_script_content,
            auto_execute::get_auto_execute_files,
            auto_execute::save_auto_execute_file,
            auto_execute::delete_auto_execute_file,
            auto_execute::rename_auto_execute_file,
            auto_execute::open_auto_execute_directory,
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
            hydrogen::check_hydrogen_installation,
            hydrogen::install_hydrogen,
            workspace::load_workspaces,
            workspace::create_workspace,
            workspace::delete_workspace,
            workspace::set_active_workspace,
            workspace::rename_workspace,
            updater::check_for_updates,
            updater::download_and_install_update,
            open_hydrogen_folder,
            open_comet_folder,
            fast_flags_profiles::export_fast_flags_profiles,
            fast_flags_profiles::import_fast_flags_profiles,
            hide_window,
            fast_flags::save_fast_flags,
            fast_flags::get_fast_flag_categories,
            fetch_version_messages,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

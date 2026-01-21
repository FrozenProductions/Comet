#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use dirs;
use reqwest::blocking::Client as BlockingClient;
use serde::{Deserialize, Serialize};
use std::fs;
use std::io::Write;
use std::net::TcpStream;
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, serde::Serialize, serde::Deserialize)]
pub enum ApiType {
    Hydrogen,
    MacSploit,
}

impl ApiType {
    fn port_range(&self) -> (u16, u16) {
        match self {
            ApiType::Hydrogen => (6969, 7069),
            ApiType::MacSploit => (5553, 5562),
        }
    }
}

impl Default for ApiType {
    fn default() -> Self {
        ApiType::Hydrogen
    }
}

#[derive(Debug, Clone, serde::Serialize)]
struct ConnectionStatus {
    is_connected: bool,
    port: Option<u16>,
    current_port: u16,
    is_connecting: bool,
    api_type: ApiType,
}

#[derive(Debug)]
struct ConnectionManager {
    client: BlockingClient,
    port: Option<u16>,
    api_type: ApiType,
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
    fn new(api_type: ApiType) -> Self {
        Self {
            client: BlockingClient::builder()
                .timeout(Duration::from_secs(1))
                .build()
                .unwrap(),
            port: None,
            api_type,
        }
    }

    fn set_api_type(&mut self, api_type: ApiType) {
        self.api_type = api_type;
        self.port = None;
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
        match self.api_type {
            ApiType::Hydrogen => {
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
            ApiType::MacSploit => TcpStream::connect(format!("{}:{}", HOST, port)).is_ok(),
        }
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
            match self.api_type {
                ApiType::Hydrogen => {
                    let url = format!("http://{}:{}/execute", HOST, port);
                    match self
                        .client
                        .post(&url)
                        .header("Content-Type", "text/plain")
                        .body(script.to_string())
                        .send()
                    {
                        Ok(response) => {
                            return response.status().is_success();
                        }
                        Err(_) => {
                            self.port = None;
                        }
                    }
                }
                ApiType::MacSploit => match send_macsploit_script(script, port) {
                    Ok(()) => {
                        return true;
                    }
                    Err(_) => {
                        self.port = None;
                    }
                },
            }
        }
        false
    }

    fn try_send_on_port(&mut self, script: &str, port: u16) -> bool {
        match self.api_type {
            ApiType::Hydrogen => {
                let url = format!("http://{}:{}/execute", HOST, port);
                let script_body = script.to_string();
                // avoid tokio runtime conflict
                let handle = std::thread::spawn(move || {
                    let client = BlockingClient::new();
                    client
                        .post(&url)
                        .header("Content-Type", "text/plain")
                        .body(script_body)
                        .send()
                        .map(|r| r.status().is_success())
                        .unwrap_or(false)
                });
                handle.join().unwrap_or(false)
            }
            ApiType::MacSploit => send_macsploit_script(script, port).is_ok(),
        }
    }

    fn try_send_on_all_ports(&mut self, script: &str) -> bool {
        let (min_port, max_port) = match self.api_type {
            // only 6969 for now
            ApiType::Hydrogen => (6969, 6969),
            ApiType::MacSploit => (5553, 5562),
        };

        if let Some(current_port) = self.port {
            if self.try_send_on_port(script, current_port) {
                return true;
            }
            self.port = None;
        }

        for port in min_port..=max_port {
            if self.try_send_on_port(script, port) {
                self.port = Some(port);
                return true;
            }
        }

        self.port = None;
        false
    }
}

fn send_macsploit_script(script: &str, port: u16) -> Result<(), String> {
    let mut stream = TcpStream::connect(format!("{}:{}", HOST, port)).map_err(|e| e.to_string())?;

    let encoded = script.as_bytes();
    let mut buffer = vec![0u8; 16 + encoded.len()];
    buffer[0] = 0; // IPC_EXECUTE
    buffer[8..12].copy_from_slice(&(encoded.len() as u32).to_le_bytes());
    buffer[16..].copy_from_slice(encoded);

    stream.write_all(&buffer).map_err(|e| e.to_string())?;
    stream.flush().map_err(|e| e.to_string())?;
    drop(stream);
    Ok(())
}

#[derive(Clone)]
struct AppState {
    connection: Arc<Mutex<ConnectionManager>>,
    status: Arc<Mutex<ConnectionStatus>>,
    api_type: Arc<Mutex<ApiType>>,
}

impl AppState {
    fn new() -> Self {
        // Detect executor on startup
        let detected_api = detector::detect_executor();

        Self {
            connection: Arc::new(Mutex::new(ConnectionManager::new(detected_api))),
            status: Arc::new(Mutex::new(ConnectionStatus {
                is_connected: false,
                port: None,
                current_port: MIN_PORT,
                is_connecting: false,
                api_type: detected_api,
            })),
            api_type: Arc::new(Mutex::new(detected_api)),
        }
    }

    fn update_status(&self, window: Option<&Window>, is_connected: bool, port: Option<u16>) {
        match self.status.lock() {
            Ok(mut status) => {
                status.is_connected = is_connected;
                status.port = port;
                status.current_port = port.unwrap_or(status.current_port);
                if let Some(window) = window {
                    window
                        .emit("connection-update", &*status)
                        .unwrap_or_default();
                }
            }
            Err(e) => {
                let mut status = e.into_inner();
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
    }

    fn set_current_port(&self, window: Option<&Window>, port: u16) {
        match self.connection.lock() {
            Ok(mut conn) => {
                conn.port = None;
            }
            Err(e) => {
                let mut conn = e.into_inner();
                conn.port = None;
            }
        }

        match self.status.lock() {
            Ok(mut status) => {
                status.is_connected = false;
                status.port = None;
                status.current_port = port;
                if let Some(window) = window {
                    window
                        .emit("connection-update", &*status)
                        .unwrap_or_default();
                }
            }
            Err(e) => {
                let mut status = e.into_inner();
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
}

#[tauri::command]
fn get_connection_status(state: State<AppState>) -> ConnectionStatus {
    state.status.lock().unwrap().clone()
}

#[tauri::command]
fn get_api_type(state: State<AppState>) -> ApiType {
    *state.api_type.lock().unwrap()
}

#[tauri::command]
async fn set_api_type(
    api_type: ApiType,
    state: State<'_, AppState>,
    window: Window,
) -> Result<ConnectionStatus, String> {
    {
        match state.connection.lock() {
            Ok(mut conn) => {
                conn.set_api_type(api_type);
            }
            Err(e) => {
                let mut conn = e.into_inner();
                conn.set_api_type(api_type);
            }
        }
    }

    match state.api_type.lock() {
        Ok(mut guard) => *guard = api_type,
        Err(e) => {
            let mut guard = e.into_inner();
            *guard = api_type;
        }
    }

    let (min_port, _max_port) = api_type.port_range();

    match state.status.lock() {
        Ok(mut status) => {
            status.api_type = api_type;
            status.is_connected = false;
            status.port = None;
            status.current_port = min_port;
        }
        Err(e) => {
            let mut status = e.into_inner();
            status.api_type = api_type;
            status.is_connected = false;
            status.port = None;
            status.current_port = min_port;
        }
    }

    let status = state.status.lock().unwrap().clone();
    window
        .emit("connection-update", &status)
        .unwrap_or_default();

    Ok(status)
}

#[tauri::command]
async fn send_script(script: String, state: State<'_, AppState>) -> Result<bool, String> {
    let (success, connected_port) = {
        match state.connection.lock() {
            Ok(mut conn) => {
                let result = conn.try_send_on_all_ports(&script);
                let port = conn.port;
                (result, port)
            }
            Err(e) => {
                let mut conn = e.into_inner();
                let result = conn.try_send_on_all_ports(&script);
                let port = conn.port;
                (result, port)
            }
        }
    };

    if success {
        state.update_status(None, true, connected_port);
    } else {
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
    let (current_port, api_type) = {
        let status = state.status.lock().map_err(|e| e.to_string())?;
        (status.current_port, status.api_type)
    };

    let (min_port, max_port) = api_type.port_range();
    let next_port = if current_port >= max_port {
        min_port
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
fn set_window_always_on_top(window: tauri::Window, always_on_top: bool) {
    window.set_always_on_top(always_on_top).unwrap();
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
mod detector;
mod execution_history;
mod executor;
mod key;
mod login_items;
mod roblox_logs;
mod rscripts;
mod tabs;
mod tray;
mod uninstall;
mod workspace;

#[tauri::command]
async fn open_roblox() -> Result<(), String> {
    Command::new("open")
        .arg("-a")
        .arg("Roblox")
        .spawn()
        .map_err(|e| e.to_string())?;

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
async fn open_comet_folder() -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let app_dir = home.join("Library/Application Support/com.comet.dev");
    open_directory(app_dir)
}

#[tauri::command]
async fn open_executor_folder(app_handle: tauri::AppHandle) -> Result<(), String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let app_name = app_handle.package_info().name.clone();
    let dir_name = if app_name.to_lowercase() == "comet" || app_name.to_lowercase() == "hydrogen" {
        "Hydrogen".to_string()
    } else {
        app_name
    };
    let executor_dir = home.join(&dir_name);
    open_directory(executor_dir)
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

async fn fetch_script_configs() -> Result<ScriptsResponse, String> {
    let mut scripts = std::collections::HashMap::new();

    scripts.insert(
        "infinite_yield".to_string(),
        ScriptConfig {
            fetch: Some(true),
            url: Some(
                "https://raw.githubusercontent.com/EdgeIY/infiniteyield/refs/heads/master/source"
                    .to_string(),
            ),
            execute: None,
            content: None,
            display_name: Some("Infinite Yield".to_string()),
        },
    );

    scripts.insert(
        "remote_spy".to_string(),
        ScriptConfig {
            fetch: None,
            url: None,
            execute: Some(true),
            content: Some(r#"loadstring(game:HttpGet("https://raw.githubusercontent.com/infyiff/backup/main/SimpleSpyV3/main.lua"))()"#.to_string()),
            display_name: Some("Remote Spy".to_string()),
        }
    );

    scripts.insert(
        "dex_explorer".to_string(),
        ScriptConfig {
            fetch: None,
            url: None,
            execute: Some(true),
            content: Some(r#"loadstring(game:HttpGet("https://raw.githubusercontent.com/infyiff/backup/main/dex.lua"))()"#.to_string()),
            display_name: Some("DEX Explorer".to_string()),
        }
    );

    Ok(ScriptsResponse { scripts })
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
    std::fs::write(&script_file, script)
        .map_err(|e| format!("Failed to save last script: {}", e))?;
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
                        match state_clone.connection.lock() {
                            Ok(mut conn) => {
                                if !conn.is_connected() {
                                    should_try_connect = true;
                                    state_clone.update_status(None, false, None);
                                }
                            }
                            Err(e) => {
                                let mut conn = e.into_inner();
                                conn.port = None;
                            }
                        }
                    }

                    if should_try_connect {
                        let current_port = match state_clone.status.lock() {
                            Ok(status) => status.current_port,
                            Err(e) => {
                                let mut status = e.into_inner();
                                status.current_port
                            }
                        };
                        let mut conn = state_clone.connection.lock().unwrap();
                        if conn.connect(current_port) {
                            state_clone.update_status(None, true, Some(current_port));
                        }
                    }

                    thread::sleep(CHECK_INTERVAL);
                }
            });
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_connection_status,
            get_api_type,
            set_api_type,
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
            set_window_always_on_top,
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
            roblox_logs::start_log_watcher,
            roblox_logs::stop_log_watcher,
            executor::check_executor_installation,
            executor::install_app,
            workspace::load_workspaces,
            workspace::create_workspace,
            workspace::delete_workspace,
            workspace::set_active_workspace,
            workspace::rename_workspace,
            open_executor_folder,
            open_comet_folder,
            hide_window,
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
            uninstall::uninstall_app,
            key::validate_key,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

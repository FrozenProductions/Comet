#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::{Arc, Mutex};
use std::time::Duration;
use std::path::PathBuf;
use std::fs;
use tauri::{State, Manager, Window};
use std::thread;
use serde::{Serialize, Deserialize};
use reqwest::blocking::Client as BlockingClient;
use std::process::Command;

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

fn get_save_path() -> PathBuf {
    let mut path = dirs::document_dir().expect("Failed to get Documents directory");
    path.push("Comet");
    fs::create_dir_all(&path).expect("Failed to create directory");
    path.push("tabs.json");
    path
}

#[tauri::command]
async fn save_tabs(tabs: Vec<Tab>, active_tab: Option<String>) -> Result<(), String> {
    let state = TabState { tabs, active_tab };
    let path = get_save_path();
    
    fs::write(path, serde_json::to_string_pretty(&state).unwrap())
        .map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_tabs() -> Result<TabState, String> {
    let path = get_save_path();
    
    if path.exists() {
        let content = fs::read_to_string(path).map_err(|e| e.to_string())?;
        serde_json::from_str(&content).map_err(|e| e.to_string())
    } else {
        Ok(TabState {
            tabs: vec![Tab {
                id: "1".to_string(),
                title: "untitled.lua".to_string(),
                content: "-- New File\n".to_string(),
                language: "lua".to_string(),
            }],
            active_tab: Some("1".to_string()),
        })
    }
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
        println!("URL parse error: {:?}", e);
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

    println!("Sending request to URL: {}", url);

    let response = match client
        .get(url)
        .header("Accept", "application/json")
        .header("User-Agent", "Tauri App")
        .send()
        .await
    {
        Ok(resp) => resp,
        Err(e) => {
            println!("Request error: {:?}", e);
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

    println!("Response status: {}", response.status());
    println!("Response headers: {:#?}", response.headers());

    let status = response.status();
    let response_text = response.text().await.map_err(|e| {
        println!("Failed to read response body: {:?}", e);
        format!("Failed to read response: {}", e)
    })?;

    if !status.is_success() {
        println!("Error response body: {}", response_text);
        return Err(format!("API error: {} - {}", status, response_text));
    }

    println!("Response body length: {} bytes", response_text.len());
    if response_text.len() < 1000 {
        println!("Response body: {}", response_text);
    }
    
    Ok(response_text)
}

#[tauri::command]
async fn get_script_content(slug: String) -> Result<String, String> {
    let client = reqwest::Client::new();
    let url = format!("https://scriptblox.com/api/script/{}", slug);
    
    println!("Fetching script content from: {}", url);

    let response = match client
        .get(&url)
        .header("Accept", "application/json")
        .header("User-Agent", "Tauri App")
        .send()
        .await
    {
        Ok(resp) => resp,
        Err(e) => {
            println!("Request error: {:?}", e);
            return Err(format!("Network error: {}", e));
        }
    };

    println!("Response status: {}", response.status());

    let status = response.status();
    let response_text = response.text().await.map_err(|e| {
        println!("Failed to read response body: {:?}", e);
        format!("Failed to read response: {}", e)
    })?;

    if !status.is_success() {
        println!("Error response body: {}", response_text);
        return Err(format!("API error: {} - {}", status, response_text));
    }
    
    Ok(response_text)
}

mod auto_execute;

#[tauri::command]
async fn open_roblox() -> Result<(), String> {
    Command::new("open")
        .arg("-a")
        .arg("Roblox")
        .spawn()
        .map_err(|e| e.to_string())?;
    
    Ok(())
}

fn main() {
    let app_state = AppState::new();
    let state_clone = app_state.clone();

    tauri::Builder::default()
        .manage(app_state)
        .setup(|app| {
            let window = app.get_window("main").unwrap();
            
            thread::spawn(move || {
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

            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            get_connection_status,
            send_script,
            change_setting,
            refresh_connection,
            increment_port,
            save_tabs,
            load_tabs,
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
        ])
        .run(tauri::generate_context!())
        .expect("error while running");
}

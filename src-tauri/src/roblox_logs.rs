use std::fs::{self, File};
use std::io::{self, BufRead, BufReader, Seek};
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, AtomicU64, Ordering};
use std::thread;
use std::time::{Duration, SystemTime, UNIX_EPOCH};
use tauri::{Manager, Window};

pub(crate) static WATCHING: AtomicBool = AtomicBool::new(false);
pub(crate) static LAST_DISCONNECT_TIME: AtomicU64 = AtomicU64::new(0);

const DISCONNECT_PATTERN: &str = "[FLog::Network] Connection lost";
const COOLDOWN_DURATION: u64 = 5;

fn get_current_timestamp() -> u64 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_secs()
}

fn check_for_disconnect(app_handle: &tauri::AppHandle, content: &str) {
    let current_time = get_current_timestamp();
    let last_disconnect = LAST_DISCONNECT_TIME.load(Ordering::SeqCst);

    if current_time - last_disconnect < COOLDOWN_DURATION {
        return;
    }

    if content.contains(DISCONNECT_PATTERN) {
        LAST_DISCONNECT_TIME.store(current_time, Ordering::SeqCst);

        let _ = tauri::api::notification::Notification::new(
            app_handle.config().tauri.bundle.identifier.clone(),
        )
        .title("Comet")
        .body("Disconnected from a server")
        .show();
    }
}

fn process_log_line(window: &Window, line: &str, app_handle: &tauri::AppHandle) {
    if line.trim().is_empty() {
        return;
    }

    let _ = window.emit("log_update", line.trim());
    check_for_disconnect(app_handle, line);
}

pub fn find_latest_log_file() -> Option<PathBuf> {
    let home = dirs::home_dir()?;
    let log_dir = home.join("Library").join("Logs").join("Roblox");

    if !log_dir.exists() {
        println!("Log directory does not exist");
        return None;
    }

    let latest = fs::read_dir(log_dir)
        .ok()?
        .filter_map(|entry| entry.ok())
        .filter(|entry| entry.path().extension().map_or(false, |ext| ext == "log"))
        .max_by_key(|entry| entry.metadata().ok().and_then(|m| m.modified().ok()));
    latest.map(|entry| entry.path())
}

pub fn watch_log_file(window: Window, mut current_log_path: PathBuf) -> io::Result<()> {
    let mut file = File::open(&current_log_path)?;
    let mut reader = BufReader::new(&file);
    let mut line = String::new();
    let app_handle = window.app_handle();
    let mut buffer: Vec<u8> = Vec::new();

    while reader.read_line(&mut line)? > 0 {
        process_log_line(&window, &line, &app_handle);
        line.clear();
    }

    let mut last_position = reader.stream_position()?;
    let mut last_check = std::time::Instant::now();

    while WATCHING.load(Ordering::SeqCst) {
        if last_check.elapsed() >= Duration::from_secs(1) {
            if let Some(new_path) = find_latest_log_file() {
                if new_path != current_log_path {
                    current_log_path = new_path;
                    file = File::open(&current_log_path)?;
                    reader = BufReader::new(&file);

                    while reader.read_line(&mut line)? > 0 {
                        process_log_line(&window, &line, &app_handle);
                        line.clear();
                    }

                    last_position = reader.stream_position()?;
                }
            }
            last_check = std::time::Instant::now();
        }

        let metadata = fs::metadata(&current_log_path)?;
        let len = metadata.len();

        if len < last_position {
            file = File::open(&current_log_path)?;
            reader = BufReader::new(&file);
            last_position = 0;
        }

        if len > last_position {
            reader.seek(io::SeekFrom::Start(last_position))?;
            buffer.clear();

            while reader.read_line(&mut line)? > 0 {
                process_log_line(&window, &line, &app_handle);
                line.clear();
            }

            last_position = reader.stream_position()?;
        }

        thread::sleep(Duration::from_millis(50));
    }

    Ok(())
}

#[tauri::command]
pub async fn start_log_watcher(window: Window) -> Result<(), String> {
    if WATCHING.load(Ordering::SeqCst) {
        return Ok(());
    }

    let log_path = find_latest_log_file().ok_or("No log file found")?;
    WATCHING.store(true, Ordering::SeqCst);

    let window_clone = window.clone();
    thread::spawn(move || {
        if let Err(e) = watch_log_file(window_clone, log_path) {
            eprintln!("Error watching log file: {}", e);
        }
    });

    Ok(())
}

#[tauri::command]
pub async fn stop_log_watcher() -> Result<(), String> {
    WATCHING.store(false, Ordering::SeqCst);
    Ok(())
}

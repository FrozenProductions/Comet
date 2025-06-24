use chrono::Local;
use serde::{Deserialize, Serialize};
use std::fs::{self, OpenOptions};
use std::io::Write;
use std::path::PathBuf;
use std::sync::Mutex;
use tauri::api::path::app_data_dir;

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct LogEntry {
    pub timestamp: String,
    pub level: String,
    pub message: String,
    pub details: Option<serde_json::Value>,
}

pub struct Logger {
    log_dir: PathBuf,
    current_log_file: PathBuf,
    max_log_size: u64,
    max_log_files: usize,
}

impl Logger {
    pub fn new(app_handle: &tauri::AppHandle) -> Result<Self, String> {
        let mut log_dir = app_data_dir(&app_handle.config())
            .ok_or("Failed to get app data directory")?;
        log_dir.push("logs");
        fs::create_dir_all(&log_dir).map_err(|e| e.to_string())?;

        let current_log_file = log_dir.join(format!(
            "comet_{}.log",
            Local::now().format("%Y-%m-%d")
        ));

        Ok(Self {
            log_dir,
            current_log_file,
            max_log_size: 10 * 1024 * 1024,
            max_log_files: 10,
        })
    }

    fn rotate_logs(&self) -> Result<(), String> {
        if !self.current_log_file.exists() {
            return Ok(());
        }

        let metadata = fs::metadata(&self.current_log_file)
            .map_err(|e| format!("Failed to get log file metadata: {}", e))?;

        if metadata.len() < self.max_log_size {
            return Ok(());
        }

        let mut log_files: Vec<_> = fs::read_dir(&self.log_dir)
            .map_err(|e| format!("Failed to read log directory: {}", e))?
            .filter_map(|entry| entry.ok())
            .filter(|entry| {
                entry.path().extension().map_or(false, |ext| ext == "log")
            })
            .collect();

        log_files.sort_by_key(|entry| {
            entry.metadata().unwrap().modified().unwrap()
        });

        while log_files.len() >= self.max_log_files {
            if let Some(oldest) = log_files.first() {
                fs::remove_file(oldest.path())
                    .map_err(|e| format!("Failed to remove old log file: {}", e))?;
                log_files.remove(0);
            }
        }

        let new_log_file = self.log_dir.join(format!(
            "comet_{}.log",
            Local::now().format("%Y-%m-%d_%H-%M-%S")
        ));

        fs::rename(&self.current_log_file, &new_log_file)
            .map_err(|e| format!("Failed to rotate log file: {}", e))?;

        Ok(())
    }

    pub fn write_entry(&self, entry: LogEntry) -> Result<(), String> {
        self.rotate_logs()?;

        let mut file = OpenOptions::new()
            .create(true)
            .append(true)
            .open(&self.current_log_file)
            .map_err(|e| format!("Failed to open log file: {}", e))?;

        let log_line = serde_json::to_string(&entry)
            .map_err(|e| format!("Failed to serialize log entry: {}", e))?;

        writeln!(file, "{}", log_line)
            .map_err(|e| format!("Failed to write log entry: {}", e))?;

        Ok(())
    }

    pub fn get_logs(&self, level: Option<String>) -> Result<Vec<LogEntry>, String> {
        let mut entries = Vec::new();

        if !self.current_log_file.exists() {
            return Ok(entries);
        }

        let content = fs::read_to_string(&self.current_log_file)
            .map_err(|e| format!("Failed to read log file: {}", e))?;

        for line in content.lines() {
            if let Ok(entry) = serde_json::from_str::<LogEntry>(line) {
                if let Some(ref filter_level) = level {
                    if entry.level != *filter_level {
                        continue;
                    }
                }
                entries.push(entry);
            }
        }

        Ok(entries)
    }

    pub fn clear_logs(&self) -> Result<(), String> {
        if self.current_log_file.exists() {
            fs::remove_file(&self.current_log_file)
                .map_err(|e| format!("Failed to clear log file: {}", e))?;
        }
        Ok(())
    }
}

#[tauri::command]
pub async fn write_log_entry(
    log_entry: LogEntry,
    state: tauri::State<'_, Mutex<Logger>>,
) -> Result<(), String> {
    let logger = state.lock().map_err(|e| e.to_string())?;
    logger.write_entry(log_entry)
}

#[tauri::command]
pub async fn get_logs(
    level: Option<String>,
    state: tauri::State<'_, Mutex<Logger>>,
) -> Result<Vec<LogEntry>, String> {
    let logger = state.lock().map_err(|e| e.to_string())?;
    logger.get_logs(level)
}

#[tauri::command]
pub async fn clear_logs(
    state: tauri::State<'_, Mutex<Logger>>,
) -> Result<(), String> {
    let logger = state.lock().map_err(|e| e.to_string())?;
    logger.clear_logs()
} 
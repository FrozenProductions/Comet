use std::fs::{self, File};
use std::io::{BufReader, BufWriter};
use std::path::PathBuf;
use serde::{Deserialize, Serialize};
use tauri::api::path::config_dir;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionRecord {
    pub id: String,
    pub timestamp: i64,
    pub content: String,
    pub success: bool,
    pub error: Option<String>,
}

fn get_comet_dir() -> PathBuf {
    let base_dir = config_dir().expect("Failed to get Application Support directory");
    let mut app_dir = base_dir;
    app_dir.push("com.comet.dev");
    fs::create_dir_all(&app_dir).expect("Failed to create directory");
    app_dir
}

fn get_execution_history_dir() -> PathBuf {
    let mut path = get_comet_dir();
    path.push("execution_history");
    fs::create_dir_all(&path).expect("Failed to create directory");
    path
}

fn get_execution_history_file() -> PathBuf {
    let mut path = get_execution_history_dir();
    path.push("history.json");
    path
}

#[tauri::command]
pub async fn load_execution_history() -> Result<Vec<ExecutionRecord>, String> {
    let history_file = get_execution_history_file();
    
    if !history_file.exists() {
        return Ok(Vec::new());
    }

    let metadata = fs::metadata(&history_file).map_err(|e| e.to_string())?;
    let file_size = metadata.len();
    
    if file_size > 5_000_000 {
        load_history_streaming(&history_file)
    } else {
        load_history_standard(&history_file)
    }
}

fn load_history_standard(path: &PathBuf) -> Result<Vec<ExecutionRecord>, String> {
    let file = File::open(path).map_err(|e| e.to_string())?;
    let reader = BufReader::new(file);
    serde_json::from_reader(reader).map_err(|e| {
        eprintln!("JSON parse error: {}", e);
        "Failed to parse execution history. File may be corrupted.".to_string()
    })
}

fn load_history_streaming(path: &PathBuf) -> Result<Vec<ExecutionRecord>, String> {
    let file = File::open(path).map_err(|e| e.to_string())?;
    let reader = BufReader::with_capacity(8192, file);
    
    match serde_json::from_reader::<_, Vec<ExecutionRecord>>(reader) {
        Ok(mut records) => {
            if records.len() > 1000 {
                records.truncate(1000);
            }
            Ok(records)
        }
        Err(e) => {
            eprintln!("Streaming JSON parse error: {}", e);
            Err("Failed to parse large execution history file. Consider clearing history.".to_string())
        }
    }
}

#[tauri::command]
pub async fn save_execution_record(record: ExecutionRecord, max_items: usize) -> Result<(), String> {
    let history_file = get_execution_history_file();
    
    let mut history = if history_file.exists() {
        load_execution_history().await.unwrap_or_default()
    } else {
        Vec::new()
    };

    history.insert(0, record);

    if history.len() > max_items {
        history.truncate(max_items);
    }

    let file = File::create(&history_file).map_err(|e| e.to_string())?;
    let writer = BufWriter::new(file);
    
    serde_json::to_writer_pretty(writer, &history).map_err(|e| {
        eprintln!("Failed to write execution history: {}", e);
        e.to_string()
    })?;

    Ok(())
}

#[tauri::command]
pub async fn clear_execution_history() -> Result<(), String> {
    let history_file = get_execution_history_file();
    
    if history_file.exists() {
        fs::write(history_file, "[]").map_err(|e| e.to_string())?;
    }

    Ok(())
} 
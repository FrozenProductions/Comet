use base64::{engine::general_purpose, Engine as _};
use curl::easy::Easy;
use serde::{Deserialize, Serialize};
use std::fs;
use std::process::Command;
use tauri::async_runtime;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyValidationRequest {
    pub key: String,
    pub mac_uuid: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyValidationResponse {
    pub success: bool,
    pub token: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct JwtPayload {
    pub mac_uuid: String,
    pub session_id: String,
    pub key_expires_at: u64,
    pub iat: u64,
    pub exp: u64,
    pub jti: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct KeyStatus {
    pub success: bool,
    pub key_found: bool,
    pub valid: bool,
    pub expires_at: Option<u64>,
    pub current_time: u64,
    pub days_remaining: Option<i64>,
    pub error: Option<String>,
}

fn get_mac_uuid() -> Result<String, String> {
    let output = Command::new("system_profiler")
        .arg("SPHardwareDataType")
        .output()
        .map_err(|e| format!("Failed to execute system_profiler: {}", e))?;

    let stdout = String::from_utf8_lossy(&output.stdout);
    for line in stdout.lines() {
        if line.contains("Hardware UUID") {
            if let Some(uuid_start) = line.find(':') {
                let uuid = &line[uuid_start + 1..].trim();
                return Ok(uuid.to_string());
            }
        }
    }

    Err("Could not find Hardware UUID".to_string())
}

fn read_key_file() -> Result<String, String> {
    let home = dirs::home_dir().ok_or("Could not find home directory")?;
    let hydrogen_dir = home
        .join("Library")
        .join("Application Support")
        .join("Hydrogen");
    let key_path = hydrogen_dir.join("key.txt");

    if !key_path.exists() {
        let path_str = key_path.to_string_lossy();
        return Err(format!("Key file not found at: {}", path_str));
    }

    let content = fs::read_to_string(&key_path)
        .map_err(|e| format!("Failed to read key file: {}", e))?;

    Ok(content.trim().to_string())
}

fn decode_jwt(token: &str) -> Result<JwtPayload, String> {
    let parts: Vec<&str> = token.split('.').collect();
    if parts.len() != 3 {
        return Err("Invalid JWT format".to_string());
    }

    let payload = parts[1];

    let padded = pad_base64(payload);

    let decoded = general_purpose::STANDARD
        .decode(&padded)
        .or_else(|_| general_purpose::STANDARD_NO_PAD.decode(&padded))
        .map_err(|e| format!("Failed to decode base64: {}", e))?;

    let payload_str = String::from_utf8(decoded)
        .map_err(|e| format!("Invalid UTF-8 in payload: {}", e))?;

    serde_json::from_str(&payload_str)
        .map_err(|e| format!("Failed to parse JWT payload: {}", e))
}

fn pad_base64(s: &str) -> String {
    let mut normalized = s.replace('-', "+").replace('_', "/");
    let padding = (4 - (normalized.len() % 4)) % 4;
    if padding > 0 {
        normalized.push_str(&"=".repeat(padding));
    }
    normalized
}

fn calculate_days_remaining(expires_at: u64, current_time: u64) -> i64 {
    if expires_at <= current_time {
        0
    } else {
        let diff = expires_at - current_time;
        (diff as i64) / (24 * 60 * 60)
    }
}

#[tauri::command]
pub async fn validate_key() -> Result<KeyStatus, String> {
    let current_time = std::time::SystemTime::now()
        .duration_since(std::time::UNIX_EPOCH)
        .map_err(|e| format!("Failed to get current time: {}", e))?
        .as_secs();

    let (key, mac_uuid) = match (read_key_file(), get_mac_uuid()) {
        (Ok(key), Ok(uuid)) => (key, uuid),
        (Err(e), _) => {
            return Ok(KeyStatus {
                success: false,
                key_found: false,
                valid: false,
                expires_at: None,
                current_time,
                days_remaining: None,
                error: Some(format!("Key file error: {}", e)),
            });
        }
        (_, Err(e)) => {
            return Ok(KeyStatus {
                success: false,
                key_found: true,
                valid: false,
                expires_at: None,
                current_time,
                days_remaining: None,
                error: Some(format!("MAC UUID error: {}", e)),
            });
        }
    };

    let result = match async_runtime::spawn_blocking(move || {
        let request_body = KeyValidationRequest {
            key: key.clone(),
            mac_uuid: mac_uuid.clone(),
        };

        let json_body = serde_json::to_string(&request_body)
            .map_err(|e| format!("Failed to serialize request: {}", e))?;

        let mut response_buffer = Vec::new();
        let mut easy = Easy::new();

        easy.url("https://www.hydrogen.lat/api/validate-key")
            .map_err(|e| format!("Failed to set URL: {}", e))?;
        easy.timeout(std::time::Duration::from_secs(15))
            .map_err(|e| format!("Failed to set timeout: {}", e))?;
        easy.post(true).map_err(|e| format!("Failed to set POST method: {}", e))?;
        easy.post_fields_copy(json_body.as_bytes())
            .map_err(|e| format!("Failed to set POST fields: {}", e))?;

        let mut headers = curl::easy::List::new();
        headers
            .append("Accept: */*")
            .map_err(|e| format!("Failed to add Accept header: {}", e))?;
        headers
            .append("Content-Type: application/json")
            .map_err(|e| format!("Failed to add Content-Type header: {}", e))?;
        headers
            .append("Host: www.hydrogen.lat")
            .map_err(|e| format!("Failed to add Host header: {}", e))?;
        headers
            .append("User-Agent: curl/8.12.1")
            .map_err(|e| format!("Failed to add User-Agent header: {}", e))?;
        easy.http_headers(headers)
            .map_err(|e| format!("Failed to set headers: {}", e))?;

        {
            let mut transfer = easy.transfer();
            transfer
                .write_function(|data| {
                    response_buffer.extend_from_slice(data);
                    Ok(data.len())
                })
                .map_err(|e| format!("Failed to set write function: {}", e))?;
            transfer
                .perform()
                .map_err(|e| format!("Failed to perform request: {}", e))?;
        }

        let _response_code = easy
            .response_code()
            .map_err(|e| format!("Failed to get response code: {}", e))?;

        let response_text = String::from_utf8(response_buffer)
            .map_err(|e| format!("Failed to decode response as UTF-8: {}", e))?;

        let response_json: KeyValidationResponse = serde_json::from_str(&response_text)
            .map_err(|e| format!("Failed to parse JSON response: {}. Response was: {}", e, response_text))?;

        if !response_json.success {
            return Ok::<KeyStatus, String>(KeyStatus {
                success: false,
                key_found: true,
                valid: false,
                expires_at: None,
                current_time,
                days_remaining: None,
                error: Some("API returned success=false".to_string()),
            });
        }

        let token = response_json.token.ok_or_else(|| "No token in response".to_string())?;
        let payload = decode_jwt(&token)?;

        let days_remaining = calculate_days_remaining(payload.key_expires_at, current_time);

        Ok::<KeyStatus, String>(KeyStatus {
            success: true,
            key_found: true,
            valid: days_remaining > 0,
            expires_at: Some(payload.key_expires_at),
            current_time,
            days_remaining: Some(days_remaining),
            error: None,
        })
    }).await {
        Ok(result) => result,
        Err(e) => return Err(format!("Async runtime error: {}", e)),
    }?;

    Ok(result)
}

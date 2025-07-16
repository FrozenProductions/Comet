use std::process::Command;

pub fn is_login_item_enabled() -> Result<bool, String> {
    let output = Command::new("osascript")
        .arg("-e")
        .arg(r#"tell application "System Events" to get the name of every login item"#)
        .output()
        .map_err(|e| e.to_string())?;

    let output_str = String::from_utf8(output.stdout).map_err(|e| e.to_string())?;
    Ok(output_str.contains("Comet"))
}

pub fn toggle_login_item(enabled: bool) -> Result<(), String> {
    let app_path = "/Applications/Comet.app";

    if enabled {
        Command::new("osascript")
            .arg("-e")
            .arg(format!(
                r#"tell application "System Events" to make login item at end with properties {{path:"{}", hidden:false}}"#,
                app_path
            ))
            .output()
            .map_err(|e| e.to_string())?;
    } else {
        Command::new("osascript")
            .arg("-e")
            .arg(r#"tell application "System Events" to delete login item "Comet""#)
            .output()
            .map_err(|e| e.to_string())?;
    }

    Ok(())
}

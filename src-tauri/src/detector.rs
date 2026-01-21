use std::path::Path;

use crate::ApiType;

pub fn detect_executor() -> ApiType {
    let hydrogen_path = Path::new("/Applications/Roblox.app/Contents/MacOS/RobloxPlayer.copy");
    let macsploit_path = Path::new("/Applications/Roblox.app/Contents/MacOS/macsploit.dylib");

    let has_hydrogen = hydrogen_path.exists();
    let has_macsploit = macsploit_path.exists();

    match (has_hydrogen, has_macsploit) {
        (true, false) => ApiType::Hydrogen,
        (false, true) => ApiType::MacSploit,
        (true, true) => ApiType::Hydrogen,
        (false, false) => ApiType::Hydrogen,
    }
}

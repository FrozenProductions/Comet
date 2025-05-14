use reqwest::Client;
use serde::Deserialize;
use std::collections::HashSet;
use std::sync::Arc;
use tokio::sync::RwLock;
use std::time::Duration;

#[derive(Debug, Clone, Default)]
pub struct FlagCache {
    mac: Option<HashSet<String>>,
    client: Option<HashSet<String>>,
}

pub struct FlagValidator {
    cache: Arc<RwLock<FlagCache>>,
    client: Client,
}

impl FlagValidator {
    pub fn new() -> Self {
        Self {
            cache: Arc::new(RwLock::new(FlagCache::default())),
            client: Client::builder()
                .timeout(Duration::from_secs(10))
                .build()
                .unwrap(),
        }
    }

    pub async fn validate_flags(&self, flags: &[String]) -> Vec<String> {
        let cache = self.cache.read().await;
        let mut invalid_flags = Vec::new();

        for flag in flags {
            let is_valid = match (&cache.mac, &cache.client) {
                (Some(mac), Some(client)) => mac.contains(flag) || client.contains(flag),
                (Some(mac), None) => mac.contains(flag),
                (None, Some(client)) => client.contains(flag),
                (None, None) => true,
            };

            if !is_valid {
                invalid_flags.push(flag.clone());
            }
        }

        invalid_flags
    }

    pub async fn refresh_cache(&self) {
        let mut cache = self.cache.write().await;
        
        if let Ok(mac_flags) = self.fetch_mac_flags().await {
            cache.mac = Some(mac_flags);
        }

        if let Ok(client_flags) = self.fetch_client_flags().await {
            cache.client = Some(client_flags);
        }
    }

    async fn fetch_mac_flags(&self) -> Result<HashSet<String>, Box<dyn std::error::Error>> {
        #[derive(Deserialize)]
        struct MacFlags {
            #[serde(flatten)]
            flags: std::collections::HashMap<String, serde_json::Value>,
        }

        let res = self.client
            .get("https://raw.githubusercontent.com/MaximumADHD/Roblox-FFlag-Tracker/main/MacDesktopClient.json")
            .send()
            .await?;

        let data: MacFlags = res.json().await?;
        Ok(data.flags.keys().cloned().collect())
    }

    async fn fetch_client_flags(&self) -> Result<HashSet<String>, Box<dyn std::error::Error>> {
        let res = self.client
            .get("https://raw.githubusercontent.com/MaximumADHD/Roblox-Client-Tracker/roblox/FVariables.txt")
            .send()
            .await?;

        let input = res.text().await?;
        let flag_regex = regex::Regex::new(r"\[(?:C\+\+|Lua)\]\s+(\w+)")?;
        
        let flags: HashSet<String> = input
            .lines()
            .filter_map(|line| {
                flag_regex
                    .captures(line)
                    .and_then(|cap| cap.get(1))
                    .map(|m| m.as_str().to_string())
            })
            .collect();

        Ok(flags)
    }
} 
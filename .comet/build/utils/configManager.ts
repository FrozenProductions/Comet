import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import type { BrandConfig, CometConfig, TauriConfig } from "../types/config";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export function loadCometConfig(): CometConfig {
	const configPath = resolve(__dirname, "../config.json");
	return JSON.parse(readFileSync(configPath, "utf-8")) as CometConfig;
}

export function updateTauriConfig(
	brandConfig: BrandConfig,
	configPath: string,
): void {
	const tauriConfig = JSON.parse(
		readFileSync(configPath, "utf-8"),
	) as TauriConfig;

	tauriConfig.package.productName = brandConfig.productName;
	tauriConfig.tauri.bundle.icon = [brandConfig.iconPath];
	tauriConfig.tauri.windows[0].title = brandConfig.productName;

	writeFileSync(configPath, JSON.stringify(tauriConfig, null, 4));
}

export function updateCometConfig(brandConfig: BrandConfig): void {
	const sourceConfigPath = resolve(__dirname, "../config.json");
	const cometConfig = loadCometConfig();
	cometConfig.notifications.title = brandConfig.productName;
	writeFileSync(sourceConfigPath, JSON.stringify(cometConfig, null, 4));
}

import fs from "fs/promises";
import { SCRIPTS_DIR } from "../constants/paths.js";

/**
 * Ensures the scripts directory exists
 */
export async function ensureScriptsDirExists(): Promise<void> {
	try {
		await fs.access(SCRIPTS_DIR);
	} catch {
		await fs.mkdir(SCRIPTS_DIR, { recursive: true });
	}
}

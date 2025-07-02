import { invoke } from "@tauri-apps/api/tauri";
import type { VersionMessage, VersionMessages } from "../types/versionMessages";

/**
 * Fetches version message for the current application version
 * @param currentVersion Current version of the application
 * @returns Version message if available, null otherwise
 */
export const fetchVersionMessage = async (
	currentVersion: string,
): Promise<VersionMessage | null> => {
	try {
		const data = await invoke<VersionMessages>("fetch_version_messages");
		const versionMessage = data.messages[currentVersion];

		if (versionMessage && versionMessage.message.trim() !== "") {
			return versionMessage;
		}
		return null;
	} catch (error) {
		console.error("Error fetching version message:", error);
		return null;
	}
};

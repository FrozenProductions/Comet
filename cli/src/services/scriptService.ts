import fs from "fs/promises";
import path from "path";
import { Script, ExecutionResponse } from "../types/script.js";
import { START_PORT, END_PORT } from "../constants/ports.js";
import { SCRIPTS_DIR } from "../constants/paths.js";
import { ensureScriptsDirExists } from "../utils/file.js";

/**
 * Attempts to find the port where the Hydrogen server is running by checking ports in range
 * @returns Port number if server is found, null otherwise
 */
async function findServerPort(): Promise<number | null> {
    for (let port = START_PORT; port <= END_PORT; port++) {
        try {
            const res = await fetch(`http://127.0.0.1:${port}/secret`, {
                method: "GET",
            });

            if (res.ok && (await res.text()) === "0xdeadbeef") {
                return port;
            }
        } catch {
            // Continue trying next port
        }
    }

    return null;
}

/**
 * Sends a script to the Hydrogen server for execution
 * @param scriptContent The Lua script content to execute
 * @returns Response containing success status and output/error message
 */
export async function executeScript(
    scriptContent: string,
): Promise<ExecutionResponse> {
    try {
        let serverPort = await findServerPort();

        if (!serverPort) {
            return {
                success: false,
                error: `Could not locate Hydrogen server on ports ${START_PORT}-${END_PORT}. Is Roblox running?`,
            };
        }

        const response = await fetch(`http://127.0.0.1:${serverPort}/execute`, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain",
            },
            body: scriptContent,
        });

        if (!response.ok) {
            const errorText = await response.text();
            return {
                success: false,
                error: `HTTP ${response.status}: ${errorText}`,
            };
        }

        const output = await response.text();
        return {
            success: true,
            output,
        };
    } catch (error) {
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Unknown error occurred",
        };
    }
}

/**
 * Persists a script to the filesystem in the scripts directory
 * @param script The script object containing name and content
 * @returns True if save was successful, false otherwise
 */
export async function saveScript(script: Script): Promise<boolean> {
    try {
        await ensureScriptsDirExists();

        const filePath = path.join(SCRIPTS_DIR, `${script.name}.lua`);
        await fs.writeFile(filePath, script.content, "utf-8");

        return true;
    } catch (error) {
        console.error("Error saving script:", error);
        return false;
    }
}

/**
 * Retrieves all Lua scripts from the scripts directory
 * @returns Array of Script objects containing name and content
 */
export async function loadScripts(): Promise<Script[]> {
    try {
        await ensureScriptsDirExists();

        const files = await fs.readdir(SCRIPTS_DIR);
        const scriptFiles = files.filter((file) => file.endsWith(".lua"));

        const scripts: Script[] = [];

        for (const file of scriptFiles) {
            const name = path.basename(file, ".lua");
            const content = await fs.readFile(
                path.join(SCRIPTS_DIR, file),
                "utf-8",
            );

            scripts.push({
                name,
                content,
            });
        }

        return scripts;
    } catch (error) {
        console.error("Error loading scripts:", error);
        return [];
    }
}

/**
 * Removes a script file from the scripts directory
 * @param name Name of the script to delete
 * @returns True if deletion was successful, false otherwise
 */
export async function deleteScript(name: string): Promise<boolean> {
    try {
        const filePath = path.join(SCRIPTS_DIR, `${name}.lua`);
        await fs.unlink(filePath);

        return true;
    } catch (error) {
        console.error("Error deleting script:", error);
        return false;
    }
}

export const START_PORT = 6969 as const;
export const END_PORT = 7069 as const;

export interface HydrogenState {
	serverPort: number | null;
	isConnecting: boolean;
}

/**
 * Scans ports to find running Hydrogen server
 * @returns Port number if server found, null otherwise
 */
export async function findHydrogenServer(): Promise<number | null> {
	for (let port = START_PORT; port <= END_PORT; port++) {
		try {
			const res = await fetch(`http://127.0.0.1:${port}/secret`, {
				method: "GET",
			});

			if (res.ok && (await res.text()) === "0xdeadbeef") {
				return port;
			}
		} catch (error) {
		}
	}

	return null;
}

/**
 * Executes Lua script
 * @param serverPort Port number of Hydrogen server
 * @param scriptContent Lua script content to execute
 * @returns Server response text
 */
export async function executeScript(
	serverPort: number,
	scriptContent: string,
): Promise<string> {
	if (!serverPort) {
		throw new Error(
			`Could not locate Hydrogen server on ports ${START_PORT}-${END_PORT}`,
		);
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
		throw new Error(`HTTP ${response.status}: ${errorText}`);
	}

	return await response.text();
}

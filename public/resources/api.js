const START_PORT = 6969;
const END_PORT = 7069;

async function executeScript(scriptContent) {
	let serverPort = null;
	let lastError = "";

	for (let port = START_PORT; port <= END_PORT; port++) {
		try {
			const res = await fetch(`http://127.0.0.1:${port}/secret`, {
				method: "GET",
			});
			if (res.ok && (await res.text()) === "0xdeadbeef") {
				serverPort = port;
				break;
			}
		} catch (e) {
			lastError = e.message;
		}
	}

	if (!serverPort) {
		throw new Error(
			`Could not locate HTTP server on ports ${START_PORT}-${END_PORT}. Last error: ${lastError}`,
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

const START_PORT = 6969;
const END_PORT = 7069;

/**
 * The function `executeScript` attempts to locate an HTTP server within a specified port range, sends
 * a script content to the server for execution, and returns the response.
 * @param scriptContent - The `scriptContent` parameter in the `executeScript` function is the content
 * of the script that you want to execute on the HTTP server. This script content will be sent in the
 * body of a POST request to the server for execution.
 * @returns The `executeScript` function returns the response text from the HTTP POST request made to
 * the server at the located port after successfully finding the server port by iterating through a
 * range of ports and checking for a specific response from the server. If the server port is not found
 * within the specified range, an error is thrown indicating the failure to locate the HTTP server on
 * the specified ports along with the last error encountered
 */
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

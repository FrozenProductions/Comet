#!/usr/bin/env node

import { showCli } from "./interface/comet.js";

async function main() {
	try {
		await showCli();
	} catch (error) {
		console.error("An error occurred:", error);
		process.exit(1);
	}
}

main();

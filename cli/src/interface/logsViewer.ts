import inquirer from "inquirer";
import chalk from "chalk";
import { scanRobloxLogs } from "../services/logService.js";
import { LogEntry } from "../types/logs.js";

/**
 * Displays logs with pagination and auto-refresh functionality
 * @param entries Initial array of log entries to display
 * @param title Title to show at the top of the logs view
 * @param promptContinue Function to prompt user to continue
 * @param returnToLogOptions Function to return to log options menu
 * @param enableAutoRefresh Whether auto-refresh should be enabled initially
 */
async function showLogs(
	entries: LogEntry[],
	title: string,
	promptContinue: () => Promise<void>,
	returnToLogOptions: () => Promise<void>,
	enableAutoRefresh = false,
): Promise<void> {
	const PAGE_SIZE = 10;
	let currentPage = 0;

	let autoRefreshEnabled = enableAutoRefresh;
	let refreshIntervalId: NodeJS.Timeout | null = null;
	let latestEntries = [...entries];

	const renderPage = (showUpdatedMessage = false) => {
		console.clear();
		const newTotalPages = Math.ceil(latestEntries.length / PAGE_SIZE);

		if (currentPage >= newTotalPages && newTotalPages > 0) {
			currentPage = newTotalPages - 1;
		}

		console.log(
			chalk.blue.bold(`${title} (Page ${currentPage + 1}/${newTotalPages})`) +
				(autoRefreshEnabled
					? chalk.green(" [Auto-refresh ON]")
					: chalk.red(" [Auto-refresh OFF]")),
		);

		if (showUpdatedMessage && autoRefreshEnabled) {
			console.log(chalk.green("Logs updated automatically"));
		}

		console.log(chalk.dim("----------------------------------------"));

		const pageEntries = latestEntries.slice(
			currentPage * PAGE_SIZE,
			(currentPage + 1) * PAGE_SIZE,
		);

		if (pageEntries.length === 0) {
			console.log(chalk.yellow("\nNo logs to display."));
		} else {
			for (const entry of pageEntries) {
				const levelColor =
					entry.level === "ERROR"
						? chalk.red
						: entry.level === "WARNING"
							? chalk.yellow
							: chalk.green;

				console.log(
					chalk.blue(`[${entry.timestamp}]`) +
						levelColor(` [${entry.level}]`) +
						chalk.white(` ${entry.message}`),
				);
			}
		}

		console.log(chalk.dim("\n----------------------------------------"));
	};

	const startAutoRefresh = () => {
		if (refreshIntervalId) clearInterval(refreshIntervalId);

		refreshIntervalId = setInterval(async () => {
			let userIsSelecting = false;
			try {
				const ui = inquirer.ui as any;
				userIsSelecting = ui && ui.activePrompt;
			} catch {}

			if (userIsSelecting) return;

			const result = await scanRobloxLogs();
			if (result.success && result.entries.length > 0) {
				if (result.entries.length > latestEntries.length) {
					latestEntries = [...result.entries];

					if (!userIsSelecting) {
						renderPage(false);
					}
				}
			}
		}, 5000);
	};

	if (autoRefreshEnabled) {
		startAutoRefresh();
	}

	while (true) {
		renderPage(false);

		const navigationChoices = [];

		if (currentPage < Math.ceil(latestEntries.length / PAGE_SIZE) - 1) {
			navigationChoices.push({ name: "Next page", value: "next" });
		}

		if (currentPage > 0) {
			navigationChoices.push({ name: "Previous page", value: "prev" });
		}

		navigationChoices.push({
			name: autoRefreshEnabled
				? "Turn auto-refresh OFF"
				: "Turn auto-refresh ON",
			value: "toggle_refresh",
		});

		navigationChoices.push({ name: "Refresh logs now", value: "refresh" });

		if (latestEntries.length > PAGE_SIZE) {
			navigationChoices.push({
				name: "Jump to latest logs",
				value: "latest",
			});
		}

		navigationChoices.push({ name: "Back to options", value: "back" });

		const { action } = await inquirer.prompt([
			{
				type: "list",
				name: "action",
				message: "Navigation:",
				choices: navigationChoices,
			},
		]);

		if (action === "prev") {
			currentPage--;
		} else if (action === "next") {
			currentPage++;
		} else if (action === "toggle_refresh") {
			autoRefreshEnabled = !autoRefreshEnabled;
			if (autoRefreshEnabled) {
				console.log(
					chalk.green(
						"\nAuto-refresh enabled. Logs will update every 5 seconds.",
					),
				);
				startAutoRefresh();
			} else {
				console.log(chalk.yellow("\nAuto-refresh disabled."));
				if (refreshIntervalId) {
					clearInterval(refreshIntervalId);
					refreshIntervalId = null;
				}
			}
			await new Promise((resolve) => setTimeout(resolve, 1500));
		} else if (action === "refresh") {
			console.log(chalk.dim("\nRefreshing logs..."));

			try {
				const result = await scanRobloxLogs();
				if (result.success) {
					latestEntries = [...result.entries];
					console.log(
						chalk.green(
							`\nLogs refreshed. Found ${result.entries.length} entries.`,
						),
					);

					console.log(chalk.dim("----------------------------------------"));

					const pageEntries = latestEntries.slice(
						currentPage * PAGE_SIZE,
						(currentPage + 1) * PAGE_SIZE,
					);

					if (pageEntries.length === 0) {
						console.log(chalk.yellow("\nNo logs to display."));
					} else {
						for (const entry of pageEntries) {
							const levelColor =
								entry.level === "ERROR"
									? chalk.red
									: entry.level === "WARNING"
										? chalk.yellow
										: chalk.green;

							console.log(
								chalk.blue(`[${entry.timestamp}]`) +
									levelColor(` [${entry.level}]`) +
									chalk.white(` ${entry.message}`),
							);
						}
					}

					console.log(chalk.dim("\n----------------------------------------"));
					console.log(
						chalk.green(
							"Navigation options remain below. Press up/down to see them.",
						),
					);
				} else {
					console.log(chalk.red(`\nFailed to refresh logs: ${result.error}`));
				}
			} catch (error) {
				console.log(
					chalk.red(
						"\nError during refresh: " +
							(error instanceof Error ? error.message : String(error)),
					),
				);
			}

			await new Promise((resolve) => setTimeout(resolve, 1000));
		} else if (action === "latest") {
			currentPage = Math.ceil(latestEntries.length / PAGE_SIZE) - 1;
		} else if (action === "back") {
			if (refreshIntervalId) {
				clearInterval(refreshIntervalId);
				refreshIntervalId = null;
			}
			await returnToLogOptions();
			break;
		}
	}
}

/**
 * Filters logs based on a user-provided keyword
 * @param entries Array of log entries to filter
 * @param promptContinue Function to prompt user to continue
 * @param returnToMenu Function to return to main menu
 * @param enableAutoRefresh Whether auto-refresh should be enabled
 */
async function filterLogs(
	entries: LogEntry[],
	promptContinue: () => Promise<void>,
	returnToMenu: () => Promise<void>,
	enableAutoRefresh = false,
): Promise<void> {
	const { keyword } = await inquirer.prompt([
		{
			type: "input",
			name: "keyword",
			message: "Enter keyword to filter logs by:",
			validate: (input: string) => {
				if (!input.trim()) {
					return "Keyword cannot be empty.";
				}
				return true;
			},
		},
	]);

	const filtered = entries.filter((entry) =>
		entry.raw.toLowerCase().includes(keyword.toLowerCase()),
	);

	if (filtered.length === 0) {
		console.log(chalk.yellow(`\nNo logs found containing '${keyword}'.`));
		await promptContinue();
		await showLogsOptions(
			entries,
			promptContinue,
			returnToMenu,
			enableAutoRefresh,
		);
	} else {
		console.log(
			chalk.green(`\nFound ${filtered.length} logs containing '${keyword}'.`),
		);
		await showLogs(
			filtered,
			`Logs containing '${keyword}'`,
			promptContinue,
			() =>
				showLogsOptions(
					entries,
					promptContinue,
					returnToMenu,
					enableAutoRefresh,
				),
			enableAutoRefresh,
		);
	}
}

/**
 * Displays options for viewing logs including filtering and refresh capabilities
 * @param entries Array of log entries to display options for
 * @param promptContinue Function to prompt user to continue
 * @param returnToMenu Function to return to main menu
 * @param enableAutoRefresh Whether auto-refresh should be enabled
 */
async function showLogsOptions(
	entries: LogEntry[],
	promptContinue: () => Promise<void>,
	returnToMenu: () => Promise<void>,
	enableAutoRefresh = false,
): Promise<void> {
	try {
		const refreshResult = await scanRobloxLogs();
		if (refreshResult.success && refreshResult.entries.length > 0) {
			entries = [...refreshResult.entries];
		}
	} catch {}

	const errorCount = entries.filter((entry) => entry.level === "ERROR").length;
	const warningCount = entries.filter(
		(entry) => entry.level === "WARNING",
	).length;

	const { option } = await inquirer.prompt([
		{
			type: "list",
			name: "option",
			message: "What would you like to view?",
			choices: [
				{
					name: `View all logs (${entries.length} entries)`,
					value: "all",
				},
				{
					name: `View error logs only (${errorCount} entries)`,
					value: "errors",
				},
				{
					name: `View warnings & errors (${errorCount + warningCount} entries)`,
					value: "warnings",
				},
				{ name: "Filter logs by keyword", value: "filter" },
				{ name: "Refresh logs", value: "refresh" },
				{ name: "Return to main menu", value: "back" },
			],
		},
	]);

	switch (option) {
		case "all":
			await showLogs(
				entries,
				"All Logs",
				promptContinue,
				() =>
					showLogsOptions(
						entries,
						promptContinue,
						returnToMenu,
						enableAutoRefresh,
					),
				enableAutoRefresh,
			);
			break;

		case "errors":
			const errorLogs = entries.filter((entry) => entry.level === "ERROR");
			await showLogs(
				errorLogs,
				"Error Logs",
				promptContinue,
				() =>
					showLogsOptions(
						entries,
						promptContinue,
						returnToMenu,
						enableAutoRefresh,
					),
				enableAutoRefresh,
			);
			break;

		case "warnings":
			const warningLogs = entries.filter(
				(entry) => entry.level === "ERROR" || entry.level === "WARNING",
			);
			await showLogs(
				warningLogs,
				"Warnings & Errors",
				promptContinue,
				() =>
					showLogsOptions(
						entries,
						promptContinue,
						returnToMenu,
						enableAutoRefresh,
					),
				enableAutoRefresh,
			);
			break;

		case "filter":
			await filterLogs(
				entries,
				promptContinue,
				returnToMenu,
				enableAutoRefresh,
			);
			break;

		case "refresh":
			await refreshLogs(promptContinue, returnToMenu);
			break;

		case "back":
			await returnToMenu();
			break;
	}
}

/**
 * Main entry point for the logs viewer interface
 * @param promptContinue Function to prompt user to continue
 * @param returnToMenu Function to return to main menu
 */
export async function logsViewer(
	promptContinue: () => Promise<void>,
	returnToMenu: () => Promise<void>,
): Promise<void> {
	console.clear();
	console.log(
		chalk.blue.bold(`
░▒▓█▓▒░       ░▒▓██████▓▒░  ░▒▓███████▓▒░  ░▒▓█▓▒░       ░▒▓██████▓▒░  ░▒▓███████▓▒░  ░▒▓█████▓▒░░▒▓████████▓▒░ 
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░        ░▒▓█▓▒░     
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░        ░▒▓█▓▒░     
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓███████▓▒░  ░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓███████▓▒░  ░▒▓█████▓▒░    ░▒▓█▓▒░     
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░     ░▒▓█▓▒░    ░▒▓█▓▒░     
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░     ░▒▓█▓▒░    ░▒▓█▓▒░     
░▒▓████████▓▒░░▒▓██████▓▒░  ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓████████▓▒░░▒▓██████▓▒░  ░▒▓█▓▒░░▒▓█▓▒░░▒▓█████▓▒░    ░▒▓█▓▒░     
`),
	);

	const spinner = ["◐", "◓", "◑", "◒"];
	let i = 0;
	const intervalId = setInterval(() => {
		process.stdout.write(`\r${spinner[i++ % spinner.length]} `);
	}, 100);

	const result = await scanRobloxLogs();

	clearInterval(intervalId);
	process.stdout.write("\r");

	if (!result.success) {
		console.log(chalk.red.bold("\nError scanning logs:"));
		console.log(chalk.red(result.error));
		await promptContinue();
		await returnToMenu();
		return;
	}

	console.log(
		chalk.green.bold(`\nFound ${result.entries.length} log entries.`),
	);

	if (result.entries.length === 0) {
		console.log(chalk.yellow("\nNo log entries to display."));
		await promptContinue();
		await returnToMenu();
		return;
	}

	let allEntries = [...result.entries];

	await showLogsOptions(allEntries, promptContinue, returnToMenu, true);
}

/**
 * Refreshes logs from the source and displays updated entries
 * @param promptContinue Function to prompt user to continue
 * @param returnToMenu Function to return to main menu
 */
async function refreshLogs(
	promptContinue: () => Promise<void>,
	returnToMenu: () => Promise<void>,
): Promise<void> {
	console.log(chalk.dim("\nRefreshing logs..."));

	const spinner = ["◐", "◓", "◑", "◒"];
	let i = 0;
	const intervalId = setInterval(() => {
		process.stdout.write(`\r${spinner[i++ % spinner.length]} `);
	}, 100);

	const result = await scanRobloxLogs();

	clearInterval(intervalId);
	process.stdout.write("\r");

	if (!result.success) {
		console.log(chalk.red.bold("\nError refreshing logs:"));
		console.log(chalk.red(result.error));
		await promptContinue();
		await returnToMenu();
		return;
	}

	console.log(
		chalk.green.bold(
			`\nRefreshed: ${result.entries.length} log entries found.`,
		),
	);

	if (result.entries.length === 0) {
		console.log(chalk.yellow("\nNo log entries available."));
		await promptContinue();
		await returnToMenu();
		return;
	}

	await showLogsOptions(result.entries, promptContinue, returnToMenu, true);
}

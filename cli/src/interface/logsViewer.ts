import chalk from "chalk";
import inquirer from "inquirer";
import { setupKeyboardListener } from "../services/keyboardService.js";
import { scanRobloxLogs } from "../services/logService.js";
import type { LogAction } from "../types/keybinds.js";
import type { LogEntry, ViewType } from "../types/logs.js";

let isOptionsActive = false;
let currentPrompt: any = null;

let currentViewType: ViewType = "all";
let currentKeyword: string | null = null;

function filterEntriesByViewType(
    entries: LogEntry[],
    viewType: ViewType,
    keyword: string | null = null,
): LogEntry[] {
    let filtered = [...entries];

    if (keyword) {
        filtered = filtered.filter((entry) =>
            entry.raw.toLowerCase().includes(keyword.toLowerCase()),
        );
    }

    switch (viewType) {
        case "errors":
            return filtered.filter((entry) => entry.level === "ERROR");
        case "warnings":
            return filtered.filter(
                (entry) => entry.level === "ERROR" || entry.level === "WARNING",
            );
        default:
            return filtered;
    }
}

/**
 * Displays logs with pagination and auto-refresh functionality
 * @param entries Initial array of log entries to display
 * @param title Title to show at the top of the logs view
 * @param returnToLogOptions Function to return to log options menu
 * @param viewType Type of logs to display
 * @param keyword Keyword to filter logs by
 */
async function showLogs(
    entries: LogEntry[],
    title: string,
    returnToLogOptions: () => Promise<void>,
    viewType: ViewType = "all",
    keyword: string | null = null,
): Promise<void> {
    currentViewType = viewType;
    currentKeyword = keyword;
    const PAGE_SIZE = 10;
    let currentPage = 0;
    const latestEntries = [...entries];

    const renderPage = () => {
        console.clear();
        const totalPages = Math.ceil(latestEntries.length / PAGE_SIZE);

        if (currentPage >= totalPages && totalPages > 0) {
            currentPage = totalPages - 1;
        }

        console.log(
            chalk.blue.bold(`${title} (Page ${currentPage + 1}/${totalPages})`),
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
    };

    while (true) {
        renderPage();

        const navigationChoices = [];

        if (currentPage < Math.ceil(latestEntries.length / PAGE_SIZE) - 1) {
            navigationChoices.push({ name: "Next page", value: "next" });
        }

        if (currentPage > 0) {
            navigationChoices.push({ name: "Previous page", value: "prev" });
        }

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
        } else if (action === "latest") {
            currentPage = Math.ceil(latestEntries.length / PAGE_SIZE) - 1;
        } else if (action === "back") {
            await returnToLogOptions();
            break;
        }
    }
}

/**
 * Filters logs based on a user-provided keyword
 * @param entries Array of log entries to filter
 * @param returnToMenu Function to return to main menu
 */
async function filterLogs(
    entries: LogEntry[],
    returnToMenu: () => Promise<void>,
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

    currentKeyword = keyword;
    const filtered = filterEntriesByViewType(entries, currentViewType, keyword);

    if (filtered.length === 0) {
        console.log(chalk.yellow(`\nNo logs found containing "${keyword}".`));
        await showLogsOptions(entries, returnToMenu);
    } else {
        console.log(
            chalk.green(
                `\nFound ${filtered.length} logs containing "${keyword}".`,
            ),
        );
        await showLogs(
            filtered,
            `Logs containing "${keyword}"`,
            () => showLogsOptions(entries, returnToMenu),
            currentViewType,
            currentKeyword,
        );
    }
}

/**
 * Displays options for viewing logs including filtering and refresh capabilities
 * @param entries Array of log entries to display options for
 * @param returnToMenu Function to return to main menu
 */
async function showLogsOptions(
    entries: LogEntry[],
    returnToMenu: () => Promise<void>,
): Promise<void> {
    const errorLogs = entries.filter((entry) => entry.level === "ERROR");
    const warningLogs = entries.filter((entry) => entry.level === "WARNING");

    isOptionsActive = true;
    const cleanup = setupKeyboardListener(
        async (action) => {
            if (currentPrompt) {
                currentPrompt.ui.close();
                currentPrompt = null;
            }
            isOptionsActive = false;
            cleanup();
            console.clear();
            await handleLogAction(action as LogAction, entries, returnToMenu);
        },
        () => isOptionsActive,
        true,
    );

    try {
        const prompt = inquirer.createPromptModule();
        const promptInstance = prompt([
            {
                type: "list",
                name: "option",
                message: "What would you like to view?",
                choices: [
                    {
                        name: `View all logs (${entries.length} entries) (1)`,
                        value: "all",
                    },
                    {
                        name: `View error logs only (${errorLogs.length} entries) (2)`,
                        value: "errors",
                    },
                    {
                        name: `View warnings & errors (${errorLogs.length + warningLogs.length} entries) (3)`,
                        value: "warnings",
                    },
                    { name: "Filter logs by keyword (4)", value: "filter" },
                    { name: "Return to main menu (q)", value: "back" },
                ],
            },
        ]);

        currentPrompt = promptInstance;
        const result = await promptInstance;
        currentPrompt = null;
        isOptionsActive = false;
        cleanup();
        await handleLogAction(
            result.option as LogAction,
            entries,
            returnToMenu,
        );
    } catch (_error) {
        if (currentPrompt) {
            currentPrompt.ui.close();
            currentPrompt = null;
        }
        isOptionsActive = false;
        cleanup();
    }
}

/**
 * Main entry point for the logs viewer interface
 * @param returnToMenu Function to return to main menu
 */
export async function logsViewer(
    returnToMenu: () => Promise<void>,
): Promise<void> {
    console.clear();
    console.log(
        chalk.blue.bold(`
░▒▓█▓▒░      ░▒▓██████▓▒░ ░▒▓██████▓▒░ ░▒▓███████▓▒░ 
░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░        
░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░      ░▒▓█▓▒░        
░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒▒▓███▓▒░░▒▓██████▓▒░  
░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░ 
░▒▓█▓▒░     ░▒▓█▓▒░░▒▓█▓▒░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░ 
░▒▓████████▓▒░▒▓██████▓▒░ ░▒▓██████▓▒░░▒▓███████▓▒░    
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
        await returnToMenu();
        return;
    }

    console.log(
        chalk.green.bold(`\nFound ${result.entries.length} log entries.`),
    );

    if (result.entries.length === 0) {
        console.log(chalk.yellow("\nNo log entries to display."));
        await returnToMenu();
        return;
    }

    const allEntries = [...result.entries];
    await showLogsOptions(allEntries, returnToMenu);
}

async function handleLogAction(
    action: LogAction,
    entries: LogEntry[],
    returnToMenu: () => Promise<void>,
): Promise<void> {
    switch (action) {
        case "all":
            currentViewType = "all";
            currentKeyword = null;
            await showLogs(
                entries,
                "All Logs",
                () => showLogsOptions(entries, returnToMenu),
                "all",
            );
            break;
        case "errors":
            currentViewType = "errors";
            await showLogs(
                filterEntriesByViewType(entries, "errors", currentKeyword),
                "Error Logs",
                () => showLogsOptions(entries, returnToMenu),
                "errors",
                currentKeyword,
            );
            break;
        case "warnings":
            currentViewType = "warnings";
            await showLogs(
                filterEntriesByViewType(entries, "warnings", currentKeyword),
                "Warnings & Errors",
                () => showLogsOptions(entries, returnToMenu),
                "warnings",
                currentKeyword,
            );
            break;
        case "filter":
            await filterLogs(entries, returnToMenu);
            break;
        case "back":
            currentViewType = "all";
            currentKeyword = null;
            await returnToMenu();
            break;
    }
}

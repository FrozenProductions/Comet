import inquirer from "inquirer";
import chalk from "chalk";
import { MainMenuOption } from "../types/menu.js";
import { promptContinue } from "../utils/prompt.js";
import { listScripts } from "./listScripts.js";
import { createScript } from "./createScript.js";
import { executeScriptMenu } from "./executeScript.js";
import { deleteScriptMenu } from "./deleteScript.js";
import { logsViewer } from "./logsViewer.js";

/**
 * Displays the main menu and handles user selection of actions
 */
async function mainMenu(): Promise<void> {
	const { action } = await inquirer.prompt([
		{
			type: "list",
			name: "action",
			message: "What would you like to do?",
			choices: [
				{ name: "List scripts", value: "list" },
				{ name: "Create script", value: "create" },
				{ name: "Execute script", value: "execute" },
				{ name: "Delete script", value: "delete" },
				{ name: "View Roblox logs", value: "logs" },
				{ name: "Exit", value: "exit" },
			],
		},
	]);

	switch (action as MainMenuOption) {
		case "list":
			await listScripts(promptContinue, mainMenu);
			break;
		case "create":
			await createScript(promptContinue, mainMenu);
			break;
		case "execute":
			await executeScriptMenu(promptContinue, mainMenu);
			break;
		case "delete":
			await deleteScriptMenu(promptContinue, mainMenu);
			break;
		case "logs":
			await logsViewer(promptContinue, mainMenu);
			break;
		case "exit":
			console.log(chalk.green("\nThank you for using Comet. Goodbye!"));
			process.exit(0);
	}
}

/**
 * Initializes and displays the CLI interface
 */
export async function showCli(): Promise<void> {
	console.clear();
	console.log(
		chalk.blue.bold(`
 ░▒▓██████▓▒░   ░▒▓██████▓▒░  ░▒▓██████████████▓▒░  ░▒▓████████▓▒░ ░▒▓████████▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░           ░▒▓█▓▒░     
░▒▓█▓▒░        ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░           ░▒▓█▓▒░     
░▒▓█▓▒░        ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓██████▓▒░      ░▒▓█▓▒░     
░▒▓█▓▒░        ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░           ░▒▓█▓▒░     
░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓█▓▒░           ░▒▓█▓▒░     
 ░▒▓██████▓▒░   ░▒▓██████▓▒░  ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░ ░▒▓████████▓▒░    ░▒▓█▓▒░   
`),
	);

	await mainMenu();
}

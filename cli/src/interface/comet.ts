import inquirer from "inquirer";
import chalk from "chalk";
import { MainMenuOption } from "../types/menu.js";
import { promptContinue } from "../utils/prompt.js";
import { listScripts } from "./listScripts.js";
import { createScript } from "./createScript.js";
import { executeScriptMenu } from "./executeScript.js";
import { deleteScriptMenu } from "./deleteScript.js";
import { logsViewer } from "./logsViewer.js";
import { setupKeyboardListener } from "../services/keyboardService.js";

let isMenuActive = false;
let currentPrompt: any = null;

async function mainMenu(): Promise<void> {
	isMenuActive = true;
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

	const cleanup = setupKeyboardListener(
		async (action) => {
			if (currentPrompt) {
				currentPrompt.ui.close();
				currentPrompt = null;
			}
			isMenuActive = false;
			cleanup();
			console.clear();
			await handleMenuAction(action as MainMenuOption);
		},
		() => isMenuActive,
	);

	try {
		const prompt = inquirer.createPromptModule();
		const promptInstance = prompt([
			{
				type: "list",
				name: "action",
				message: "What would you like to do?",
				choices: [
					{ name: "List scripts (l)", value: "list" },
					{ name: "Create script (c)", value: "create" },
					{ name: "Execute script (x)", value: "execute" },
					{ name: "Delete script (d)", value: "delete" },
					{ name: "View Roblox logs (v)", value: "logs" },
					{ name: "Exit (q)", value: "exit" },
				],
			},
		]);

		currentPrompt = promptInstance;
		const result = await promptInstance;
		currentPrompt = null;
		isMenuActive = false;
		cleanup();
		await handleMenuAction(result.action as MainMenuOption);
	} catch {
		if (currentPrompt) {
			currentPrompt.ui.close();
			currentPrompt = null;
		}
		isMenuActive = false;
		cleanup();
	}
}

async function handleMenuAction(action: MainMenuOption): Promise<void> {
	switch (action) {
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
			await logsViewer(mainMenu);
			break;
		case "exit":
			console.log(chalk.green("\nThank you for using Comet. Goodbye!"));
			process.exit(0);
	}
}

export async function showCli(): Promise<void> {
	await mainMenu();
}

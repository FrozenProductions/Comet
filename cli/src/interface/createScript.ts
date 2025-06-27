import inquirer from "inquirer";
import chalk from "chalk";
import { saveScript } from "../services/scriptService.js";
import { Script } from "../types/script.js";
import fs from "fs/promises";
import path from "path";

/**
 * Creates a new Luau script by prompting the user for a name and content.
 * @param promptContinue Function to prompt user to continue
 * @param returnToMenu Function to return to main menu
 */
export async function createScript(
	promptContinue: () => Promise<void>,
	returnToMenu: () => Promise<void>,
): Promise<void> {
	console.clear();
	console.log(
		chalk.blue.bold(`
 ░▒▓██████▓▒░ ░▒▓███████▓▒░ ░▒▓████████▓▒░ ░▒▓██████▓▒░░▒▓████████▓▒░░▒▓████████▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░  ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░  ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓█▓▒░       ░▒▓███████▓▒░ ░▒▓██████▓▒░  ░▒▓████████▓▒░  ░▒▓█▓▒░    ░▒▓██████▓▒░   
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░  ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░  ░▒▓█▓▒░    ░▒▓█▓▒░        
 ░▒▓██████▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓████████▓▒░░▒▓█▓▒░░▒▓█▓▒░  ░▒▓█▓▒░    ░▒▓████████▓▒░
 `),
	);

	const { name } = await inquirer.prompt([
		{
			type: "input",
			name: "name",
			message: "Enter script name:",
			validate: (input: string) => {
				if (!input.trim()) return "Script name cannot be empty.";
				if (!/^[a-zA-Z0-9_-]+$/.test(input)) {
					return "Script name can only contain letters, numbers, underscores, and hyphens.";
				}
				return true;
			},
		},
	]);

	const { inputMethod } = await inquirer.prompt([
		{
			type: "list",
			name: "inputMethod",
			message: "How would you like to input the script content?",
			choices: [
				{ name: "Use editor", value: "editor" },
				{ name: "Select existing file", value: "file" },
			],
		},
	]);

	let content = "";

	if (inputMethod === "editor") {
		const response = await inquirer.prompt([
			{
				type: "editor",
				name: "content",
				message: "Write your Luau script (press ESC and then Enter when done):",
				default: "",
				validate: (input: string) => {
					if (!input.trim()) {
						return "Script content cannot be empty.";
					}
					return true;
				},
			},
		]);
		content = response.content;
	} else {
		const { filePath } = await inquirer.prompt([
			{
				type: "input",
				name: "filePath",
				message: "Enter the path to the file:",
				validate: async (input: string) => {
					try {
						const stats = await fs.stat(input);
						if (!stats.isFile()) {
							return "The specified path is not a file.";
						}
						return true;
					} catch {
						return "File does not exist or cannot be accessed.";
					}
				},
			},
		]);

		try {
			content = await fs.readFile(filePath, "utf-8");
			console.log(chalk.green(`File loaded: ${path.basename(filePath)}`));
		} catch (error) {
			console.log(chalk.red(`Error reading file: ${(error as Error).message}`));
			await promptContinue();
			await returnToMenu();
			return;
		}
	}

	const script: Script = {
		name,
		content,
	};

	const success = await saveScript(script);

	if (success) {
		console.log(chalk.green(`\nScript "${name}" created successfully.`));
	} else {
		console.log(chalk.red(`\nFailed to create script "${name}".`));
	}

	await promptContinue();
	await returnToMenu();
}

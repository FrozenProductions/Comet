import inquirer from "inquirer";

/**
 * Prompts the user to press Enter to continue
 */
export async function promptContinue(): Promise<void> {
	await inquirer.prompt([
		{
			type: "input",
			name: "_",
			message: "Press Enter to continue...",
		},
	]);
}

import inquirer from "inquirer";
import chalk from "chalk";
import { saveScript } from "../services/scriptService.js";
import { Script } from "../types/script.js";

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

    const { content } = await inquirer.prompt([
        {
            type: "editor",
            name: "content",
            message:
                "Write your Luau script (press ESC and then Enter when done):",
            default: "",
            validate: (input: string) => {
                if (!input.trim()) {
                    return "Script content cannot be empty.";
                }
                return true;
            },
        },
    ]);

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

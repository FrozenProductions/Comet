import chalk from "chalk";
import inquirer from "inquirer";
import { deleteScript, loadScripts } from "../services/scriptService.js";
import type { ScriptChoice } from "../types/menu.js";

/**
 * Displays the delete script menu and handles script deletion
 * @param promptContinue Function to prompt user to continue
 * @param returnToMenu Function to return to main menu
 */
export async function deleteScriptMenu(
    promptContinue: () => Promise<void>,
    returnToMenu: () => Promise<void>,
): Promise<void> {
    console.clear();
    console.log(
        chalk.blue.bold(`
░▒▓███████▓▒░ ░▒▓████████▓▒░░▒▓█▓▒░       ░▒▓████████▓▒░░▒▓████████▓▒░░▒▓████████▓▒░ 
░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░       ░▒▓█▓▒░          ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░       ░▒▓█▓▒░          ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓█▓▒░░▒▓█▓▒░░▒▓██████▓▒░  ░▒▓█▓▒░       ░▒▓██████▓▒░     ░▒▓█▓▒░    ░▒▓██████▓▒░   
░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░       ░▒▓█▓▒░          ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░       ░▒▓█▓▒░       ░▒▓█▓▒░          ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓███████▓▒░ ░▒▓████████▓▒░░▒▓████████▓▒░░▒▓████████▓▒░   ░▒▓█▓▒░    ░▒▓████████▓▒░
`),
    );

    const scripts = await loadScripts();

    if (scripts.length === 0) {
        console.log(chalk.yellow("\nNo scripts available to delete."));
        await promptContinue();
        await returnToMenu();
        return;
    }

    const scriptChoices: ScriptChoice<string>[] = scripts.map((script) => ({
        name: script.name,
        value: script.name,
    }));

    scriptChoices.push({
        name: "Back to main menu",
        value: null as unknown as string,
    });

    const { selectedScript } = await inquirer.prompt([
        {
            type: "list",
            name: "selectedScript",
            message: "Select a script to delete:",
            choices: scriptChoices,
        },
    ]);

    if (!selectedScript) {
        await returnToMenu();
        return;
    }

    const { confirm } = await inquirer.prompt([
        {
            type: "confirm",
            name: "confirm",
            message: `Are you sure you want to delete script "${selectedScript}"?`,
            default: false,
        },
    ]);

    if (confirm) {
        const success = await deleteScript(selectedScript);

        if (success) {
            console.log(
                chalk.green(
                    `\nScript "${selectedScript}" deleted successfully.`,
                ),
            );
        } else {
            console.log(
                chalk.red(`\nFailed to delete script "${selectedScript}".`),
            );
        }
    } else {
        console.log(chalk.yellow("\nDeletion cancelled."));
    }

    await promptContinue();
    await returnToMenu();
}

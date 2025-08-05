import chalk from "chalk";
import { loadScripts } from "../services/scriptService.js";

/**
 * Displays a list of all available Luau scripts with their names and first lines
 * @param promptContinue Function to prompt user to continue
 * @param returnToMenu Function to return to main menu
 */
export async function listScripts(
    promptContinue: () => Promise<void>,
    returnToMenu: () => Promise<void>,
): Promise<void> {
    console.clear();
    console.log(
        chalk.blue.bold(`
░▒▓█▓▒░       ░▒▓█▓▒░ ░▒▓███████▓▒░░▒▓████████▓▒░ 
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░          ░▒▓█▓▒░     
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░          ░▒▓█▓▒░     
░▒▓█▓▒░       ░▒▓█▓▒░ ░▒▓██████▓▒░    ░▒▓█▓▒░     
░▒▓█▓▒░       ░▒▓█▓▒░       ░▒▓█▓▒░   ░▒▓█▓▒░     
░▒▓█▓▒░       ░▒▓█▓▒░       ░▒▓█▓▒░   ░▒▓█▓▒░     
░▒▓████████▓▒░░▒▓█▓▒░░▒▓███████▓▒░    ░▒▓█▓▒░    
`),
    );

    const scripts = await loadScripts();

    if (scripts.length === 0) {
        console.log(chalk.yellow("\nNo scripts found."));
    } else {
        scripts.forEach((script, index) => {
            console.log(chalk.green.bold(`\n${index + 1}. ${script.name}`));

            const firstLine = script.content.split("\n")[0];
            console.log(
                chalk.dim(
                    `   ${firstLine}${script.content.split("\n").length > 1 ? "..." : ""}`,
                ),
            );
        });
    }

    await promptContinue();
    await returnToMenu();
}

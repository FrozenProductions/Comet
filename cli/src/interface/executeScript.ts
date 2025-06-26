import inquirer from "inquirer";
import chalk from "chalk";
import { loadScripts, executeScript } from "../services/scriptService.js";
import { Script } from "../types/script.js";
import { ScriptChoice } from "../types/menu.js";

/**
 * Displays the execute script menu and handles script execution
 * @param promptContinue Function to prompt user to continue
 * @param returnToMenu Function to return to main menu
 */
export async function executeScriptMenu(
    promptContinue: () => Promise<void>,
    returnToMenu: () => Promise<void>,
): Promise<void> {
    console.clear();
    console.log(
        chalk.blue.bold(`
░▒▓████████▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓████████▓▒░░▒▓██████▓▒░ ░▒▓█▓▒░░▒▓█▓▒░░▒▓████████▓▒░░▒▓████████▓▒░ 
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░   ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░   ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓██████▓▒░   ░▒▓██████▓▒░ ░▒▓██████▓▒░ ░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░   ░▒▓█▓▒░    ░▒▓██████▓▒░   
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░   ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓█▓▒░       ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░      ░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓█▓▒░   ░▒▓█▓▒░    ░▒▓█▓▒░        
░▒▓████████▓▒░░▒▓█▓▒░░▒▓█▓▒░░▒▓████████▓▒░░▒▓██████▓▒░  ░▒▓██████▓▒░    ░▒▓█▓▒░    ░▒▓████████▓▒░
`),
    );

    const scripts = await loadScripts();

    if (scripts.length === 0) {
        console.log(chalk.yellow("\nNo scripts available to execute."));
        await promptContinue();
        await returnToMenu();
        return;
    }

    const scriptChoices: ScriptChoice<Script>[] = scripts.map((script) => ({
        name: script.name,
        value: script,
    }));

    scriptChoices.push({
        name: "Back to main menu",
        value: null as unknown as Script,
    });

    const { selectedScript } = await inquirer.prompt([
        {
            type: "list",
            name: "selectedScript",
            message: "Select a script to execute:",
            choices: scriptChoices,
        },
    ]);

    if (!selectedScript) {
        await returnToMenu();
        return;
    }

    console.log(chalk.dim("\nExecuting script..."));

    const spinner = ["◐", "◓", "◑", "◒"];
    let i = 0;
    const intervalId = setInterval(() => {
        process.stdout.write(`\r${spinner[i++ % spinner.length]} `);
    }, 100);

    const result = await executeScript(selectedScript.content);

    clearInterval(intervalId);
    process.stdout.write("\r");

    if (result.success) {
        console.log(chalk.green.bold("\nScript executed successfully!\n"));

        if (result.output) {
            console.log(chalk.magenta.bold("Output:"));
            console.log(chalk.white(result.output));
        } else {
            console.log(chalk.dim("No output returned."));
        }
    } else {
        console.log(chalk.red.bold("\nError executing script:"));
        console.log(chalk.red(result.error));
    }

    await promptContinue();
    await returnToMenu();
}

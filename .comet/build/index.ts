import { spawn } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import ora from "ora";
import {
    loadCometConfig,
    updateCometConfig,
    updateTauriConfig,
} from "./utils/configManager";
import { updateThemes } from "./utils/themeManager";
import { updateTitles } from "./utils/updateTitles";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirPath = dirname(currentFilePath);

function spawnPromise(
    command: string,
    args: string[],
    options: any,
): Promise<void> {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, options);

        let stderr = "";

        if (child.stderr) {
            child.stderr.on("data", (data) => {
                stderr += data.toString();
            });
        }

        child.on("close", (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(
                    new Error(`Process exited with code ${code}\n${stderr}`),
                );
            }
        });

        child.on("error", reject);
    });
}

async function buildForBrand(brandName: string): Promise<void> {
    const config = loadCometConfig();
    const brandConfig = config.brands[brandName];

    if (!brandConfig) {
        throw new Error(`Unknown brand: ${brandName}`);
    }

    const tauriConfigPath = resolve(
        currentDirPath,
        "../../src-tauri/tauri.conf.json",
    );

    console.log(
        chalk.cyan(`\nStarting build process for ${chalk.bold(brandName)}\n`),
    );

    const configSpinner = ora("Updating configuration files").start();
    try {
        updateTauriConfig(brandConfig, tauriConfigPath);
        updateCometConfig(brandConfig);
        updateTitles(brandConfig);
        updateThemes(brandName);
        configSpinner.succeed(
            chalk.green("Configuration files updated successfully"),
        );
    } catch (_error) {
        configSpinner.fail(chalk.red("Failed to update configuration files"));
        process.exit(1);
    }

    const buildSpinner = ora("Building Tauri executable").start();
    try {
        const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
        await spawnPromise(npmCmd, ["run", "tauri:build:universal"], {
            cwd: resolve(currentDirPath, "../.."),
            stdio: ["ignore", "ignore", "pipe"],
        });

        buildSpinner.succeed(
            chalk.green("Tauri executable built successfully"),
        );

        if (brandName !== "default") {
            const resetSpinner = ora(
                "Resetting configuration to default brand",
            ).start();
            try {
                const defaultConfig = config.brands.default;
                updateTauriConfig(defaultConfig, tauriConfigPath);
                updateCometConfig(defaultConfig);
                updateTitles(defaultConfig);
                updateThemes("default");
                resetSpinner.succeed(
                    chalk.green("Configuration reset to default brand"),
                );
            } catch (_error) {
                resetSpinner.fail(chalk.red("Failed to reset configuration"));
            }
        }

        console.log(chalk.green("\nBuild completed successfully!"));
    } catch (error) {
        buildSpinner.fail(chalk.red("Failed to build Tauri executable"));
        console.error(chalk.dim("\nError details:"));
        console.error(chalk.red(error));
        process.exit(1);
    }
}

async function main(): Promise<void> {
    const brandToBuild = process.argv[2];
    const config = loadCometConfig();
    const supportedBrands = Object.keys(config.brands);

    if (!brandToBuild) {
        console.error(chalk.red("\nPlease specify a brand to build"));
        console.log(
            chalk.dim(
                `Available brands: ${supportedBrands.map((b) => chalk.cyan(b)).join(", ")}\n`,
            ),
        );
        process.exit(1);
    }

    if (!supportedBrands.includes(brandToBuild)) {
        console.error(
            chalk.red(`\nUnknown brand: ${chalk.bold(brandToBuild)}`),
        );
        console.log(
            chalk.dim(
                `Available brands: ${supportedBrands.map((b) => chalk.cyan(b)).join(", ")}\n`,
            ),
        );
        process.exit(1);
    }

    await buildForBrand(brandToBuild);
}

main().catch((error) => {
    console.error(chalk.red("\nBuild process failed"));
    console.error(chalk.dim(error));
    process.exit(1);
});

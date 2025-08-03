import { spawn } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import chalk from "chalk";
import ora from "ora";
import { type BRANDS_CONFIG, SUPPORTED_BRANDS } from "./constants/brands";
import { resetToDefault, switchBrand } from "./utils/brandManager";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

function updateTauriConfig(
	brandConfig: (typeof BRANDS_CONFIG)[keyof typeof BRANDS_CONFIG],
	configPath: string,
): void {
	const tauriConfig = JSON.parse(readFileSync(configPath, "utf-8"));

	tauriConfig.package.productName = brandConfig.productName;
	tauriConfig.tauri.bundle.icon = [brandConfig.iconPath];
	tauriConfig.tauri.windows[0].title = brandConfig.productName;

	writeFileSync(configPath, JSON.stringify(tauriConfig, null, 4));
}

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
				reject(new Error(`Process exited with code ${code}\n${stderr}`));
			}
		});

		child.on("error", reject);
	});
}

async function buildForBrand(brand: keyof typeof BRANDS_CONFIG): Promise<void> {
	const brandConfig = switchBrand(brand);
	const tauriConfigPath = resolve(__dirname, "../../src-tauri/tauri.conf.json");

	console.log(
		chalk.cyan(`\n🚀 Starting build process for ${chalk.bold(brand)}\n`),
	);

	const configSpinner = ora("Updating configuration files").start();
	try {
		updateTauriConfig(brandConfig, tauriConfigPath);
		configSpinner.succeed(
			chalk.green("Configuration files updated successfully"),
		);
	} catch (_error) {
		configSpinner.fail(chalk.red("Failed to update configuration files"));
		process.exit(1);
	}

	const buildSpinner = ora("Building Tauri executable").start();
	let retryCount = 0;
	const maxRetries = 2;

	while (retryCount < maxRetries) {
		try {
			const npmCmd = process.platform === "win32" ? "npm.cmd" : "npm";
			await spawnPromise(npmCmd, ["run", "tauri:build:universal"], {
				cwd: resolve(__dirname, "../.."),
				stdio: ["ignore", "ignore", "pipe"],
			});

			buildSpinner.succeed(chalk.green("Tauri executable built successfully"));
			console.log(chalk.green("\n✨ Build completed successfully!"));

			const resetSpinner = ora("Resetting to default configuration").start();
			try {
				const defaultConfig = resetToDefault();
				updateTauriConfig(defaultConfig, tauriConfigPath);
			} catch (error) {
				resetSpinner.fail(chalk.red("Failed to reset configuration"));
				console.error(chalk.dim("\nError details:"));
				console.error(chalk.red(error));
			}
			break;
		} catch (error: unknown) {
			const errorMessage =
				error instanceof Error ? error.toString() : String(error);
			if (
				errorMessage.includes("error running bundle_dmg.sh") &&
				retryCount < maxRetries - 1
			) {
				retryCount++;
				buildSpinner.text = chalk.yellow(
					`Retrying build attempt ${retryCount}/${maxRetries - 1}...`,
				);
				continue;
			}

			buildSpinner.fail(chalk.red("Failed to build Tauri executable"));
			console.error(chalk.dim("\nError details:"));
			console.error(chalk.red(error));
			process.exit(1);
		}
	}
}

async function main(): Promise<void> {
	const brandToBuild = process.argv[2];

	if (!brandToBuild) {
		console.error(chalk.red("\n❌ Please specify a brand to build"));
		console.log(
			chalk.dim(
				`Available brands: ${SUPPORTED_BRANDS.map((b) => chalk.cyan(b)).join(", ")}\n`,
			),
		);
		process.exit(1);
	}

	if (!SUPPORTED_BRANDS.includes(brandToBuild)) {
		console.error(chalk.red(`\n❌ Unknown brand: ${chalk.bold(brandToBuild)}`));
		console.log(
			chalk.dim(
				`Available brands: ${SUPPORTED_BRANDS.map((b) => chalk.cyan(b)).join(", ")}\n`,
			),
		);
		process.exit(1);
	}

	await buildForBrand(brandToBuild as keyof typeof BRANDS_CONFIG);
}

main().catch((error) => {
	console.error(chalk.red("\n❌ Build process failed"));
	console.error(chalk.dim(error));
	process.exit(1);
});

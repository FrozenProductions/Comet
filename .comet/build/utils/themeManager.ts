import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

export function updateThemes(brandName: string): void {
	const tailwindConfigPath = resolve(process.cwd(), "tailwind.config.ts");
	const tailwindBackupPath = resolve(
		process.cwd(),
		"tailwind.default.config.ts",
	);
	const tailwindBrandPath = resolve(
		process.cwd(),
		`tailwind.${brandName}.config.ts`,
	);

	if (brandName !== "default") {
		const currentConfig = readFileSync(tailwindConfigPath, "utf-8");
		writeFileSync(tailwindBackupPath, currentConfig, "utf-8");
		const brandConfig = readFileSync(tailwindBrandPath, "utf-8");
		writeFileSync(tailwindConfigPath, brandConfig, "utf-8");
	} else {
		const defaultConfig = readFileSync(tailwindBackupPath, "utf-8");
		writeFileSync(tailwindConfigPath, defaultConfig, "utf-8");
	}

	const editorPath = resolve(process.cwd(), "src/constants/core/editor.ts");
	const editorContent = readFileSync(editorPath, "utf-8");

	const updatedContent = editorContent.replace(
		/export const monacoTheme = \w+MonacoTheme;/,
		`export const monacoTheme = ${brandName === "ronix" ? "ronixMonacoTheme" : "defaultMonacoTheme"};`,
	);

	writeFileSync(editorPath, updatedContent, "utf-8");
}

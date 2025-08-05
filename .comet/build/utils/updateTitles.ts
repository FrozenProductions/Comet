import { writeFileSync } from "node:fs";
import { resolve } from "node:path";
import type { BrandConfig } from "../types/config";

export function updateTitles(brandConfig: BrandConfig): void {
    const titlesPath = resolve(process.cwd(), "src/constants/ui/titles.ts");
    const content = `export const APP_TITLE = "${brandConfig.productName}" as const;\n`;
    writeFileSync(titlesPath, content, "utf-8");
}

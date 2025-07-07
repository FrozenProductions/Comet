import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [react()],
	clearScreen: false,
	base: "./",

	server: {
		port: 5173,
		strictPort: true,
		watch: {
			ignored: ["**/src-tauri/**"],
		},
	},

	resolve: {
		alias: {
			"@": resolve(__dirname, "src"),
		},
	},

	build: {
		target: ["es2021", "chrome100", "safari13"],
		minify: !process.env.TAURI_DEBUG ? "esbuild" : false,
		sourcemap: !!process.env.TAURI_DEBUG,
		chunkSizeWarningLimit: 1000,
	},

	worker: {
		format: "es",
	},

	optimizeDeps: {
		include: [
			"monaco-editor/esm/vs/language/json/json.worker",
			"monaco-editor/esm/vs/language/typescript/ts.worker",
			"monaco-editor/esm/vs/editor/editor.worker",
		],
		exclude: ["monaco-editor"],
	},

	esbuild: {
		legalComments: "none",
		minifyIdentifiers: true,
		minifySyntax: true,
		minifyWhitespace: true,
		keepNames: false,
	},

	envPrefix: ["VITE_", "TAURI_"],
});

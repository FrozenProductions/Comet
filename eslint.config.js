import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";

export default [
	{ ignores: ["dist"] },
	{
		files: ["**/*.{ts,tsx}"],
		languageOptions: {
			parser: tsParser,
			parserOptions: {
				ecmaVersion: 2020,
				sourceType: "module",
				ecmaFeatures: {
					jsx: true,
				},
			},
			globals: {
				...globals.browser,
			},
		},
		plugins: {
			"@typescript-eslint": tseslint,
			"react-hooks": reactHooks,
			"react-refresh": reactRefresh,
		},
		rules: {
			"no-unused-vars": "off",
			"@typescript-eslint/no-unused-vars": "warn",
			"no-use-before-define": "off",
			"@typescript-eslint/no-use-before-define": "warn",
			...reactHooks.configs.recommended.rules,
			"react-refresh/only-export-components": [
				"warn",
				{ allowConstantExport: true },
			],
		},
	},
];

import type { Config } from "tailwindcss";

export default {
	content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
	theme: {
		extend: {
			colors: {
				theme: {
					base: "#161b22",
					surface: "#22272e",
					raised: "#2d333b",
					overlay: "#373e47",
					border: "#444c56",
					muted: "#545d68",
					subtle: "#7d8590",
					text: "#d4dde5",
					bright: "#ffffff",
					accent: {
						DEFAULT: "#a5aed4",
						light: "#c1c7e6",
						dark: "#8995c2",
					},
				},
				palette: {
					rosewater: "#f4dbd6",
					flamingo: "#f0c6c6",
					pink: "#f5bde6",
					mauve: "#c6a0f6",
					red: "#ff7b72",
					maroon: "#ee99a0",
					peach: "#f5a97f",
					yellow: "#e3b341",
					green: "#7ee787",
					teal: "#8bd5ca",
					sky: "#91d7e3",
					sapphire: "#7dc4e4",
					blue: "#79c0ff",
					lavender: "#b7bdf8",
				},
			},
		},
	},
	plugins: [],
} satisfies Config;

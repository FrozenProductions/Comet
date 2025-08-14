import type { Config } from "tailwindcss";

export default {
    content: ["./src/**/*.{js,jsx,ts,tsx}", "./index.html"],
    theme: {
        extend: {
            colors: {
                ctp: {
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
                    text: "#d4dde5",
                    subtext1: "#bbc6d0",
                    subtext0: "#97a4af",
                    overlay2: "#7d8590",
                    overlay1: "#545d68",
                    overlay0: "#444c56",
                    surface2: "#2d333b",
                    surface1: "#22272e",
                    surface0: "#1b2028",
                    base: "#10141a",
                    mantle: "#0d1117",
                    crust: "#090c10",
                },
                accent: {
                    light: "#8785c7",
                    DEFAULT: "#6c69b5",
                    gradient:
                        "linear-gradient(to bottom right, #8785c7, #6c69b5)",
                },
            },
            backgroundImage: {
                "accent-gradient":
                    "linear-gradient(to bottom right, #8785c7, #6c69b5)",
                "accent-gradient-r":
                    "linear-gradient(to right, #8785c7, #6c69b5)",
            },
            animation: {
                "fade-in": "fadeIn 0.5s ease-in-out",
                "slide-up": "slideUp 0.5s ease-out",
                "slide-in": "slideIn 0.3s ease-out",
            },
            keyframes: {
                fadeIn: {
                    "0%": { opacity: "0" },
                    "100%": { opacity: "1" },
                },
                slideUp: {
                    "0%": { transform: "translateY(20px)", opacity: "0" },
                    "100%": { transform: "translateY(0)", opacity: "1" },
                },
                slideIn: {
                    "0%": { transform: "translateX(-20px)", opacity: "0" },
                    "100%": { transform: "translateX(0)", opacity: "1" },
                },
            },
            boxShadow: {
                glow: "0 0 20px -5px rgba(108, 105, 181, 0.25)",
            },
        },
    },
    plugins: [],
} satisfies Config;

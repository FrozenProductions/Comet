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
                    surface2: "#373e47",
                    surface1: "#2d333b",
                    surface0: "#22272e",
                    base: "#161b22",
                    mantle: "#1b2028",
                    crust: "#10141a",
                },
                accent: {
                    light: "#c1c7e6",
                    DEFAULT: "#a5aed4",
                    gradient:
                        "linear-gradient(to bottom right, #c1c7e6, #a5aed4)",
                },
            },
            backgroundImage: {
                "accent-gradient":
                    "linear-gradient(to bottom right, #c1c7e6, #a5aed4)",
                "accent-gradient-r":
                    "linear-gradient(to right, #c1c7e6, #a5aed4)",
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
                glow: "0 0 20px -5px rgba(121, 192, 255, 0.25)",
            },
        },
    },
    plugins: [],
} satisfies Config;

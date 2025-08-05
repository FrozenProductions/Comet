import type { GalleryImageProps } from "../types/gallery";

export const LANDING_CONTENT = {
    TITLE: "Modern Executor Interface",
    DESCRIPTION:
        "Experience a sleek, minimalist interface for Hydrogen executor. Built with performance and user experience in mind.",
    FEATURES: [
        {
            title: "Performance First",
            description:
                "Optimized for speed and efficiency, ensuring smooth execution of your scripts with minimal resource usage.",
        },
        {
            title: "Modern UI",
            description:
                "Clean, intuitive interface designed for maximum productivity with a minimalist aesthetic.",
        },
        {
            title: "Script Management",
            description:
                "Organize and manage your scripts with an intuitive workspace system and auto-execute functionality.",
        },
    ],
    TECH_STACK: [
        {
            name: "Tauri",
            description:
                "Lightweight, secure framework for building desktop applications",
        },
        {
            name: "React",
            description: "Modern frontend library for building user interfaces",
        },
        {
            name: "TypeScript",
            description:
                "Type-safe JavaScript for better development experience",
        },
        {
            name: "TailwindCSS",
            description: "Utility-first CSS framework for rapid UI development",
        },
        {
            name: "Rust",
            description:
                "Performance-focused backend with memory safety guarantees",
        },
    ],
    INSTALLATION: {
        ONE_LINE: "curl -s https://www.comet-ui.fun/api/v1/installer | bash",
        STEPS: [
            "git clone https://github.com/FrozenProductions/Comet.git",
            "cd Comet",
            "npm install",
            "npm run tauri:dev",
            "npm run tauri:build:universal",
        ],
    },
    CAUTION:
        "Using Roblox executors may result in your account being banned. Use at your own risk. The developers are not responsible for any consequences.",
} as const;

export const GALLERY_IMAGES: GalleryImageProps[] = [
    {
        src: "https://raw.githubusercontent.com/FrozenProductions/Comet/main/.github/assets/preview_1.png",
        alt: "Comet editor",
    },
    {
        src: "https://raw.githubusercontent.com/FrozenProductions/Comet/main/.github/assets/preview_2.png",
        alt: "Comet Settings",
    },
    {
        src: "https://raw.githubusercontent.com/FrozenProductions/Comet/main/.github/assets/preview_3.png",
        alt: "Scripts Library",
    },
    {
        src: "https://raw.githubusercontent.com/FrozenProductions/Comet/main/.github/assets/preview_4.png",
        alt: "Auto Execute",
    },
    {
        src: "https://raw.githubusercontent.com/FrozenProductions/Comet/main/.github/assets/preview_5.png",
        alt: "Fast Flags",
    },
] as const;

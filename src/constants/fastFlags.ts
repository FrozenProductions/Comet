import { FastFlagsState } from "../types/fastFlags";
import { FastFlagCategory } from "../types/fastFlags";

export const INITIAL_FAST_FLAGS_STATE: FastFlagsState = {
    profiles: [],
    activeProfileId: null,
    isLoading: true,
    error: null,
} as const;

export const FAST_FLAG_CATEGORIES: readonly FastFlagCategory[] = [
    {
        id: "graphics",
        label: "Graphics",
        description: "Visual and rendering settings",
        flags: [
            {
                key: "DFIntTaskSchedulerTargetFps",
                label: "Target FPS",
                description:
                    "Target frame rate for the game. Higher values provide smoother gameplay but may impact performance.",
                type: "slider",
                defaultValue: 60,
                min: 30,
                max: 360,
                step: 1,
            },
            {
                key: "LightingTechnology",
                label: "Lighting Technology",
                description:
                    "Choose the lighting technology to use. Each phase introduces improved lighting and shadow quality.",
                type: "radio",
                defaultValue: "default",
                options: [
                    {
                        label: "Default",
                        value: "default",
                        description: "Standard Roblox lighting system",
                    },
                    {
                        label: "Voxel",
                        value: "voxel",
                        description:
                            "Improved lighting with voxel-based calculations",
                    },
                    {
                        label: "Shadowmap",
                        value: "shadowmap",
                        description: "Enhanced shadows and ambient lighting",
                    },
                    {
                        label: "Future",
                        value: "future",
                        description:
                            "Latest lighting technology with advanced features",
                    },
                ],
                relatedFlags: {
                    voxel: {
                        DFFlagDebugRenderForceTechnologyVoxel: "True",
                    },
                    shadowmap: {
                        FFlagDebugForceFutureIsBrightPhase2: "True",
                    },
                    future: {
                        FFlagDebugForceFutureIsBrightPhase3: "True",
                    },
                },
            },
            {
                key: "RenderingAPI",
                label: "Rendering API",
                description:
                    "Select the graphics API for rendering. Each option offers different performance characteristics.",
                type: "radio",
                defaultValue: "default",
                options: [
                    {
                        label: "Default",
                        value: "default",
                        description: "Use system default rendering API",
                    },
                    {
                        label: "Metal",
                        value: "metal",
                        description:
                            "Apple's Metal API for optimal macOS performance",
                    },
                    {
                        label: "Vulkan",
                        value: "vulkan",
                        description:
                            "Modern, high-performance graphics and compute API",
                    },
                    {
                        label: "OpenGL",
                        value: "opengl",
                        description: "Cross-platform graphics API",
                    },
                ],
                relatedFlags: {
                    metal: {
                        FFlagDebugGraphicsPreferMetal: "True",
                    },
                    vulkan: {
                        FFlagDebugGraphicsDisableDirect3D11: "True",
                        FFlagDebugGraphicsPreferVulkan: "True",
                    },
                    opengl: {
                        FFlagDebugGraphicsDisableDirect3D11: "True",
                        FFlagDebugGraphicsPreferOpenGL: "True",
                    },
                },
            },
            {
                key: "GraySky",
                label: "Sky Color",
                description:
                    "Choose between default game sky or gray sky for better visibility in some games.",
                type: "radio",
                defaultValue: "default",
                options: [
                    {
                        label: "Game Sky",
                        value: "default",
                        description: "Keep original game sky colors",
                    },
                    {
                        label: "Gray Sky",
                        value: "enabled",
                        description: "Force gray sky for better visibility",
                    },
                ],
                relatedFlags: {
                    enabled: {
                        FFlagDebugSkyGray: "True",
                    },
                },
            },
            {
                key: "PlayerShadows",
                label: "Player Shadows",
                description:
                    "Toggle player shadows. Disabling shadows can improve performance.",
                type: "checkbox",
                defaultValue: true,
                relatedFlags: {
                    FIntRenderShadowIntensity: (value: boolean) =>
                        value ? "100" : "0",
                },
            },
        ],
    },
    {
        id: "threading",
        label: "Threading",
        description: "CPU threading and performance settings",
        flags: [
            {
                key: "HyperThreading",
                label: "Thread Mode",
                description:
                    "Choose between single or multi-threaded mode for CPU utilization.",
                type: "radio",
                defaultValue: "default",
                options: [
                    {
                        label: "Single Thread",
                        value: "default",
                        description:
                            "Basic threading mode, better for simple games",
                    },
                    {
                        label: "Multi Thread",
                        value: "enabled",
                        description:
                            "Advanced threading for better performance on modern CPUs",
                    },
                ],
                relatedFlags: {
                    enabled: {
                        FFlagDebugCheckRenderThreading: "True",
                        FFlagRenderDebugCheckThreading2: "True",
                    },
                },
            },
            {
                key: "MaxThreads",
                label: "Maximum Threads",
                description:
                    "Set the maximum number of threads Roblox can use. Higher values may improve performance on multi-core CPUs.",
                type: "slider",
                defaultValue: 1200,
                min: 100,
                max: 2400,
                step: 100,
                relatedFlags: {
                    FIntRuntimeMaxNumOfThreads: "$value",
                },
            },
            {
                key: "MinThreads",
                label: "Minimum Threads",
                description:
                    "Set the minimum number of threads for the task scheduler. Adjust based on your CPU's capabilities.",
                type: "slider",
                defaultValue: 6,
                min: 3,
                max: 12,
                step: 1,
                relatedFlags: {
                    FIntTaskSchedulerThreadMin: "$value",
                },
            },
        ],
    },
] as const;

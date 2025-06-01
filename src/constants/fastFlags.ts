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
    {
        id: "telemetry",
        label: "Telemetry",
        description: "Data collection and analytics settings",
        flags: [
            {
                key: "TelemetryCollection",
                label: "Telemetry Collection",
                description: "Control data collection and analytics features",
                type: "radio",
                defaultValue: "default",
                options: [
                    {
                        label: "Default",
                        value: "default",
                        description: "Use default telemetry settings",
                    },
                    {
                        label: "Disabled",
                        value: "disabled",
                        description: "Disable all telemetry collection",
                    },
                ],
                relatedFlags: {
                    disabled: {
                        DFStringTelemetryV2Url: "0.0.0.0",
                        FFlagEnableTelemetryProtocol: "False",
                        FFlagEnableTelemetryService1: "false",
                        FFlagPropertiesEnableTelemetry: "False",
                        FFlagOpenTelemetryEnabled2: "False",
                        FLogRobloxTelemetry: "False",
                    },
                },
            },
        ],
    },
    {
        id: "voiceChat",
        label: "Voice Chat",
        description: "Voice chat and audio settings",
        flags: [
            {
                key: "DFIntVoiceChatRollOffMinDistance",
                label: "Minimum Distance",
                description:
                    "Minimum distance for voice chat audio roll-off (closer than this will be at full volume)",
                type: "slider",
                defaultValue: 7,
                min: 1,
                max: 20,
                step: 1,
            },
            {
                key: "DFIntVoiceChatRollOffMaxDistance",
                label: "Maximum Distance",
                description:
                    "Maximum distance for voice chat audio roll-off (farther than this will be silent)",
                type: "slider",
                defaultValue: 80,
                min: 20,
                max: 150,
                step: 5,
            },
        ],
    },
] as const;

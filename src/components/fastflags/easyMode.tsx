import React, { useState } from "react";
import { FastFlagsProfile } from "../../types/fastFlags";
import { FAST_FLAG_CATEGORIES } from "../../constants/fastFlags";
import { Slider } from "../ui/slider";
import { RadioGroup } from "../ui/radioGroup";
import {
    User,
    Zap,
    Gauge,
    Layers,
    Cpu,
    Cloud,
    Radio,
    Volume2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Checkbox } from "../ui/checkbox";

type LightingTechnology = "default" | "voxel" | "shadowmap" | "future";
type RenderingAPI = "default" | "metal" | "vulkan" | "opengl";
type HyperThreading = "default" | "enabled";
type GraySky = "default" | "enabled";
type TelemetryMode = "default" | "disabled";
type NonDefaultLightingTechnology = Exclude<LightingTechnology, "default">;
type NonDefaultRenderingAPI = Exclude<RenderingAPI, "default">;
type NonDefaultHyperThreading = Exclude<HyperThreading, "default">;
type NonDefaultGraySky = Exclude<GraySky, "default">;
type NonDefaultTelemetryMode = Exclude<TelemetryMode, "default">;

interface FastFlagManagerProps {
    profile: FastFlagsProfile;
    onUpdateFlag: (key: string, value: string | null) => Promise<void>;
    invalidFlags: string[];
    validationError?: string | null;
}

export const EasyMode: React.FC<FastFlagManagerProps> = ({
    profile,
    onUpdateFlag,
}) => {
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const currentShadowIntensity =
        !profile.flags.hasOwnProperty("FIntRenderShadowIntensity") ||
        Number(profile.flags["FIntRenderShadowIntensity"]) > 0;

    const handleSliderChange = async (key: string, value: number) => {
        try {
            setIsUpdating(key);
            await onUpdateFlag(key, value.toString());
            toast.success(`${key} updated`);
        } catch (error) {
            console.error(`Failed to update ${key}:`, error);
            toast.error(`Failed to update ${key}`);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleLightingChange = async (value: LightingTechnology) => {
        try {
            const lightingFlag = FAST_FLAG_CATEGORIES[0].flags[1];
            setIsUpdating(lightingFlag.key);

            if (lightingFlag.relatedFlags) {
                const technologies = Object.keys(
                    lightingFlag.relatedFlags,
                ) as NonDefaultLightingTechnology[];
                for (const tech of technologies) {
                    for (const flag of Object.keys(
                        lightingFlag.relatedFlags[tech],
                    )) {
                        await onUpdateFlag(flag, null);
                    }
                }
            }

            if (
                value !== "default" &&
                lightingFlag.relatedFlags?.[
                    value as NonDefaultLightingTechnology
                ]
            ) {
                const flags =
                    lightingFlag.relatedFlags[
                        value as NonDefaultLightingTechnology
                    ];
                for (const [flag, flagValue] of Object.entries(flags)) {
                    await onUpdateFlag(flag, String(flagValue));
                }
            }

            toast.success("Lighting technology updated");
        } catch (error) {
            console.error("Failed to update lighting flags:", error);
            toast.error("Failed to update lighting technology");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleRenderingAPIChange = async (value: RenderingAPI) => {
        try {
            const renderingFlag = FAST_FLAG_CATEGORIES[0].flags[2];
            setIsUpdating(renderingFlag.key);

            if (renderingFlag.relatedFlags) {
                const apis = Object.keys(
                    renderingFlag.relatedFlags,
                ) as NonDefaultRenderingAPI[];
                for (const api of apis) {
                    for (const flag of Object.keys(
                        renderingFlag.relatedFlags[api],
                    )) {
                        await onUpdateFlag(flag, null);
                    }
                }
            }

            if (
                value !== "default" &&
                renderingFlag.relatedFlags?.[value as NonDefaultRenderingAPI]
            ) {
                const flags =
                    renderingFlag.relatedFlags[value as NonDefaultRenderingAPI];
                for (const [flag, flagValue] of Object.entries(flags)) {
                    await onUpdateFlag(flag, String(flagValue));
                }
            }

            toast.success("Rendering API updated");
        } catch (error) {
            console.error("Failed to update rendering API flags:", error);
            toast.error("Failed to update rendering API");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleHyperThreadingChange = async (value: HyperThreading) => {
        try {
            const threadingFlag = FAST_FLAG_CATEGORIES[1].flags[0];
            setIsUpdating(threadingFlag.key);

            if (threadingFlag.relatedFlags) {
                const modes = Object.keys(
                    threadingFlag.relatedFlags,
                ) as NonDefaultHyperThreading[];
                for (const mode of modes) {
                    for (const flag of Object.keys(
                        threadingFlag.relatedFlags[mode],
                    )) {
                        await onUpdateFlag(flag, null);
                    }
                }
            }

            if (
                value !== "default" &&
                threadingFlag.relatedFlags?.[value as NonDefaultHyperThreading]
            ) {
                const flags =
                    threadingFlag.relatedFlags[
                        value as NonDefaultHyperThreading
                    ];
                for (const [flag, flagValue] of Object.entries(flags)) {
                    await onUpdateFlag(flag, String(flagValue));
                }
            }

            toast.success("HyperThreading updated");
        } catch (error) {
            console.error("Failed to update threading flags:", error);
            toast.error("Failed to update HyperThreading");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleThreadCountChange = async (key: string, value: number) => {
        try {
            const flag = FAST_FLAG_CATEGORIES[1].flags.find(
                (f) => f.key === key,
            );
            if (!flag || !flag.relatedFlags) return;

            setIsUpdating(key);

            for (const [flagKey, flagValue] of Object.entries(
                flag.relatedFlags,
            )) {
                await onUpdateFlag(
                    flagKey,
                    String(flagValue).replace("$value", String(value)),
                );
            }

            toast.success(`${flag.label} updated`);
        } catch (error) {
            console.error(`Failed to update ${key}:`, error);
            toast.error(`Failed to update thread count`);
        } finally {
            setIsUpdating(null);
        }
    };

    const handleGraySkyChange = async (value: GraySky) => {
        try {
            const graySkyFlag = FAST_FLAG_CATEGORIES[0].flags[3];
            setIsUpdating(graySkyFlag.key);

            if (graySkyFlag.relatedFlags) {
                const modes = Object.keys(
                    graySkyFlag.relatedFlags,
                ) as NonDefaultGraySky[];
                for (const mode of modes) {
                    for (const flag of Object.keys(
                        graySkyFlag.relatedFlags[mode],
                    )) {
                        await onUpdateFlag(flag, null);
                    }
                }
            }

            if (
                value !== "default" &&
                graySkyFlag.relatedFlags?.[value as NonDefaultGraySky]
            ) {
                const flags =
                    graySkyFlag.relatedFlags[value as NonDefaultGraySky];
                for (const [flag, flagValue] of Object.entries(flags)) {
                    await onUpdateFlag(flag, String(flagValue));
                }
            }

            toast.success("Gray sky setting updated");
        } catch (error) {
            console.error("Failed to update gray sky setting:", error);
            toast.error("Failed to update gray sky");
        } finally {
            setIsUpdating(null);
        }
    };

    const handleShadowToggle = async () => {
        try {
            const shadowFlag = FAST_FLAG_CATEGORIES[0].flags[4];
            if (!shadowFlag.relatedFlags) return;

            setIsUpdating(shadowFlag.key);

            const newValue = !currentShadowIntensity;
            if (newValue) {
                await onUpdateFlag("FIntRenderShadowIntensity", null);
            } else {
                await onUpdateFlag("FIntRenderShadowIntensity", "0");
            }

            toast.success("Player shadows updated");
        } catch (error) {
            console.error("Failed to update player shadows:", error);
            toast.error("Failed to update player shadows");
        } finally {
            setIsUpdating(null);
        }
    };

    const graphicsFlags = FAST_FLAG_CATEGORIES[0].flags;
    const threadingFlags = FAST_FLAG_CATEGORIES[1].flags;
    const telemetryFlags = FAST_FLAG_CATEGORIES[2].flags;
    const voiceChatFlags = FAST_FLAG_CATEGORIES[3].flags;

    const fpsFlag = graphicsFlags[0];
    const lightingFlag = graphicsFlags[1];
    const renderingFlag = graphicsFlags[2];
    const graySkyFlag = graphicsFlags[3];
    const shadowFlag = graphicsFlags[4];
    const hyperThreadingFlag = threadingFlags[0];
    const maxThreadsFlag = threadingFlags[1];
    const minThreadsFlag = threadingFlags[2];
    const telemetryFlag = telemetryFlags[0];
    const voiceChatMinDistanceFlag = voiceChatFlags[0];
    const voiceChatMaxDistanceFlag = voiceChatFlags[1];

    const handleTelemetryChange = async (value: TelemetryMode) => {
        try {
            setIsUpdating(telemetryFlag.key);

            if (telemetryFlag.relatedFlags) {
                const modes = Object.keys(
                    telemetryFlag.relatedFlags,
                ) as NonDefaultTelemetryMode[];
                for (const mode of modes) {
                    for (const flag of Object.keys(
                        telemetryFlag.relatedFlags[mode],
                    )) {
                        await onUpdateFlag(flag, null);
                    }
                }
            }

            if (
                value !== "default" &&
                telemetryFlag.relatedFlags?.[value as NonDefaultTelemetryMode]
            ) {
                const flags =
                    telemetryFlag.relatedFlags[
                        value as NonDefaultTelemetryMode
                    ];
                for (const [flag, flagValue] of Object.entries(flags)) {
                    await onUpdateFlag(flag, String(flagValue));
                }
            }

            toast.success("Telemetry settings updated");
        } catch (error) {
            console.error("Failed to update telemetry flags:", error);
            toast.error("Failed to update telemetry settings");
        } finally {
            setIsUpdating(null);
        }
    };

    const currentFps = Number(
        profile.flags[fpsFlag.key] ?? fpsFlag.defaultValue,
    );
    const currentMaxThreads = Number(
        profile.flags[Object.keys(maxThreadsFlag.relatedFlags!)[0]] ??
            maxThreadsFlag.defaultValue,
    );
    const currentMinThreads = Number(
        profile.flags[Object.keys(minThreadsFlag.relatedFlags!)[0]] ??
            minThreadsFlag.defaultValue,
    );

    let currentLighting: LightingTechnology = "default";
    if (lightingFlag.relatedFlags) {
        for (const [tech, flags] of Object.entries(lightingFlag.relatedFlags)) {
            const hasAllFlags = Object.entries(flags).every(
                ([flag, value]) => profile.flags[flag] === value,
            );
            if (hasAllFlags) {
                currentLighting = tech as LightingTechnology;
                break;
            }
        }
    }

    let currentRendering: RenderingAPI = "default";
    if (renderingFlag.relatedFlags) {
        for (const [api, flags] of Object.entries(renderingFlag.relatedFlags)) {
            const hasAllFlags = Object.entries(flags).every(
                ([flag, value]) => profile.flags[flag] === value,
            );
            if (hasAllFlags) {
                currentRendering = api as RenderingAPI;
                break;
            }
        }
    }

    let currentHyperThreading: HyperThreading = "default";
    if (hyperThreadingFlag.relatedFlags) {
        for (const [mode, flags] of Object.entries(
            hyperThreadingFlag.relatedFlags,
        )) {
            const hasAllFlags = Object.entries(flags).every(
                ([flag, value]) => profile.flags[flag] === value,
            );
            if (hasAllFlags) {
                currentHyperThreading = mode as HyperThreading;
                break;
            }
        }
    }

    let currentGraySky: GraySky = "default";
    if (graySkyFlag.relatedFlags) {
        for (const [mode, flags] of Object.entries(graySkyFlag.relatedFlags)) {
            const hasAllFlags = Object.entries(flags).every(
                ([flag, value]) => profile.flags[flag] === value,
            );
            if (hasAllFlags) {
                currentGraySky = mode as GraySky;
                break;
            }
        }
    }

    let currentTelemetry: TelemetryMode = "default";
    if (telemetryFlag.relatedFlags) {
        for (const [mode, flags] of Object.entries(
            telemetryFlag.relatedFlags,
        )) {
            const hasAllFlags = Object.entries(flags).every(
                ([flag, value]) => profile.flags[flag] === value,
            );
            if (hasAllFlags) {
                currentTelemetry = mode as TelemetryMode;
                break;
            }
        }
    }

    const currentVoiceChatMinDistance = Number(
        profile.flags[voiceChatMinDistanceFlag.key] ??
            voiceChatMinDistanceFlag.defaultValue,
    );

    const currentVoiceChatMaxDistance = Number(
        profile.flags[voiceChatMaxDistanceFlag.key] ??
            voiceChatMaxDistanceFlag.defaultValue,
    );

    return (
        <div className="flex flex-1 flex-col bg-ctp-base">
            <div className="flex h-14 items-center border-b border-white/5 px-4">
                <div className="flex items-center gap-2">
                    <User size={16} className="text-white/50" />
                    <h3 className="text-sm font-medium text-ctp-text">
                        {profile.name}
                    </h3>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto">
                <div className="mx-auto max-w-3xl p-4">
                    <div className="mb-6 space-y-1">
                        <h2 className="text-lg font-medium text-ctp-text">
                            Fast Flags
                        </h2>
                        <p className="text-sm text-ctp-subtext0">
                            Configure game performance and graphics settings
                        </p>
                    </div>

                    <div className="space-y-6">
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="rounded-xl border border-white/5 bg-ctp-mantle"
                        >
                            <div className="border-b border-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                                        <Gauge
                                            size={20}
                                            className="text-accent"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-ctp-text">
                                            Performance Settings
                                        </h3>
                                        <p className="text-xs text-ctp-subtext0">
                                            Adjust game performance and frame
                                            rate
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating === fpsFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <Slider
                                        value={currentFps}
                                        min={fpsFlag.min ?? 30}
                                        max={fpsFlag.max ?? 360}
                                        step={fpsFlag.step ?? 1}
                                        onChange={(value) =>
                                            handleSliderChange(
                                                fpsFlag.key,
                                                value,
                                            )
                                        }
                                        label={fpsFlag.label}
                                        description={fpsFlag.description}
                                        unit=" FPS"
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="rounded-xl border border-white/5 bg-ctp-mantle"
                        >
                            <div className="border-b border-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                                        <Zap
                                            size={20}
                                            className="text-accent"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-ctp-text">
                                            Graphics Technology
                                        </h3>
                                        <p className="text-xs text-ctp-subtext0">
                                            Choose advanced lighting and
                                            rendering features
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating === lightingFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <RadioGroup
                                        value={currentLighting}
                                        onChange={(value) =>
                                            handleLightingChange(
                                                value as LightingTechnology,
                                            )
                                        }
                                        options={[
                                            ...(lightingFlag.options ?? []),
                                        ]}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="rounded-xl border border-white/5 bg-ctp-mantle"
                        >
                            <div className="border-b border-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                                        <Layers
                                            size={20}
                                            className="text-accent"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-ctp-text">
                                            Rendering API
                                        </h3>
                                        <p className="text-xs text-ctp-subtext0">
                                            Select the graphics API for optimal
                                            performance
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating === renderingFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <RadioGroup
                                        value={currentRendering}
                                        onChange={(value) =>
                                            handleRenderingAPIChange(
                                                value as RenderingAPI,
                                            )
                                        }
                                        options={[
                                            ...(renderingFlag.options ?? []),
                                        ]}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-xl border border-white/5 bg-ctp-mantle"
                        >
                            <div className="border-b border-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                                        <Cloud
                                            size={20}
                                            className="text-accent"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-ctp-text">
                                            Sky & Shadows
                                        </h3>
                                        <p className="text-xs text-ctp-subtext0">
                                            Adjust sky and shadow settings
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 p-4">
                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating === graySkyFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <RadioGroup
                                        value={currentGraySky}
                                        onChange={(value) =>
                                            handleGraySkyChange(
                                                value as GraySky,
                                            )
                                        }
                                        options={[
                                            ...(graySkyFlag.options ?? []),
                                        ]}
                                    />
                                </div>

                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating === shadowFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <Checkbox
                                        checked={currentShadowIntensity}
                                        onChange={handleShadowToggle}
                                        label={shadowFlag.label}
                                        description={shadowFlag.description}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-xl border border-white/5 bg-ctp-mantle"
                        >
                            <div className="border-b border-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                                        <Cpu
                                            size={20}
                                            className="text-accent"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-ctp-text">
                                            Threading Settings
                                        </h3>
                                        <p className="text-xs text-ctp-subtext0">
                                            Configure CPU thread utilization
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 p-4">
                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating ===
                                            hyperThreadingFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <RadioGroup
                                        value={currentHyperThreading}
                                        onChange={(value) =>
                                            handleHyperThreadingChange(
                                                value as HyperThreading,
                                            )
                                        }
                                        options={[
                                            ...(hyperThreadingFlag.options ??
                                                []),
                                        ]}
                                    />
                                </div>

                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating === maxThreadsFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <Slider
                                        value={currentMaxThreads}
                                        min={maxThreadsFlag.min ?? 100}
                                        max={maxThreadsFlag.max ?? 4800}
                                        step={maxThreadsFlag.step ?? 100}
                                        onChange={(value) =>
                                            handleThreadCountChange(
                                                maxThreadsFlag.key,
                                                value,
                                            )
                                        }
                                        label={maxThreadsFlag.label}
                                        description={maxThreadsFlag.description}
                                    />
                                </div>

                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating === minThreadsFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <Slider
                                        value={currentMinThreads}
                                        min={minThreadsFlag.min ?? 1}
                                        max={minThreadsFlag.max ?? 12}
                                        step={minThreadsFlag.step ?? 1}
                                        onChange={(value) =>
                                            handleThreadCountChange(
                                                minThreadsFlag.key,
                                                value,
                                            )
                                        }
                                        label={minThreadsFlag.label}
                                        description={minThreadsFlag.description}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-xl border border-white/5 bg-ctp-mantle"
                        >
                            <div className="border-b border-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                                        <Radio
                                            size={20}
                                            className="text-accent"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-ctp-text">
                                            {telemetryFlag.label}
                                        </h3>
                                        <p className="text-xs text-ctp-subtext0">
                                            {telemetryFlag.description}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating === telemetryFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <RadioGroup
                                        value={currentTelemetry}
                                        onChange={(value) =>
                                            handleTelemetryChange(
                                                value as TelemetryMode,
                                            )
                                        }
                                        options={[
                                            ...(telemetryFlag.options ?? []),
                                        ]}
                                    />
                                </div>
                            </div>
                        </motion.div>

                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="rounded-xl border border-white/5 bg-ctp-mantle"
                        >
                            <div className="border-b border-white/5 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
                                        <Volume2
                                            size={20}
                                            className="text-accent"
                                        />
                                    </div>
                                    <div>
                                        <h3 className="text-sm font-medium text-ctp-text">
                                            Voice Chat
                                        </h3>
                                        <p className="text-xs text-ctp-subtext0">
                                            Adjust voice chat distance settings
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-6 p-4">
                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating ===
                                            voiceChatMinDistanceFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <Slider
                                        value={currentVoiceChatMinDistance}
                                        min={voiceChatMinDistanceFlag.min ?? 1}
                                        max={voiceChatMinDistanceFlag.max ?? 20}
                                        step={
                                            voiceChatMinDistanceFlag.step ?? 1
                                        }
                                        onChange={(value) =>
                                            handleSliderChange(
                                                voiceChatMinDistanceFlag.key,
                                                value,
                                            )
                                        }
                                        label={voiceChatMinDistanceFlag.label}
                                        description={
                                            voiceChatMinDistanceFlag.description
                                        }
                                        unit=" studs"
                                    />
                                </div>

                                <div className="relative">
                                    <AnimatePresence>
                                        {isUpdating ===
                                            voiceChatMaxDistanceFlag.key && (
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                exit={{ opacity: 0 }}
                                                className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-ctp-mantle/50"
                                            >
                                                <div className="h-5 w-5 animate-spin rounded-full border-2 border-accent border-t-transparent" />
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                    <Slider
                                        value={currentVoiceChatMaxDistance}
                                        min={voiceChatMaxDistanceFlag.min ?? 20}
                                        max={
                                            voiceChatMaxDistanceFlag.max ?? 150
                                        }
                                        step={
                                            voiceChatMaxDistanceFlag.step ?? 5
                                        }
                                        onChange={(value) =>
                                            handleSliderChange(
                                                voiceChatMaxDistanceFlag.key,
                                                value,
                                            )
                                        }
                                        label={voiceChatMaxDistanceFlag.label}
                                        description={
                                            voiceChatMaxDistanceFlag.description
                                        }
                                        unit=" studs"
                                    />
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

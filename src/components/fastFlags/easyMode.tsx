import React, { useState } from "react";
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
import {
    LightingTechnology,
    RenderingAPI,
    HyperThreading,
    GraySky,
    TelemetryMode,
    FastFlagManagerProps,
    FastFlagDefinition,
} from "../../types/fastFlags";

export const EasyMode: React.FC<FastFlagManagerProps> = ({
    profile,
    onUpdateFlag,
}) => {
    const [isUpdating, setIsUpdating] = useState<string | null>(null);

    const handleFlagChange = async (flag: FastFlagDefinition, value: any) => {
        try {
            setIsUpdating(flag.key);

            if (flag.relatedFlags) {
                if (typeof flag.relatedFlags === "function") {
                    await onUpdateFlag(flag.key, flag.relatedFlags(value));
                } else {
                    const updates: Record<string, string | null> = {};

                    Object.values(flag.relatedFlags).forEach((flags) => {
                        if (typeof flags === "object") {
                            Object.keys(flags).forEach((key) => {
                                updates[key] = null;
                            });
                        }
                    });

                    if (value !== "default" && flag.relatedFlags[value]) {
                        const flags = flag.relatedFlags[value];
                        Object.entries(flags).forEach(([key, val]) => {
                            updates[key] = String(val);
                        });
                    }

                    await onUpdateFlag(updates);
                }
            } else {
                await onUpdateFlag(flag.key, String(value));
            }

            toast.success(`${flag.label} updated`);
        } catch (error) {
            console.error(`Failed to update ${flag.key}:`, error);
            toast.error(`Failed to update ${flag.label}`);
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
    const hyperThreadingFlag = threadingFlags[0];
    const maxThreadsFlag = threadingFlags[1];
    const minThreadsFlag = threadingFlags[2];
    const telemetryFlag = telemetryFlags[0];
    const voiceChatMinDistanceFlag = voiceChatFlags[0];
    const voiceChatMaxDistanceFlag = voiceChatFlags[1];

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
    const currentVoiceChatMinDistance = Number(
        profile.flags[voiceChatMinDistanceFlag.key] ??
            voiceChatMinDistanceFlag.defaultValue,
    );
    const currentVoiceChatMaxDistance = Number(
        profile.flags[voiceChatMaxDistanceFlag.key] ??
            voiceChatMaxDistanceFlag.defaultValue,
    );

    const getCurrentValue = (flag: FastFlagDefinition) => {
        if (!flag.relatedFlags || typeof flag.relatedFlags === "function") {
            return profile.flags[flag.key] ?? flag.defaultValue;
        }

        for (const [value, flags] of Object.entries(flag.relatedFlags)) {
            const hasAllFlags = Object.entries(flags).every(
                ([flag, flagValue]) => profile.flags[flag] === flagValue,
            );
            if (hasAllFlags) return value;
        }
        return "default";
    };

    const currentLighting = getCurrentValue(lightingFlag) as LightingTechnology;
    const currentRendering = getCurrentValue(renderingFlag) as RenderingAPI;
    const currentHyperThreading = getCurrentValue(
        hyperThreadingFlag,
    ) as HyperThreading;
    const currentGraySky = getCurrentValue(graySkyFlag) as GraySky;
    const currentTelemetry = getCurrentValue(telemetryFlag) as TelemetryMode;

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
                                            handleFlagChange(fpsFlag, value)
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
                                            handleFlagChange(
                                                lightingFlag,
                                                value,
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
                                            handleFlagChange(
                                                renderingFlag,
                                                value,
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
                                            handleFlagChange(graySkyFlag, value)
                                        }
                                        options={[
                                            ...(graySkyFlag.options ?? []),
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
                                            handleFlagChange(
                                                hyperThreadingFlag,
                                                value,
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
                                        max={maxThreadsFlag.max ?? 2400}
                                        step={maxThreadsFlag.step ?? 100}
                                        onChange={(value) =>
                                            handleFlagChange(
                                                maxThreadsFlag,
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
                                            handleFlagChange(
                                                minThreadsFlag,
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
                                            handleFlagChange(
                                                telemetryFlag,
                                                value,
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
                                            handleFlagChange(
                                                voiceChatMinDistanceFlag,
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
                                            handleFlagChange(
                                                voiceChatMaxDistanceFlag,
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

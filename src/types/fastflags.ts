export interface FastFlag {
    key: string;
    value: string | number | boolean;
}

export interface FastFlagsProfile {
    id: string;
    name: string;
    flags: Record<string, string>;
    createdAt: string;
    updatedAt: string;
}

export interface FastFlagsState {
    profiles: FastFlagsProfile[];
    activeProfileId: string | null;
    isLoading: boolean;
    error: string | null;
}

export type FastFlagInputType = "checkbox" | "slider" | "radio" | "text";

export interface FastFlagOption {
    label: string;
    value: any;
    description?: string;
}

export interface FastFlagDefinition {
    key: string;
    label: string;
    description?: string;
    type: FastFlagInputType;
    defaultValue: any;
    options?: FastFlagOption[];
    min?: number;
    max?: number;
    step?: number;
    relatedFlags?: Record<string, any>;
}

export interface FastFlagCategory {
    id: string;
    label: string;
    description?: string;
    flags: FastFlagDefinition[];
}

export type LightingTechnology = "default" | "voxel" | "shadowmap" | "future";
export type RenderingAPI = "default" | "metal" | "vulkan" | "opengl";
export type HyperThreading = "default" | "enabled";
export type GraySky = "default" | "enabled";
export type TelemetryMode = "default" | "disabled";

export type NonDefaultLightingTechnology = Exclude<
    LightingTechnology,
    "default"
>;
export type NonDefaultRenderingAPI = Exclude<RenderingAPI, "default">;
export type NonDefaultHyperThreading = Exclude<HyperThreading, "default">;
export type NonDefaultGraySky = Exclude<GraySky, "default">;
export type NonDefaultTelemetryMode = Exclude<TelemetryMode, "default">;

export interface FastFlagManagerProps {
    profile: FastFlagsProfile;
    onUpdateFlag: (
        keyOrUpdates: string | Record<string, string | null>,
        value?: string | null,
    ) => Promise<void>;
    invalidFlags: string[];
    validationError?: string | null;
    validateSelectedProfileFlags?: () => Promise<void>;
}

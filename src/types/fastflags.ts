export interface FastFlag {
    key: string;
    value: string | number | boolean;
}

export interface FastFlagsProfile {
    id: string;
    name: string;
    flags: Record<string, any>;
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

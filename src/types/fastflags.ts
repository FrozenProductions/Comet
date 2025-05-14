export interface FastFlag {
    key: string;
    value: string | number | boolean;
}

export interface FastFlagsProfile {
    id: string;
    name: string;
    flags: Record<string, FastFlag["value"]>;
}

export interface FastFlagsState {
    profiles: FastFlagsProfile[];
    activeProfileId: string | null;
    isLoading: boolean;
    error: string | null;
}

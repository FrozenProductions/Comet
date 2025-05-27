export interface ScriptSearchParams {
    q: string;
    page?: number;
    max?: number;
    mode?: "free" | "paid";
    patched?: 0 | 1;
    key?: 0 | 1;
    universal?: 0 | 1;
    verified?: 0 | 1;
    sortBy?: "views" | "createdAt" | "updatedAt";
    order?: "asc" | "desc";
    strict?: boolean;
}

export interface Script {
    _id: string;
    title: string;
    game: {
        _id: string;
        name: string;
        imageUrl: string;
    };
    slug: string;
    verified: boolean;
    key: boolean;
    views: number;
    scriptType: string;
    isUniversal: boolean;
    isPatched: boolean;
    createdAt: string;
    updatedAt: string;
    image: string;
    script: string;
    matched?: string[];
}

export interface ScriptSearchResponse {
    result: {
        totalPages: number;
        scripts: Script[];
    };
}

export interface ScriptDetailResponse {
    script: {
        _id: string;
        title: string;
        game: {
            _id: string;
            name: string;
            imageUrl: string;
        };
        slug: string;
        script: string;
        verified: boolean;
        key: boolean;
        views: number;
        scriptType: string;
        isUniversal: boolean;
        isPatched: boolean;
        createdAt: string;
        updatedAt: string;
    };
}

export type FilterOption = {
    label: string;
    value: string;
    icon: React.ReactNode;
};

export interface ScriptCardProps {
    script: Script;
    onSelect: (script: Script) => void;
}

export interface ScriptSearchState {
    scripts: Script[];
    isLoading: boolean;
    isSearching: boolean;
    error: string | null;
    isApiDown: boolean;
    totalPages: number;
    currentPage: number;
}

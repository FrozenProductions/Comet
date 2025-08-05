export type ExecutionRecord = {
    id: string;
    timestamp: number;
    content: string;
    success: boolean;
    error?: string;
};

export type ExecutionHistoryContextType = {
    history: ExecutionRecord[];
    addExecution: (
        execution: Omit<ExecutionRecord, "id" | "timestamp">,
    ) => void;
    clearHistory: () => void;
};

export type ExecutionOptions = {
    content?: string;
    showToast?: boolean;
    toastId?: string;
};

export type ExecutionResult = {
    success: boolean;
    error?: string;
    content: string;
};

export type ExecuteContextType = {
    isExecuting: boolean;
    execute: (script: string) => Promise<void>;
};

export type ExecutionHistoryProps = {
    isVisible: boolean;
    onClose: () => void;
};

export type ExecutionHistoryState = {
    position: {
        x: number;
        y: number;
    };
    size: {
        width: number;
        height: number;
    };
};

export type StatusFilter = "all" | "success" | "error";

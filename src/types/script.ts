export interface ScriptExecutionOptions {
    content?: string;
    showToast?: boolean;
    toastId?: string;
}

export interface ScriptExecutionResult {
    success: boolean;
    error?: string;
}

export interface ScriptTab {
    id: string;
    name: string;
    content: string;
    path?: string;
    isModified?: boolean;
}

export interface ExecuteContextType {
    isExecuting: boolean;
    execute: (script: string) => Promise<void>;
}

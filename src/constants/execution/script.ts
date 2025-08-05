export const SCRIPT_TOAST_IDS = {
    EXECUTE: "execute-script-toast",
    SAVE: "save-script-toast",
    ERROR: "script-error-toast",
} as const;

export const SCRIPT_MESSAGES = {
    NO_SCRIPT: "No script to execute",
    EMPTY_SCRIPT: "Cannot execute empty script",
    EXECUTION_SUCCESS: "Executing script...",
    EXECUTION_ERROR: "Failed to execute script",
    SAVE_SUCCESS: "Script saved successfully",
    SAVE_ERROR: "Failed to save script",
} as const;

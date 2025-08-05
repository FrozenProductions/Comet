import type {
    ExecutionHistoryState,
    StatusFilter,
} from "../../types/execution/executionHistory";
import type { SelectOption } from "../../types/ui/select";

export const EXECUTION_HISTORY_STORAGE_KEY = "execution-history-state";

export const DEFAULT_EXECUTION_HISTORY_STATE: ExecutionHistoryState = {
    position: {
        x: 20,
        y: 20,
    },
    size: {
        width: 600,
        height: 400,
    },
};

export const STATUS_FILTER_OPTIONS: SelectOption[] = [
    { value: "all", label: "All" },
    { value: "success", label: "Success" },
    { value: "error", label: "Error" },
] satisfies { value: StatusFilter; label: string }[];

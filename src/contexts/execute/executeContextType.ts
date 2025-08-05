import { createContext } from "react";
import type { ExecuteContextType } from "../../types/execution/script";

export const ExecuteContext = createContext<ExecuteContextType | undefined>(
    undefined,
);

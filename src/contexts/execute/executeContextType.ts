import { createContext } from "react";
import { ExecuteContextType } from "../../types/script";

export const ExecuteContext = createContext<ExecuteContextType | undefined>(
    undefined
);

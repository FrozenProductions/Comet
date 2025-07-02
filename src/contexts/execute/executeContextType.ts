import { createContext } from "react";
import type { ExecuteContextType } from "../../types/script";

export const ExecuteContext = createContext<ExecuteContextType | undefined>(
	undefined,
);

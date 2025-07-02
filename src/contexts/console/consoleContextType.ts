import { createContext } from "react";
import type { ConsoleContextType } from "../../types/console";

export const ConsoleContext = createContext<ConsoleContextType | undefined>(
	undefined,
);

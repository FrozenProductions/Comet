import { createContext } from "react";
import { ConsoleContextType } from "../../types/console";

export const ConsoleContext = createContext<ConsoleContextType | undefined>(
	undefined,
);

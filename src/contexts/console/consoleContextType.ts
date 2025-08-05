import { createContext } from "react";
import type { ConsoleContextType } from "../../types/ui/console";

export const ConsoleContext = createContext<ConsoleContextType | undefined>(
    undefined,
);

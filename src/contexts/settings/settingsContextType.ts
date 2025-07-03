import { createContext } from "react";
import type { SettingsContextType } from "../../types/core/settings";

export const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined,
);

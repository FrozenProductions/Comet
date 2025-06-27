import { createContext } from "react";
import { SettingsContextType } from "../../types/settings";

export const SettingsContext = createContext<SettingsContextType | undefined>(
	undefined,
);

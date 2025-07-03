import { Code, Flag, Library, Settings, Syringe } from "lucide-react";
import type { SidebarItem } from "../types/ui/sidebar";

export const MAIN_SCREENS: SidebarItem[] = [
	{ id: "Editor", icon: Code, label: "Code Editor" },
	{ id: "Settings", icon: Settings, label: "Settings" },
	{ id: "Library", icon: Library, label: "Script Library" },
	{ id: "AutoExecution", icon: Syringe, label: "Auto Execution" },
	{ id: "FastFlags", icon: Flag, label: "Fast Flags" },
] as const;

export const BUTTON_SPACING = 50 as const;

export const SIDEBAR_STORAGE_KEY = "comet-sidebar-visible" as const;

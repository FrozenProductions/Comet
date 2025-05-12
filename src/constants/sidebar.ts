import { Code, Settings, Library, User, Syringe } from "lucide-react";
import type { SidebarItem } from "../types/sidebar";

export const MAIN_SCREENS: SidebarItem[] = [
    { id: "Editor", icon: Code, label: "Code Editor" },
    { id: "Settings", icon: Settings, label: "Settings" },
    { id: "Library", icon: Library, label: "Script Library" },
    { id: "AutoExecution", icon: Syringe, label: "Auto Execution" },
    { id: "Profile", icon: User, label: "Profile" },
];

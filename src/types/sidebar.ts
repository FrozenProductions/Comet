import { LucideIcon } from "lucide-react";

export type Screen =
    | "Editor"
    | "Settings"
    | "Library"
    | "Profile"
    | "AutoExecution";

export interface SidebarProps {
    activeScreen: Screen;
    onScreenChange: (screen: Screen) => void;
}

export interface SidebarItem {
    id: Screen;
    icon: LucideIcon;
    label: string;
}

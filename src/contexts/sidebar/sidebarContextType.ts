import React from "react";

export interface SidebarState {
	isVisible: boolean;
	toggleSidebar: () => void;
}

export const SidebarContext = React.createContext<SidebarState | null>(null);
